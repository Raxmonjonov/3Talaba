"""
DRF API Views for Onboarding State Machine, Adaptive Study Plan Generator,
and AI Practice & Band-Score Evaluation.
"""

from datetime import date
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    ExamType,
    OnboardingState,
    OnboardingStep,
    PracticeTest,
    Question,
    StudyPlan,
    StudyPlanModule,
    Submission,
    User,
)
from .permissions import (
    HasDailyPracticeQuota,
    IsOnboardingCompleted,
    IsPremiumSubscriber,
    consume_user_quota,
)
from .services import AdaptiveStudyPlanGenerator, AIPracticeEvaluator


# ============================================================================
# 1. AUTHENTICATION (Google OAuth2 -> JWT Exchange)
# ============================================================================

class GoogleOAuth2LoginView(APIView):
    """
    POST /api/v1/auth/google/
    Verifies Google OAuth2 ID token / profile payload, provisions User + OnboardingState,
    and returns SimpleJWT access/refresh tokens alongside onboarding status.
    """

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        email = str(request.data.get("email", "")).strip().lower()
        google_id = str(request.data.get("google_id", "")).strip()
        full_name = str(request.data.get("full_name", "")).strip()
        avatar_url = request.data.get("avatar_url")

        if not email or not google_id:
            return Response(
                {"detail": "Both email and google_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "google_oauth_id": google_id,
                "full_name": full_name,
                "avatar_url": avatar_url,
                "auth_provider": "google",
            },
        )
        if not created and not user.google_oauth_id:
            user.google_oauth_id = google_id
            user.save(update_fields=["google_oauth_id"])

        onboarding, _ = OnboardingState.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "subscription_tier": user.subscription_tier,
                    "is_premium": user.is_premium_active,
                },
                "onboarding": {
                    "is_completed": onboarding.is_completed,
                    "current_step": onboarding.current_step,
                },
            },
            status=status.HTTP_200_OK,
        )


# ============================================================================
# 2. ONBOARDING & DIAGNOSTIC STATE MACHINE ENDPOINTS
# ============================================================================

class OnboardingStateView(APIView):
    """
    GET /api/v1/onboarding/state/
    Returns the user's current onboarding step, selected target score, and exam date.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        state, _ = OnboardingState.objects.get_or_create(user=request.user)
        return Response(
            {
                "current_step": state.current_step,
                "is_completed": state.is_completed,
                "exam_type": state.exam_type,
                "target_score": state.target_score,
                "baseline_score": state.baseline_score,
                "exam_date": state.exam_date,
                "daily_study_minutes": state.daily_study_minutes,
            }
        )


class OnboardingGoalSelectionView(APIView):
    """
    POST /api/v1/onboarding/goals/
    Step 1 -> Step 2: Saves target exam, target score, exam date, and daily study time.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        state, _ = OnboardingState.objects.get_or_create(user=request.user)

        exam_type = request.data.get("exam_type", ExamType.IELTS_ACADEMIC)
        target_score = request.data.get("target_score")
        exam_date_raw = request.data.get("exam_date")
        daily_minutes = int(request.data.get("daily_study_minutes", 60))

        if not target_score or not exam_date_raw:
            return Response(
                {"detail": "target_score and exam_date are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            parsed_date = date.fromisoformat(str(exam_date_raw))
            if parsed_date <= date.today():
                return Response(
                    {"detail": "exam_date must be a future date."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            state.exam_type = exam_type
            state.target_score = Decimal(str(target_score))
            state.exam_date = parsed_date
            state.daily_study_minutes = daily_minutes
            state.transition_to(OnboardingStep.GOAL_SELECTED)
        except (ValueError, ValidationError) as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "current_step": state.current_step,
                "exam_type": state.exam_type,
                "target_score": state.target_score,
                "exam_date": state.exam_date,
            }
        )


class OnboardingDiagnosticStartView(APIView):
    """
    POST /api/v1/onboarding/diagnostic/start/
    Step 2 -> Step 3: Provisions a short diagnostic test for the user's chosen exam_type.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        state, _ = OnboardingState.objects.get_or_create(user=request.user)

        diagnostic_test = (
            PracticeTest.objects.filter(
                exam_type=state.exam_type or ExamType.IELTS_ACADEMIC,
                is_diagnostic=True,
                is_published=True,
            )
            .prefetch_related("questions")
            .first()
        )
        if not diagnostic_test:
            return Response(
                {"detail": "No diagnostic test configured for this exam type."},
                status=status.HTTP_404_NOT_FOUND,
            )

        submission = Submission.objects.create(
            user=request.user,
            practice_test=diagnostic_test,
            status=Submission.SubmissionStatus.IN_PROGRESS,
        )
        state.diagnostic_submission = submission

        try:
            if state.current_step != OnboardingStep.DIAGNOSTIC_IN_PROGRESS:
                state.transition_to(OnboardingStep.DIAGNOSTIC_IN_PROGRESS)
            else:
                state.save(update_fields=["diagnostic_submission"])
        except ValidationError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        questions_data = [
            {
                "id": str(q.id),
                "order_index": q.order_index,
                "section": q.section,
                "question_format": q.question_format,
                "topic_tag": q.topic_tag,
                "passage_text": q.passage_text,
                "audio_url": q.audio_url,
                "prompt_text": q.prompt_text,
                "options": q.options_json,
            }
            for q in diagnostic_test.questions.all()
        ]

        return Response(
            {
                "submission_id": str(submission.id),
                "current_step": state.current_step,
                "diagnostic_test": {
                    "id": str(diagnostic_test.id),
                    "title": diagnostic_test.title,
                    "duration_minutes": diagnostic_test.duration_minutes,
                    "questions": questions_data,
                },
            }
        )


class OnboardingDiagnosticSubmitView(APIView):
    """
    POST /api/v1/onboarding/diagnostic/submit/
    Step 3 -> Step 4 -> Step 5 (COMPLETED):
    Evaluates the diagnostic submission, generates the Adaptive Study Plan,
    and unlocks the main dashboard.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        state, _ = OnboardingState.objects.get_or_create(user=request.user)
        submission = state.diagnostic_submission
        if not submission:
            return Response(
                {"detail": "No active diagnostic submission found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers = request.data.get("answers", [])
        evaluated_sub = AIPracticeEvaluator.evaluate_submission(
            submission=submission,
            answers_payload=answers,
        )

        try:
            state.transition_to(OnboardingStep.DIAGNOSTIC_COMPLETED)
            study_plan = AdaptiveStudyPlanGenerator.generate_from_onboarding(state)
        except ValidationError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "onboarding_step": state.current_step,
                "is_completed": state.is_completed,
                "diagnostic_result": {
                    "overall_score": evaluated_sub.overall_score,
                    "section_scores": evaluated_sub.section_scores_json,
                },
                "study_plan_id": str(study_plan.id),
                "priority_focus_areas": study_plan.priority_focus_areas,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================================
# 3. ADAPTIVE STUDY PLAN & PRACTICE ENDPOINTS (Protected by Onboarding + RBAC)
# ============================================================================

class CurrentStudyPlanView(APIView):
    """
    GET /api/v1/study-plan/current/
    Returns the user's active adaptive study plan with daily/weekly module checklists.
    Requires completed onboarding.
    """

    permission_classes = [IsAuthenticated, IsOnboardingCompleted]

    def get(self, request: Request) -> Response:
        plan = (
            StudyPlan.objects.filter(user=request.user, is_active=True)
            .prefetch_related("modules")
            .first()
        )
        if not plan:
            return Response(
                {"detail": "No active study plan found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        modules = [
            {
                "id": str(m.id),
                "week_number": m.week_number,
                "day_of_week": m.day_of_week,
                "scheduled_date": m.scheduled_date,
                "section": m.section,
                "title": m.title,
                "topic_focus": m.topic_focus,
                "estimated_minutes": m.estimated_minutes,
                "status": m.status,
                "practice_test_id": str(m.practice_test_id) if m.practice_test_id else None,
            }
            for m in plan.modules.all()
        ]

        return Response(
            {
                "id": str(plan.id),
                "exam_type": plan.exam_type,
                "baseline_score": plan.baseline_score,
                "target_score": plan.target_score,
                "target_exam_date": plan.target_exam_date,
                "total_weeks": plan.total_weeks,
                "section_diagnostics": plan.section_diagnostics_json,
                "priority_focus_areas": plan.priority_focus_areas,
                "modules": modules,
            }
        )


class PracticeSubmissionView(APIView):
    """
    POST /api/v1/practice/tests/<uuid:test_id>/submit/
    Evaluates Reading/Listening answers deterministically and dispatches Writing/Speaking
    to the AI evaluator. Enforces Free tier daily quota vs. Premium unlimited access.
    """

    permission_classes = [IsAuthenticated, IsOnboardingCompleted, HasDailyPracticeQuota]

    def post(self, request: Request, test_id) -> Response:
        practice_test = get_object_or_404(
            PracticeTest.objects.prefetch_related("questions"),
            pk=test_id,
            is_published=True,
        )
        self.check_object_permissions(request, practice_test)

        # Atomically verify & increment Free tier daily practice quota
        consume_user_quota(request.user.id, quota_type="practice")

        # If test includes Writing or Speaking AI evaluation, also check AI eval quota
        has_subjective = any(
            q.question_format in (Question.QuestionFormat.ESSAY_PROMPT, Question.QuestionFormat.SPEAKING_PROMPT)
            for q in practice_test.questions.all()
        )
        if has_subjective:
            consume_user_quota(request.user.id, quota_type="ai_eval")

        module_id = request.data.get("study_plan_module_id")
        linked_module = (
            StudyPlanModule.objects.filter(
                pk=module_id, study_plan__user=request.user
            ).first()
            if module_id
            else None
        )

        submission = Submission.objects.create(
            user=request.user,
            practice_test=practice_test,
            study_plan_module=linked_module,
            time_spent_seconds=int(request.data.get("time_spent_seconds", 0)),
        )

        evaluated = AIPracticeEvaluator.evaluate_submission(
            submission=submission,
            answers_payload=request.data.get("answers", []),
        )

        responses_breakdown = [
            {
                "question_id": str(r.question_id),
                "is_correct": r.is_correct,
                "estimated_band_score": r.estimated_band_score,
                "ai_evaluation": r.ai_evaluation_json,
            }
            for r in evaluated.responses.all()
        ]

        return Response(
            {
                "submission_id": str(evaluated.id),
                "status": evaluated.status,
                "overall_score": evaluated.overall_score,
                "section_scores": evaluated.section_scores_json,
                "responses": responses_breakdown,
            },
            status=status.HTTP_201_CREATED,
        )


class PremiumFullMockTestsView(APIView):
    """
    GET /api/v1/practice/premium-mocks/
    Exclusive endpoint for full-length adaptive mock exams (requires Premium tier).
    """

    permission_classes = [IsAuthenticated, IsOnboardingCompleted, IsPremiumSubscriber]

    def get(self, request: Request) -> Response:
        mocks = PracticeTest.objects.filter(is_premium_only=True, is_published=True)
        return Response(
            [
                {
                    "id": str(m.id),
                    "slug": m.slug,
                    "title": m.title,
                    "exam_type": m.exam_type,
                    "section": m.section,
                    "duration_minutes": m.duration_minutes,
                }
                for m in mocks
            ]
        )
