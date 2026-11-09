"""
PostgreSQL Database Schema (models.py) for GoPrep-style Adaptive AI Exam Platform (IELTS & SAT).
Built for Django 5.x + Django REST Framework + PostgreSQL.
"""

import uuid
from datetime import date
from decimal import Decimal
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


# ============================================================================
# 1. ENUMS & CONSTANTS
# ============================================================================

class ExamType(models.TextChoices):
    IELTS_ACADEMIC = "IELTS_ACADEMIC", "IELTS Academic"
    IELTS_GENERAL = "IELTS_GENERAL", "IELTS General Training"
    DIGITAL_SAT = "DIGITAL_SAT", "Digital SAT"


class ExamSection(models.TextChoices):
    # IELTS Sections
    LISTENING = "LISTENING", "Listening"
    READING = "READING", "Reading"
    WRITING = "WRITING", "Writing"
    SPEAKING = "SPEAKING", "Speaking"
    # Digital SAT Sections
    SAT_RW = "SAT_RW", "SAT Reading & Writing"
    SAT_MATH = "SAT_MATH", "SAT Math"


class SubscriptionTier(models.TextChoices):
    FREE = "FREE", "Free Tier"
    PREMIUM = "PREMIUM", "Premium Subscriber"
    ADMIN = "ADMIN", "Administrator"


class OnboardingStep(models.TextChoices):
    ACCOUNT_CREATED = "ACCOUNT_CREATED", "1. Account Created"
    GOAL_SELECTED = "GOAL_SELECTED", "2. Target Score & Exam Date Selected"
    DIAGNOSTIC_IN_PROGRESS = "DIAGNOSTIC_IN_PROGRESS", "3. Diagnostic Test In Progress"
    DIAGNOSTIC_COMPLETED = "DIAGNOSTIC_COMPLETED", "4. Diagnostic Test Completed"
    COMPLETED = "COMPLETED", "5. Study Plan Generated & Onboarding Complete"


# Strict State Machine Transition Map
VALID_ONBOARDING_TRANSITIONS: dict[str, set[str]] = {
    OnboardingStep.ACCOUNT_CREATED: {OnboardingStep.GOAL_SELECTED},
    OnboardingStep.GOAL_SELECTED: {
        OnboardingStep.DIAGNOSTIC_IN_PROGRESS,
        OnboardingStep.GOAL_SELECTED,  # Allow updating goals before starting diagnostic
    },
    OnboardingStep.DIAGNOSTIC_IN_PROGRESS: {OnboardingStep.DIAGNOSTIC_COMPLETED},
    OnboardingStep.DIAGNOSTIC_COMPLETED: {OnboardingStep.COMPLETED},
    OnboardingStep.COMPLETED: set(),  # Terminal state
}


# ============================================================================
# 2. USER & AUTHENTICATION MODELS (JWT + Google OAuth2 + RBAC)
# ============================================================================

class UserManager(BaseUserManager):
    def create_user(
        self,
        email: str,
        password: str | None = None,
        **extra_fields,
    ) -> "User":
        if not email:
            raise ValueError("Email address is required.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()  # For pure Google OAuth2 users
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        email: str,
        password: str,
        **extra_fields,
    ) -> "User":
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("subscription_tier", SubscriptionTier.ADMIN)
        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Core User model supporting JWT authentication, Google OAuth2,
    and Role-Based Access Control (Free vs Premium quotas).
    """

    FREE_DAILY_PRACTICE_LIMIT = 2
    FREE_DAILY_AI_EVAL_LIMIT = 1

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    # Google OAuth2 Integration
    google_oauth_id = models.CharField(
        max_length=255, unique=True, null=True, blank=True, db_index=True
    )
    auth_provider = models.CharField(
        max_length=32,
        default="email",
        choices=[("email", "Email/Password"), ("google", "Google OAuth2")],
    )

    # RBAC & Subscription State
    subscription_tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE,
        db_index=True,
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)

    # Daily Quota Tracking for Free Tier Users
    daily_practice_count = models.PositiveSmallIntegerField(default=0)
    daily_ai_eval_count = models.PositiveSmallIntegerField(default=0)
    quota_reset_date = models.DateField(default=date.today)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["subscription_tier", "subscription_expires_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.email} ({self.subscription_tier})"

    @property
    def is_premium_active(self) -> bool:
        if self.subscription_tier == SubscriptionTier.ADMIN:
            return True
        if self.subscription_tier == SubscriptionTier.PREMIUM:
            if self.subscription_expires_at is None:
                return True
            return self.subscription_expires_at > timezone.now()
        return False

    def refresh_daily_quota_if_needed(self) -> None:
        today = timezone.localdate()
        if self.quota_reset_date != today:
            self.daily_practice_count = 0
            self.daily_ai_eval_count = 0
            self.quota_reset_date = today
            self.save(
                update_fields=[
                    "daily_practice_count",
                    "daily_ai_eval_count",
                    "quota_reset_date",
                ]
            )


# ============================================================================
# 3. ONBOARDING STATE MACHINE MODEL
# ============================================================================

class OnboardingState(models.Model):
    """
    Tracks a user's progress through the mandatory multi-step onboarding flow:
    1. Target Exam & Target Score Selection
    2. Exam Date & Weekly Study Hours
    3. Short Diagnostic Test Execution
    4. Adaptive Study Plan Generation
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="onboarding_state",
    )

    current_step = models.CharField(
        max_length=32,
        choices=OnboardingStep.choices,
        default=OnboardingStep.ACCOUNT_CREATED,
        db_index=True,
    )

    # Goal Parameters
    exam_type = models.CharField(
        max_length=20,
        choices=ExamType.choices,
        null=True,
        blank=True,
    )
    # IELTS Band (e.g., 7.5) or SAT Score (e.g., 1500.0)
    target_score = models.DecimalField(
        max_digits=6,
        decimal_places=1,
        null=True,
        blank=True,
    )
    baseline_score = models.DecimalField(
        max_digits=6,
        decimal_places=1,
        null=True,
        blank=True,
    )
    exam_date = models.DateField(null=True, blank=True)
    daily_study_minutes = models.PositiveSmallIntegerField(
        default=60,
        validators=[MinValueValidator(15), MaxValueValidator(480)],
    )

    # Link to the diagnostic submission once started/completed
    diagnostic_submission = models.OneToOneField(
        "Submission",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="onboarding_diagnostic",
    )

    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "onboarding_states"

    @property
    def is_completed(self) -> bool:
        return self.current_step == OnboardingStep.COMPLETED

    def transition_to(self, next_step: str) -> None:
        """
        Enforces strict state machine transitions so users cannot skip steps.
        """
        allowed = VALID_ONBOARDING_TRANSITIONS.get(self.current_step, set())
        if next_step not in allowed:
            raise ValidationError(
                f"Invalid onboarding state transition from '{self.current_step}' to '{next_step}'."
            )

        if next_step == OnboardingStep.GOAL_SELECTED:
            if not self.exam_type or not self.target_score or not self.exam_date:
                raise ValidationError(
                    "exam_type, target_score, and exam_date must be set before advancing to GOAL_SELECTED."
                )

        if next_step == OnboardingStep.DIAGNOSTIC_COMPLETED:
            if not self.diagnostic_submission or self.diagnostic_submission.status != "EVALUATED":
                raise ValidationError(
                    "Diagnostic submission must be evaluated before completing the diagnostic step."
                )

        if next_step == OnboardingStep.COMPLETED:
            self.completed_at = timezone.now()

        self.current_step = next_step
        self.save()


# ============================================================================
# 4. PRACTICE TESTS & QUESTIONS
# ============================================================================

class PracticeTest(models.Model):
    """
    Represents either an initial Diagnostic Test, a Section Drill, or a Full Mock Exam.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=255)
    exam_type = models.CharField(
        max_length=20, choices=ExamType.choices, db_index=True
    )
    section = models.CharField(
        max_length=20, choices=ExamSection.choices, db_index=True
    )

    is_diagnostic = models.BooleanField(default=False, db_index=True)
    is_premium_only = models.BooleanField(default=False, db_index=True)
    duration_minutes = models.PositiveSmallIntegerField(default=30)
    difficulty_level = models.PositiveSmallIntegerField(
        default=3, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    instructions = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "practice_tests"
        indexes = [
            models.Index(fields=["exam_type", "section", "is_published"]),
            models.Index(fields=["exam_type", "is_diagnostic"]),
        ]

    def __str__(self) -> str:
        return f"[{self.exam_type} - {self.section}] {self.title}"


class Question(models.Model):
    """
    Individual question inside a PracticeTest.
    Supports Objective (MCQ / Fill-in-blank for Reading, Listening, Math)
    and Subjective AI-evaluated tasks (Writing Task 1/2, Speaking Part 1/2/3).
    """

    class QuestionFormat(models.TextChoices):
        MULTIPLE_CHOICE = "MCQ", "Multiple Choice"
        FILL_IN_BLANK = "FIB", "Fill in the Blank"
        ESSAY_PROMPT = "ESSAY", "Writing Essay (AI Evaluated)"
        SPEAKING_PROMPT = "SPEAKING", "Speaking Audio Prompt (AI Evaluated)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    practice_test = models.ForeignKey(
        PracticeTest, on_delete=models.CASCADE, related_name="questions"
    )
    order_index = models.PositiveSmallIntegerField(default=1)
    section = models.CharField(max_length=20, choices=ExamSection.choices)
    question_format = models.CharField(
        max_length=16,
        choices=QuestionFormat.choices,
        default=QuestionFormat.MULTIPLE_CHOICE,
    )

    topic_tag = models.CharField(
        max_length=100,
        db_index=True,
        help_text="e.g., 'True/False/Not Given', 'Linear Equations', 'Task 2 Opinion Essay'",
    )
    passage_text = models.TextField(blank=True, null=True)
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    prompt_text = models.TextField()

    # JSON structure for MCQ options: [{"id": "A", "text": "..."}, ...]
    options_json = models.JSONField(default=list, blank=True)
    # Deterministic answer key for Reading/Listening/Math (kept server-side only)
    correct_answer = models.CharField(max_length=255, blank=True)
    explanation = models.TextField(blank=True)

    # Rubric & Context for LLM Evaluation (Writing/Speaking)
    ai_rubric_criteria = models.JSONField(
        default=dict,
        blank=True,
        help_text="Scoring rubric weights and model instructions for LLM grading.",
    )

    class Meta:
        db_table = "questions"
        ordering = ["practice_test", "order_index"]
        unique_together = [("practice_test", "order_index")]


# ============================================================================
# 5. ADAPTIVE STUDY PLAN & DAILY/WEEKLY CHECKLISTS
# ============================================================================

class StudyPlan(models.Model):
    """
    Adaptive Study Plan generated from the user's diagnostic test results,
    target score gap, and days remaining until exam_date.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="study_plans"
    )
    exam_type = models.CharField(max_length=20, choices=ExamType.choices)
    is_active = models.BooleanField(default=True, db_index=True)

    baseline_score = models.DecimalField(max_digits=6, decimal_places=1)
    target_score = models.DecimalField(max_digits=6, decimal_places=1)
    target_exam_date = models.DateField()
    total_weeks = models.PositiveSmallIntegerField(default=4)

    # Diagnostic breakdown e.g. {"READING": 6.0, "LISTENING": 6.5, "WRITING": 5.5, "SPEAKING": 6.0}
    section_diagnostics_json = models.JSONField(default=dict)
    # Prioritized weak topics e.g. ["WRITING:Coherence & Cohesion", "READING:Inference"]
    priority_focus_areas = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "study_plans"
        indexes = [
            models.Index(fields=["user", "is_active"]),
        ]


class StudyPlanModule(models.Model):
    """
    Individual Daily/Weekly Checklist item within a user's StudyPlan.
    """

    class ModuleStatus(models.TextChoices):
        LOCKED = "LOCKED", "Locked"
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    study_plan = models.ForeignKey(
        StudyPlan, on_delete=models.CASCADE, related_name="modules"
    )
    week_number = models.PositiveSmallIntegerField(db_index=True)
    day_of_week = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(7)],
        help_text="1=Monday ... 7=Sunday",
    )
    scheduled_date = models.DateField(db_index=True)

    section = models.CharField(max_length=20, choices=ExamSection.choices)
    title = models.CharField(max_length=255)
    topic_focus = models.CharField(max_length=120)
    estimated_minutes = models.PositiveSmallIntegerField(default=30)

    practice_test = models.ForeignKey(
        PracticeTest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_modules",
    )
    status = models.CharField(
        max_length=16,
        choices=ModuleStatus.choices,
        default=ModuleStatus.PENDING,
        db_index=True,
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "study_plan_modules"
        ordering = ["week_number", "day_of_week", "id"]
        indexes = [
            models.Index(fields=["study_plan", "week_number", "status"]),
            models.Index(fields=["study_plan", "scheduled_date"]),
        ]


# ============================================================================
# 6. SUBMISSIONS & AI EVALUATIONS
# ============================================================================

class Submission(models.Model):
    """
    Represents a user's attempt at a PracticeTest (Diagnostic or Regular Practice).
    Stores both deterministic scores (Reading/Listening/Math) and LLM evaluations
    (Writing/Speaking band score & detailed rubric feedback).
    """

    class SubmissionStatus(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        SUBMITTED = "SUBMITTED", "Submitted (Pending AI Grading)"
        EVALUATED = "EVALUATED", "Evaluated"
        FAILED = "FAILED", "Evaluation Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="submissions"
    )
    practice_test = models.ForeignKey(
        PracticeTest, on_delete=models.PROTECT, related_name="submissions"
    )
    study_plan_module = models.ForeignKey(
        StudyPlanModule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submissions",
    )

    status = models.CharField(
        max_length=20,
        choices=SubmissionStatus.choices,
        default=SubmissionStatus.IN_PROGRESS,
        db_index=True,
    )

    # Overall Band (e.g., 7.0) or Scaled Score (e.g., 1420.0)
    overall_score = models.DecimalField(
        max_digits=6, decimal_places=1, null=True, blank=True
    )
    # Section-wise score breakdown e.g. {"READING": 7.5, "WRITING": 6.5}
    section_scores_json = models.JSONField(default=dict, blank=True)

    time_spent_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "submissions"
        indexes = [
            models.Index(fields=["user", "status", "-started_at"]),
            models.Index(fields=["practice_test", "user"]),
        ]


class QuestionResponse(models.Model):
    """
    Stores a user's answer to a single Question within a Submission,
    including LLM feedback for Writing essays and Speaking transcripts.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(
        Question, on_delete=models.PROTECT, related_name="user_responses"
    )

    # Objective or Written answer text (or ASR transcript for Speaking)
    answer_text = models.TextField(blank=True)
    # Optional S3/Cloud URL for Speaking audio recording
    speaking_audio_url = models.URLField(max_length=500, blank=True, null=True)

    # Objective grading fields
    is_correct = models.BooleanField(null=True, blank=True)

    # AI Evaluation Fields (for Writing & Speaking)
    estimated_band_score = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="IELTS Band 0.0-9.0 or SAT Essay score",
    )
    ai_evaluation_json = models.JSONField(
        default=dict,
        blank=True,
        help_text=(
            "Structured LLM output: { "
            "'criteria_scores': {'task_response': 7.0, 'coherence': 6.5, 'lexical': 7.0, 'grammar': 6.5}, "
            "'strengths': [...], 'weaknesses': [...], 'improved_sample': '...' }"
        ),
    )
    evaluated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "question_responses"
        unique_together = [("submission", "question")]
