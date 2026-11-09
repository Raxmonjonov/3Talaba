"""
Role-Based Access Control (RBAC) & Quota Permissions for Django REST Framework.
Distinguishes between FREE tier users (limited daily practice & AI evaluations)
and PREMIUM subscribers.
"""

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

from .models import OnboardingState, PracticeTest, User


class IsOnboardingCompleted(BasePermission):
    """
    View-level guard ensuring the user has completed the onboarding flow.
    """

    message = "Onboarding and diagnostic assessment must be completed first."

    def has_permission(self, request: Request, view: APIView) -> bool:
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True

        state, _ = OnboardingState.objects.get_or_create(user=user)
        if not state.is_completed:
            raise PermissionDenied(
                {
                    "code": "ONBOARDING_INCOMPLETE",
                    "current_step": state.current_step,
                    "detail": self.message,
                }
            )
        return True


class IsPremiumSubscriber(BasePermission):
    """
    Restricts endpoint access exclusively to active PREMIUM or ADMIN users.
    """

    message = "This feature requires an active Premium subscription."

    def has_permission(self, request: Request, view: APIView) -> bool:
        user: User = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.is_premium_active:
            raise PermissionDenied(
                {
                    "code": "PREMIUM_REQUIRED",
                    "subscription_tier": user.subscription_tier,
                    "detail": self.message,
                    "upgrade_url": "/pricing",
                }
            )
        return True


class HasDailyPracticeQuota(BasePermission):
    """
    Allows unlimited practice for PREMIUM users, while enforcing daily limits
    and blocking `is_premium_only` tests for FREE tier users.
    """

    def has_permission(self, request: Request, view: APIView) -> bool:
        user: User = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_premium_active:
            return True

        user.refresh_daily_quota_if_needed()
        if user.daily_practice_count >= User.FREE_DAILY_PRACTICE_LIMIT:
            raise PermissionDenied(
                {
                    "code": "DAILY_PRACTICE_QUOTA_EXCEEDED",
                    "limit": User.FREE_DAILY_PRACTICE_LIMIT,
                    "used": user.daily_practice_count,
                    "detail": (
                        f"Free tier users are limited to {User.FREE_DAILY_PRACTICE_LIMIT} "
                        "practice sessions per day. Upgrade to Premium for unlimited practice."
                    ),
                    "upgrade_url": "/pricing",
                }
            )
        return True

    def has_object_permission(
        self, request: Request, view: APIView, obj: PracticeTest
    ) -> bool:
        user: User = request.user
        if isinstance(obj, PracticeTest) and obj.is_premium_only and not user.is_premium_active:
            raise PermissionDenied(
                {
                    "code": "PREMIUM_TEST_LOCKED",
                    "detail": "This full-length mock test is exclusive to Premium subscribers.",
                    "upgrade_url": "/pricing",
                }
            )
        return True


def consume_user_quota(user_id, quota_type: str = "practice") -> None:
    """
    Atomically verifies and increments the daily quota for FREE tier users
    using PostgreSQL `SELECT ... FOR UPDATE` row-level locking.
    """
    with transaction.atomic():
        locked_user = User.objects.select_for_update().get(pk=user_id)
        if locked_user.is_premium_active:
            return

        today = timezone.localdate()
        if locked_user.quota_reset_date != today:
            locked_user.daily_practice_count = 0
            locked_user.daily_ai_eval_count = 0
            locked_user.quota_reset_date = today

        if quota_type == "practice":
            if locked_user.daily_practice_count >= User.FREE_DAILY_PRACTICE_LIMIT:
                raise PermissionDenied(
                    {
                        "code": "DAILY_PRACTICE_QUOTA_EXCEEDED",
                        "limit": User.FREE_DAILY_PRACTICE_LIMIT,
                        "detail": "Daily free practice quota reached.",
                    }
                )
            locked_user.daily_practice_count += 1
        elif quota_type == "ai_eval":
            if locked_user.daily_ai_eval_count >= User.FREE_DAILY_AI_EVAL_LIMIT:
                raise PermissionDenied(
                    {
                        "code": "DAILY_AI_EVAL_QUOTA_EXCEEDED",
                        "limit": User.FREE_DAILY_AI_EVAL_LIMIT,
                        "detail": (
                            "Free tier includes 1 AI Writing/Speaking evaluation per day. "
                            "Upgrade to Premium for unlimited AI band-score evaluations."
                        ),
                    }
                )
            locked_user.daily_ai_eval_count += 1

        locked_user.save(
            update_fields=[
                "daily_practice_count",
                "daily_ai_eval_count",
                "quota_reset_date",
            ]
        )
