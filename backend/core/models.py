"""
Phase 1: Production PostgreSQL Models (Django 5.x)
Covers:
- User (streaks, XP, target band, exam date, subscription tier, Telegram integration)
- AdaptiveNode & UserNodeMastery (Dynamic Micro-Adaptive Skill Tree)
- ExamSession (Inspera/Bluebook live timer, highlights, notes, flagged questions)
- AISubmission (IELTS/SAT essays & audio with inline corrections & 4-criterion rubric JSON)
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
    LISTENING = "LISTENING", "Listening"
    READING = "READING", "Reading"
    WRITING = "WRITING", "Writing"
    SPEAKING = "SPEAKING", "Speaking"
    SAT_RW = "SAT_RW", "SAT Reading & Writing"
    SAT_MATH = "SAT_MATH", "SAT Math"


class SubscriptionTier(models.TextChoices):
    FREE = "FREE", "Free Tier"
    PRO = "PRO", "Pro Pass"
    PREMIUM = "PREMIUM", "Premium Unlimited"
    ADMIN = "ADMIN", "Administrator"


class OnboardingStep(models.TextChoices):
    ACCOUNT_CREATED = "ACCOUNT_CREATED", "1. Account Created"
    GOAL_SELECTED = "GOAL_SELECTED", "2. Target Score & Exam Date Selected"
    DIAGNOSTIC_IN_PROGRESS = "DIAGNOSTIC_IN_PROGRESS", "3. Diagnostic Test In Progress"
    DIAGNOSTIC_COMPLETED = "DIAGNOSTIC_COMPLETED", "4. Diagnostic Test Completed"
    COMPLETED = "COMPLETED", "5. Study Plan Generated & Onboarding Complete"


VALID_ONBOARDING_TRANSITIONS: dict[str, set[str]] = {
    OnboardingStep.ACCOUNT_CREATED: {OnboardingStep.GOAL_SELECTED},
    OnboardingStep.GOAL_SELECTED: {
        OnboardingStep.DIAGNOSTIC_IN_PROGRESS,
        OnboardingStep.GOAL_SELECTED,
    },
    OnboardingStep.DIAGNOSTIC_IN_PROGRESS: {OnboardingStep.DIAGNOSTIC_COMPLETED},
    OnboardingStep.DIAGNOSTIC_COMPLETED: {OnboardingStep.COMPLETED},
    OnboardingStep.COMPLETED: set(),
}


# ============================================================================
# 2. USER MODEL (Streaks, XP, Target Band, Exam Date, Subscription Tier)
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
            user.set_unusable_password()
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
    Core User entity supporting gamification (XP, streaks), target exam goals,
    localization (uz/ru/en), Telegram reminders, and subscription RBAC.
    """

    FREE_DAILY_PRACTICE_LIMIT = 2
    FREE_DAILY_AI_EVAL_LIMIT = 1

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    # OAuth & Localization
    google_oauth_id = models.CharField(
        max_length=255, unique=True, null=True, blank=True, db_index=True
    )
    auth_provider = models.CharField(max_length=32, default="email")
    preferred_locale = models.CharField(
        max_length=8,
        default="uz",
        choices=[("uz", "O'zbekcha"), ("ru", "Русский"), ("en", "English")],
    )
    telegram_chat_id = models.CharField(
        max_length=64, blank=True, null=True, db_index=True
    )

    # Exam Goals
    target_exam = models.CharField(
        max_length=20,
        choices=ExamType.choices,
        default=ExamType.IELTS_ACADEMIC,
    )
    target_band = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=Decimal("7.5"),
        help_text="Target IELTS Band (e.g. 7.5) or Digital SAT Score (e.g. 1520.0)",
    )
    exam_date = models.DateField(null=True, blank=True)

    # Gamification (Streaks & XP Leaderboard)
    xp_points = models.PositiveIntegerField(default=0, db_index=True)
    current_streak = models.PositiveSmallIntegerField(default=0)
    longest_streak = models.PositiveSmallIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    # RBAC & Quotas
    subscription_tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.FREE,
        db_index=True,
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
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
            models.Index(fields=["-xp_points"]),
            models.Index(fields=["subscription_tier", "subscription_expires_at"]),
        ]

    @property
    def is_premium_active(self) -> bool:
        if self.subscription_tier == SubscriptionTier.ADMIN:
            return True
        if self.subscription_tier in (SubscriptionTier.PRO, SubscriptionTier.PREMIUM):
            if self.subscription_expires_at is None:
                return True
            return self.subscription_expires_at > timezone.now()
        return False

    def record_study_activity(self, xp_earned: int = 25) -> None:
        today = timezone.localdate()
        if self.last_activity_date == today:
            self.xp_points += xp_earned
        elif (
            self.last_activity_date is not None
            and (today - self.last_activity_date).days == 1
        ):
            self.current_streak += 1
            self.longest_streak = max(self.longest_streak, self.current_streak)
            self.xp_points += xp_earned
            self.last_activity_date = today
        else:
            self.current_streak = 1
            self.longest_streak = max(self.longest_streak, 1)
            self.xp_points += xp_earned
            self.last_activity_date = today

        self.save(
            update_fields=[
                "xp_points",
                "current_streak",
                "longest_streak",
                "last_activity_date",
            ]
        )

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
# 3. ADAPTIVE SKILL TREE NODES (Dynamic Micro-Adaptive Roadmap)
# ============================================================================

class AdaptiveNode(models.Model):
    """
    Skill-tree node representing a micro-skill:
    e.g., Reading -> True/False/Not Given, Reading -> Matching Headings,
    Writing -> Task 2 Cohesion, SAT Math -> Systems of Linear Equations.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=120, unique=True, db_index=True)
    exam_type = models.CharField(
        max_length=20, choices=ExamType.choices, db_index=True
    )
    section = models.CharField(
        max_length=20, choices=ExamSection.choices, db_index=True
    )
    title_en = models.CharField(max_length=200)
    title_uz = models.CharField(max_length=200)
    description_uz = models.TextField(blank=True)

    parent_node = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="child_nodes",
    )
    prerequisites = models.ManyToManyField(
        "self", symmetrical=False, blank=True, related_name="unlocks_nodes"
    )

    difficulty_tier = models.PositiveSmallIntegerField(
        default=2, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    exam_weight_pct = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        default=Decimal("10.0"),
        help_text="Frequency weight in real IELTS/SAT exams (used to prioritize remediation).",
    )

    class Meta:
        db_table = "adaptive_nodes"
        indexes = [
            models.Index(fields=["exam_type", "section", "difficulty_tier"]),
        ]

    def __str__(self) -> str:
        return f"[{self.section}] {self.title_en}"


class UserNodeMastery(models.Model):
    """
    Tracks each user's live mastery (0.0 - 100.0) of an AdaptiveNode.
    When mastery drops below 65% after a practice session, `needs_immediate_remediation`
    is flagged true and the Dynamic Micro-Adaptive Engine injects remediation drills
    into tomorrow's schedule.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="node_masteries"
    )
    node = models.ForeignKey(
        AdaptiveNode, on_delete=models.CASCADE, related_name="user_masteries"
    )

    mastery_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("50.00"),
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    attempts_count = models.PositiveIntegerField(default=0)
    failure_streak = models.PositiveSmallIntegerField(default=0)
    needs_immediate_remediation = models.BooleanField(default=False, db_index=True)
    next_review_date = models.DateField(default=date.today, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_node_masteries"
        unique_together = [("user", "node")]
        indexes = [
            models.Index(fields=["user", "needs_immediate_remediation", "next_review_date"]),
        ]

    def update_from_accuracy(self, accuracy_ratio: float) -> None:
        """
        Recalculates mastery using Exponential Moving Average (EMA).
        Automatically triggers remediation if user fails (< 0.60 accuracy).
        """
        self.attempts_count += 1
        observed = Decimal(str(round(accuracy_ratio * 100, 2)))
        self.mastery_score = (self.mastery_score * Decimal("0.60")) + (
            observed * Decimal("0.40")
        )

        if accuracy_ratio < 0.60:
            self.failure_streak += 1
            self.needs_immediate_remediation = True
            self.next_review_date = timezone.localdate()  # Inject immediately for today/tomorrow
        else:
            self.failure_streak = 0
            self.needs_immediate_remediation = self.mastery_score < Decimal("65.00")
            interval_days = 1 if self.needs_immediate_remediation else min(14, 2 ** min(4, self.attempts_count))
            self.next_review_date = timezone.localdate() + timedelta(days=interval_days)

        self.save()


# ============================================================================
# 4. DISTRACTION-FREE EXAM SESSION (Inspera / Bluebook State Persistence)
# ============================================================================

class ExamSession(models.Model):
    """
    Persists live exam simulator state so users never lose progress, timer state,
    text highlights, sticky notes, or flagged questions on browser refresh.
    """

    class SessionState(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        PAUSED = "PAUSED", "Paused"
        SUBMITTED = "SUBMITTED", "Submitted"
        EXPIRED = "EXPIRED", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="exam_sessions"
    )
    practice_test = models.ForeignKey(
        "PracticeTest", on_delete=models.CASCADE, related_name="live_sessions"
    )

    state = models.CharField(
        max_length=16,
        choices=SessionState.choices,
        default=SessionState.ACTIVE,
        db_index=True,
    )
    remaining_seconds = models.PositiveIntegerField(default=3600)

    # Array of highlight objects:
    # [{"id": "hl-1", "start": 42, "end": 118, "text": "...", "color": "yellow"|"green", "note": "..."}]
    highlighted_ranges = models.JSONField(default=list, blank=True)

    # Question IDs flagged for review: ["q-1", "q-4"]
    flagged_questions = models.JSONField(default=list, blank=True)

    #Eliminated / struck-through MCQ option IDs: {"q-1": ["A", "C"]}
    strikethrough_options = models.JSONField(default=dict, blank=True)

    # Live draft answers: {"q-1": "TRUE", "q-2": "NOT GIVEN", "essay-1": "In recent decades..."}
    draft_answers = models.JSONField(default=dict, blank=True)

    last_synced_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "exam_sessions"
        indexes = [
            models.Index(fields=["user", "state", "-last_synced_at"]),
        ]


# ============================================================================
# 5. AI SUBMISSION (Structured IELTS/SAT Examiner Critique & Inline Corrections)
# ============================================================================

class AISubmission(models.Model):
    """
    Stores Writing essays (Task 1/2) or Speaking audio recordings alongside
    strict ex-IELTS Examiner JSON evaluation and sentence-level inline corrections.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="ai_submissions"
    )
    exam_session = models.ForeignKey(
        ExamSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_submissions",
    )
    adaptive_node = models.ForeignKey(
        AdaptiveNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_submissions",
    )

    section = models.CharField(
        max_length=20,
        choices=ExamSection.choices,
        default=ExamSection.WRITING,
    )
    task_type = models.CharField(
        max_length=32,
        default="WRITING_TASK_2",
        help_text="WRITING_TASK_1, WRITING_TASK_2, SPEAKING_PART_2, etc.",
    )
    prompt_text = models.TextField()
    user_essay_or_transcript = models.TextField()
    audio_recording_url = models.URLField(max_length=500, blank=True, null=True)
    word_count = models.PositiveSmallIntegerField(default=0)

    # Official 4-Pillar IELTS Band Scores (0.0 - 9.0 in 0.5 steps)
    overall_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )
    task_response_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )
    coherence_cohesion_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )
    lexical_resource_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )
    grammatical_range_band = models.DecimalField(
        max_digits=3, decimal_places=1, null=True, blank=True
    )

    # Array of {"original_phrase", "improved_phrase", "band_9_synonym", "reason", "reason_uz", "category"}
    inline_corrections = models.JSONField(default=list, blank=True)

    # Array of concrete study actions + Uzbekistan/English localized examiner commentary
    actionable_next_steps = models.JSONField(default=list, blank=True)
    full_rubric_response = models.JSONField(default=dict, blank=True)

    processing_time_ms = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_submissions"
        indexes = [
            models.Index(fields=["user", "section", "-created_at"]),
        ]


# ============================================================================
# 6. EXISTING ONBOARDING, PRACTICE TEST & STUDY PLAN MODELS
# ============================================================================

class OnboardingState(models.Model):
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
    exam_type = models.CharField(
        max_length=20, choices=ExamType.choices, null=True, blank=True
    )
    target_score = models.DecimalField(
        max_digits=6, decimal_places=1, null=True, blank=True
    )
    baseline_score = models.DecimalField(
        max_digits=6, decimal_places=1, null=True, blank=True
    )
    exam_date = models.DateField(null=True, blank=True)
    daily_study_minutes = models.PositiveSmallIntegerField(
        default=60,
        validators=[MinValueValidator(15), MaxValueValidator(480)],
    )
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


class PracticeTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=255)
    exam_type = models.CharField(
        max_length=20, choices=ExamType.choices, db_index=True
    )
    section = models.CharField(
        max_length=20, choices=ExamSection.choices, db_index=True
    )
    adaptive_node = models.ForeignKey(
        AdaptiveNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="practice_tests",
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


class Question(models.Model):
    class QuestionFormat(models.TextChoices):
        MULTIPLE_CHOICE = "MCQ", "Multiple Choice"
        TRUE_FALSE_NG = "TFNG", "True / False / Not Given"
        FILL_IN_BLANK = "FIB", "Fill in the Blank"
        MATCHING_HEADINGS = "HEADINGS", "Drag-and-Drop Matching Headings"
        ESSAY_PROMPT = "ESSAY", "Writing Essay (AI Evaluated)"
        SPEAKING_PROMPT = "SPEAKING", "Speaking Audio Prompt (AI Evaluated)"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    practice_test = models.ForeignKey(
        PracticeTest, on_delete=models.CASCADE, related_name="questions"
    )
    adaptive_node = models.ForeignKey(
        AdaptiveNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="questions",
    )
    order_index = models.PositiveSmallIntegerField(default=1)
    section = models.CharField(max_length=20, choices=ExamSection.choices)
    question_format = models.CharField(
        max_length=16,
        choices=QuestionFormat.choices,
        default=QuestionFormat.MULTIPLE_CHOICE,
    )
    topic_tag = models.CharField(max_length=100, db_index=True)
    passage_text = models.TextField(blank=True, null=True)
    audio_url = models.URLField(max_length=500, blank=True, null=True)
    prompt_text = models.TextField()
    options_json = models.JSONField(default=list, blank=True)
    correct_answer = models.CharField(max_length=255, blank=True)
    explanation = models.TextField(blank=True)
    explanation_uz = models.TextField(blank=True)
    ai_rubric_criteria = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "questions"
        ordering = ["practice_test", "order_index"]
        unique_together = [("practice_test", "order_index")]


class StudyPlan(models.Model):
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
    section_diagnostics_json = models.JSONField(default=dict)
    priority_focus_areas = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "study_plans"


class StudyPlanModule(models.Model):
    class ModuleStatus(models.TextChoices):
        LOCKED = "LOCKED", "Locked"
        PENDING = "PENDING", "Pending"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    study_plan = models.ForeignKey(
        StudyPlan, on_delete=models.CASCADE, related_name="modules"
    )
    adaptive_node = models.ForeignKey(
        AdaptiveNode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="study_modules",
    )
    week_number = models.PositiveSmallIntegerField(db_index=True)
    day_of_week = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(7)]
    )
    scheduled_date = models.DateField(db_index=True)
    section = models.CharField(max_length=20, choices=ExamSection.choices)
    title = models.CharField(max_length=255)
    topic_focus = models.CharField(max_length=120)
    is_remediation_drill = models.BooleanField(
        default=False,
        help_text="True when dynamically injected by the Micro-Adaptive Engine after a failed drill.",
    )
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
        ordering = ["scheduled_date", "-is_remediation_drill", "id"]


class Submission(models.Model):
    class SubmissionStatus(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        SUBMITTED = "SUBMITTED", "Submitted"
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
    overall_score = models.DecimalField(
        max_digits=6, decimal_places=1, null=True, blank=True
    )
    section_scores_json = models.JSONField(default=dict, blank=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "submissions"


class QuestionResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="responses"
    )
    question = models.ForeignKey(
        Question, on_delete=models.PROTECT, related_name="user_responses"
    )
    answer_text = models.TextField(blank=True)
    speaking_audio_url = models.URLField(max_length=500, blank=True, null=True)
    is_correct = models.BooleanField(null=True, blank=True)
    estimated_band_score = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )
    ai_evaluation_json = models.JSONField(default=dict, blank=True)
    evaluated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "question_responses"
        unique_together = [("submission", "question")]
