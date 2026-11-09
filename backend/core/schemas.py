"""
Phase 1 & 3: Strict Typed Schemas (Django Ninja / Pydantic v2)
Enforces exact Structured Output JSON schema for:
- Real-Time AI Writing & Speaking Examiner (`EssayEvaluationSchema`)
- Live ExamSession State Synchronization (Inspera / Bluebook)
- Dynamic Micro-Adaptive Roadmap Recalculation
"""

from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator


def _validate_half_band_increment(value: float) -> float:
    rounded = round(float(value) * 2) / 2
    if rounded < 1.0 or rounded > 9.0:
        raise ValueError("IELTS Band score must be between 1.0 and 9.0.")
    return rounded


class CriterionDetailSchema(BaseModel):
    score: float = Field(
        ...,
        ge=1.0,
        le=9.0,
        description="Official IELTS criterion band score in 0.5 increments (1.0 - 9.0).",
    )
    strengths: list[str] = Field(
        ...,
        min_length=1,
        description="Specific strengths observed in the candidate's essay for this criterion.",
    )
    weaknesses: list[str] = Field(
        ...,
        min_length=1,
        description="Specific weaknesses or penalties applied for this criterion.",
    )

    @field_validator("score")
    @classmethod
    def enforce_half_band(cls, v: float) -> float:
        return _validate_half_band_increment(v)


class CriteriaObjectSchema(BaseModel):
    TR: CriterionDetailSchema = Field(
        ..., description="Task Response (Task 2) / Task Achievement (Task 1)"
    )
    CC: CriterionDetailSchema = Field(
        ..., description="Coherence and Cohesion"
    )
    LR: CriterionDetailSchema = Field(
        ..., description="Lexical Resource"
    )
    GRA: CriterionDetailSchema = Field(
        ..., description="Grammatical Range and Accuracy"
    )


class ExaminerInlineCorrectionSchema(BaseModel):
    exact_original_quote: str = Field(
        ...,
        min_length=2,
        description="Verbatim substring extracted character-for-character from the candidate's essay.",
    )
    error_category: Literal["GRAMMAR", "LEXICAL", "COHESION"] = Field(
        ...,
        description="Category of the issue: GRAMMAR (Red), LEXICAL (Amber), or COHESION (Purple).",
    )
    corrected_version: str = Field(
        ...,
        min_length=2,
        description="Direct grammatical, lexical, or cohesive correction that fits seamlessly in context.",
    )
    band_9_academic_upgrade: str = Field(
        ...,
        min_length=2,
        description="Advanced C1/C2 Band 9.0 academic collocation or syntactic upgrade.",
    )
    explanation_in_uzbek: str = Field(
        ...,
        min_length=10,
        description="Detailed pedagogical explanation in Uzbek explaining why the original phrase loses marks and how the upgrade improves the band score.",
    )


class EssayEvaluationSchema(BaseModel):
    """
    Strict Structured Output Schema required for the AI IELTS Writing Examiner.
    Passed directly to OpenAI `response_format` / Anthropic Claude structured tool schema.
    """

    overall_band: float = Field(
        ...,
        ge=1.0,
        le=9.0,
        description="Overall IELTS Writing Band Score (0.5 increments, arithmetic mean of TR, CC, LR, GRA rounded to nearest 0.5).",
    )
    criteria: CriteriaObjectSchema = Field(
        ...,
        description="Detailed score, strengths, and weaknesses for TR, CC, LR, and GRA.",
    )
    inline_corrections: list[ExaminerInlineCorrectionSchema] = Field(
        ...,
        description="Inline sentence/phrase-level corrections mapped to exact substrings in the essay.",
    )
    band_8_5_full_rewrite: str = Field(
        ...,
        min_length=50,
        description="The candidate's complete essay rewritten at an authentic Band 8.5+ academic level while preserving their core arguments and structure.",
    )
    actionable_drills_uz: list[str] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Exactly 3 concrete, actionable study drills in Uzbek targeting the candidate's weakest criterion.",
    )

    @field_validator("overall_band")
    @classmethod
    def enforce_overall_half_band(cls, v: float) -> float:
        return _validate_half_band_increment(v)


class GradeWritingRequestSchema(BaseModel):
    task_type: Literal["WRITING_TASK_1", "WRITING_TASK_2"] = "WRITING_TASK_2"
    prompt_text: str = Field(..., min_length=10)
    essay_text: str = Field(..., min_length=15)
    exam_session_id: str | None = None
    target_band: float = Field(default=7.5, ge=5.0, le=9.0)


# Legacy / Compatible Schemas used across other simulator views
class CriteriaScoresSchema(BaseModel):
    task_response: float = Field(..., ge=1.0, le=9.0)
    coherence_cohesion: float = Field(..., ge=1.0, le=9.0)
    lexical_resource: float = Field(..., ge=1.0, le=9.0)
    grammatical_range: float = Field(..., ge=1.0, le=9.0)


class InlineCorrectionSchema(BaseModel):
    original_phrase: str
    improved_phrase: str
    band_9_synonym: str
    category: Literal["GRAMMAR", "LEXICAL", "COHESION", "TASK_RESPONSE"] = "LEXICAL"
    reason: str
    reason_uz: str


class IELTSExaminerResponseSchema(BaseModel):
    overall_band: float = Field(..., ge=1.0, le=9.0)
    criteria_scores: CriteriaScoresSchema
    examiner_summary_en: str
    examiner_summary_uz: str
    inline_corrections: list[InlineCorrectionSchema]
    actionable_next_steps: list[str]
    recommended_adaptive_node_slug: str = "writing-task2-cohesion"


class EssayGradingRequestSchema(BaseModel):
    task_type: Literal["WRITING_TASK_1", "WRITING_TASK_2"] = "WRITING_TASK_2"
    prompt_text: str
    essay_text: str = Field(..., min_length=20)
    exam_session_id: str | None = None
    target_band: float = 7.5


class HighlightRangeSchema(BaseModel):
    id: str
    start: int
    end: int
    text: str
    color: Literal["yellow", "green"] = "yellow"
    note: str | None = None


class ExamSessionSyncSchema(BaseModel):
    remaining_seconds: int = Field(..., ge=0)
    highlighted_ranges: list[HighlightRangeSchema] = []
    flagged_questions: list[str] = []
    strikethrough_options: dict[str, list[str]] = {}
    draft_answers: dict[str, str] = {}


class AdaptiveRemediationResultSchema(BaseModel):
    failed_node_slug: str
    new_mastery_score: float
    injected_tomorrow_module_title: str
    scheduled_for: date
    telegram_notification_queued: bool
