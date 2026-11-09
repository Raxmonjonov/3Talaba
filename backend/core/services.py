"""
Core Domain Services:
1. AdaptiveStudyPlanGenerator: Converts diagnostic results into a weighted daily/weekly study plan.
2. AIPracticeEvaluator: Grades objective questions and invokes LLM rubric evaluation for Writing/Speaking.
"""

from datetime import date, timedelta
from decimal import Decimal
import json
import os
from typing import Any
from urllib import request as urllib_request
from django.db import transaction
from django.utils import timezone

from .models import (
    ExamSection,
    ExamType,
    OnboardingState,
    OnboardingStep,
    PracticeTest,
    Question,
    QuestionResponse,
    StudyPlan,
    StudyPlanModule,
    Submission,
)


# ============================================================================
# 1. ADAPTIVE STUDY PLAN GENERATOR
# ============================================================================

class AdaptiveStudyPlanGenerator:
    """
    Generates a personalized weekly/daily module checklist based on:
    - Diagnostic section scores vs. target score
    - Weakest topic tags identified during the diagnostic test
    - Days remaining until the user's exam_date
    """

    DEFAULT_IELTS_SECTIONS = [
        ExamSection.LISTENING,
        ExamSection.READING,
        ExamSection.WRITING,
        ExamSection.SPEAKING,
    ]
    DEFAULT_SAT_SECTIONS = [
        ExamSection.SAT_RW,
        ExamSection.SAT_MATH,
    ]

    @classmethod
    @transaction.atomic
    def generate_from_onboarding(cls, onboarding: OnboardingState) -> StudyPlan:
        submission = onboarding.diagnostic_submission
        if not submission or submission.status != Submission.SubmissionStatus.EVALUATED:
            raise ValueError("Evaluated diagnostic submission is required to generate a study plan.")

        user = onboarding.user
        exam_type = onboarding.exam_type or ExamType.IELTS_ACADEMIC
        target_score = onboarding.target_score or Decimal("7.5")
        baseline_score = submission.overall_score or Decimal("5.5")
        exam_date = onboarding.exam_date or (timezone.localdate() + timedelta(days=28))

        # Deactivate any prior active plans for this user
        StudyPlan.objects.filter(user=user, is_active=True).update(is_active=False)

        days_until_exam = max(7, (exam_date - timezone.localdate()).days)
        total_weeks = max(1, min(16, (days_until_exam + 6) // 7))

        section_scores: dict[str, float] = submission.section_scores_json or {}
        sections = (
            cls.DEFAULT_SAT_SECTIONS
            if exam_type == ExamType.DIGITAL_SAT
            else cls.DEFAULT_IELTS_SECTIONS
        )

        # Rank sections from weakest (lowest score) to strongest
        sorted_sections = sorted(
            sections,
            key=lambda sec: float(section_scores.get(sec, float(baseline_score))),
        )

        # Identify missed topics from diagnostic responses
        weak_topics = list(
            submission.responses.filter(is_correct=False)
            .select_related("question")
            .values_list("question__topic_tag", flat=True)
            .distinct()
        )
        if not weak_topics:
            weak_topics = ["Core Strategy & Time Management", "High-Yield Question Types"]

        study_plan = StudyPlan.objects.create(
            user=user,
            exam_type=exam_type,
            is_active=True,
            baseline_score=baseline_score,
            target_score=target_score,
            target_exam_date=exam_date,
            total_weeks=total_weeks,
            section_diagnostics_json=section_scores,
            priority_focus_areas=weak_topics[:8],
        )

        # Build weighted schedule: Weakest sections get 2x frequency in early weeks
        weighted_rotation: list[str] = []
        for idx, sec in enumerate(sorted_sections):
            weight = 3 if idx == 0 else (2 if idx == 1 else 1)
            weighted_rotation.extend([sec] * weight)

        start_date: date = timezone.localdate()
        modules_to_create: list[StudyPlanModule] = []
        rotation_cursor = 0

        for week in range(1, total_weeks + 1):
            for day in range(1, 7):  # 6 active study days per week, Day 7 = rest/review
                scheduled_day = start_date + timedelta(days=(week - 1) * 7 + (day - 1))
                section = weighted_rotation[rotation_cursor % len(weighted_rotation)]
                topic = weak_topics[rotation_cursor % len(weak_topics)]
                rotation_cursor += 1

                # Match a relevant practice drill if available
                matched_test = (
                    PracticeTest.objects.filter(
                        exam_type=exam_type,
                        section=section,
                        is_diagnostic=False,
                        is_published=True,
                    )
                    .order_by("difficulty_level")
                    .first()
                )

                modules_to_create.append(
                    StudyPlanModule(
                        study_plan=study_plan,
                        week_number=week,
                        day_of_week=day,
                        scheduled_date=scheduled_day,
                        section=section,
                        title=f"Week {week} Day {day}: {section} — {topic}",
                        topic_focus=topic,
                        estimated_minutes=onboarding.daily_study_minutes,
                        practice_test=matched_test,
                        status=(
                            StudyPlanModule.ModuleStatus.PENDING
                            if week == 1
                            else StudyPlanModule.ModuleStatus.LOCKED
                        ),
                    )
                )

        StudyPlanModule.objects.bulk_create(modules_to_create)

        # Advance onboarding state machine to COMPLETED
        onboarding.baseline_score = baseline_score
        onboarding.save(update_fields=["baseline_score"])
        onboarding.transition_to(OnboardingStep.COMPLETED)

        return study_plan


# ============================================================================
# 2. AI PRACTICE EVALUATOR (Deterministic + LLM Band Estimation)
# ============================================================================

class AIPracticeEvaluator:
    """
    Evaluates a user's Submission:
    - Objective questions (Reading, Listening, SAT Math/RW): graded deterministically.
    - Subjective questions (Writing Essay, Speaking Transcript): sent to LLM API for
      criterion-by-criterion IELTS Band (0.0-9.0) or SAT rubric evaluation.
    """

    @classmethod
    @transaction.atomic
    def evaluate_submission(
        cls,
        submission: Submission,
        answers_payload: list[dict[str, Any]],
    ) -> Submission:
        questions_map: dict[str, Question] = {
            str(q.id): q for q in submission.practice_test.questions.all()
        }

        section_buckets: dict[str, list[float]] = {}

        for item in answers_payload:
            q_id = str(item.get("question_id", ""))
            question = questions_map.get(q_id)
            if not question:
                continue

            raw_answer = str(item.get("answer_text", "")).strip()
            speaking_url = item.get("speaking_audio_url")

            if question.question_format in (
                Question.QuestionFormat.MULTIPLE_CHOICE,
                Question.QuestionFormat.FILL_IN_BLANK,
            ):
                is_correct = (
                    raw_answer.lower() == question.correct_answer.strip().lower()
                )
                # Convert objective accuracy to approximate scale (9.0 for IELTS, 800 for SAT)
                max_scale = (
                    800.0
                    if submission.practice_test.exam_type == ExamType.DIGITAL_SAT
                    else 9.0
                )
                numeric_score = max_scale if is_correct else (200.0 if max_scale == 800.0 else 4.0)

                QuestionResponse.objects.update_or_create(
                    submission=submission,
                    question=question,
                    defaults={
                        "answer_text": raw_answer,
                        "is_correct": is_correct,
                        "estimated_band_score": Decimal(str(round(numeric_score, 1))),
                        "evaluated_at": timezone.now(),
                    },
                )
                section_buckets.setdefault(question.section, []).append(numeric_score)

            else:
                # Subjective AI Evaluation (Writing / Speaking)
                ai_result = cls._call_llm_band_evaluator(
                    question=question,
                    user_response_text=raw_answer,
                    exam_type=submission.practice_test.exam_type,
                )
                band = float(ai_result.get("overall_band", 6.0))
                QuestionResponse.objects.update_or_create(
                    submission=submission,
                    question=question,
                    defaults={
                        "answer_text": raw_answer,
                        "speaking_audio_url": speaking_url,
                        "estimated_band_score": Decimal(str(round(band, 1))),
                        "ai_evaluation_json": ai_result,
                        "evaluated_at": timezone.now(),
                    },
                )
                section_buckets.setdefault(question.section, []).append(band)

        # Compute aggregated section & overall scores
        section_averages: dict[str, float] = {}
        for sec, scores in section_buckets.items():
            avg = sum(scores) / len(scores)
            # Round IELTS bands to nearest 0.5
            if submission.practice_test.exam_type != ExamType.DIGITAL_SAT:
                avg = round(avg * 2) / 2
            else:
                avg = round(avg, -1)
            section_averages[sec] = avg

        if section_averages:
            if submission.practice_test.exam_type == ExamType.DIGITAL_SAT:
                overall = sum(section_averages.values())
            else:
                raw_overall = sum(section_averages.values()) / len(section_averages)
                overall = round(raw_overall * 2) / 2
        else:
            overall = 0.0

        submission.section_scores_json = section_averages
        submission.overall_score = Decimal(str(overall))
        submission.status = Submission.SubmissionStatus.EVALUATED
        submission.completed_at = timezone.now()
        submission.save()

        # Mark linked StudyPlanModule completed if applicable
        if submission.study_plan_module:
            submission.study_plan_module.status = StudyPlanModule.ModuleStatus.COMPLETED
            submission.study_plan_module.completed_at = timezone.now()
            submission.study_plan_module.save(update_fields=["status", "completed_at"])

        return submission

    @classmethod
    def _call_llm_band_evaluator(
        cls,
        question: Question,
        user_response_text: str,
        exam_type: str,
    ) -> dict[str, Any]:
        """
        Dispatches Writing/Speaking response to OpenAI / Gemini API with structured
        JSON output adhering to official IELTS Band Descriptors.
        Falls back to deterministic heuristic scoring if API key is not configured.
        """
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        word_count = len(user_response_text.split())

        system_prompt = (
            "You are a certified senior IELTS/SAT examiner. Evaluate the student's "
            f"{question.section} response strictly against official band descriptors. "
            "Return ONLY valid JSON with keys: "
            "'overall_band' (float in 0.5 increments between 1.0 and 9.0), "
            "'criteria_scores' (object with 'task_achievement', 'coherence_cohesion', "
            "'lexical_resource', 'grammatical_range'), "
            "'strengths' (list of strings), 'weaknesses' (list of strings), "
            "and 'improved_sample' (string)."
        )

        if api_key and word_count >= 10:
            try:
                payload = json.dumps(
                    {
                        "model": "gpt-4o-mini",
                        "response_format": {"type": "json_object"},
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {
                                "role": "user",
                                "content": (
                                    f"Prompt: {question.prompt_text}\n\n"
                                    f"Student Response ({word_count} words):\n{user_response_text}"
                                ),
                            },
                        ],
                        "temperature": 0.2,
                    }
                ).encode("utf-8")

                req = urllib_request.Request(
                    "https://api.openai.com/v1/chat/completions",
                    data=payload,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    method="POST",
                )
                with urllib_request.urlopen(req, timeout=20) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    content = body["choices"][0]["message"]["content"]
                    return json.loads(content)
            except Exception:
                pass

        # Deterministic heuristic fallback when offline or testing
        estimated = 6.5 if word_count >= 150 else (5.5 if word_count >= 60 else 4.5)
        return {
            "overall_band": estimated,
            "word_count": word_count,
            "criteria_scores": {
                "task_achievement": estimated,
                "coherence_cohesion": estimated,
                "lexical_resource": estimated,
                "grammatical_range": estimated,
            },
            "strengths": [
                "Addresses the core prompt topic.",
                "Maintains logical paragraph progression.",
            ],
            "weaknesses": [
                "Expand academic collocations and complex sentence structures.",
                "Provide more specific supporting examples.",
            ],
            "improved_sample": (
                "Ensure each body paragraph opens with a clear topic sentence "
                "followed by a concrete real-world example."
            ),
        }
