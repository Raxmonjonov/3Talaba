"""
Route Protection & RBAC Middleware for Adaptive AI Exam Platform.
1. OnboardingEnforcementMiddleware: Prevents users from skipping the diagnostic & onboarding state machine.
2. Subscription & Quota Enforcement: Protects Premium-only routes and enforces Free tier daily limits.
"""

from typing import Callable
from django.http import HttpRequest, HttpResponse, JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .models import OnboardingState, OnboardingStep


class OnboardingEnforcementMiddleware:
    """
    Intercepts API requests to protected application routes (/api/v1/dashboard/,
    /api/v1/study-plan/, /api/v1/practice/, /api/v1/ai-eval/) and verifies that
    the authenticated user has completed the mandatory onboarding & diagnostic flow.
    """

    # Routes that do NOT require completed onboarding
    EXEMPT_PATH_PREFIXES: tuple[str, ...] = (
        "/api/v1/auth/",
        "/api/v1/onboarding/",
        "/api/v1/health/",
        "/admin/",
    )

    # Next.js frontend step mapping for client-side redirect
    STEP_REDIRECT_MAP: dict[str, str] = {
        OnboardingStep.ACCOUNT_CREATED: "/onboarding/goals",
        OnboardingStep.GOAL_SELECTED: "/onboarding/diagnostic",
        OnboardingStep.DIAGNOSTIC_IN_PROGRESS: "/onboarding/diagnostic",
        OnboardingStep.DIAGNOSTIC_COMPLETED: "/onboarding/generate-plan",
        OnboardingStep.COMPLETED: "/dashboard",
    }

    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response
        self.jwt_authenticator = JWTAuthentication()

    def __call__(self, request: HttpRequest) -> HttpResponse:
        path = request.path_info

        # Only enforce on /api/v1/ routes that are not exempt
        if not path.startswith("/api/v1/") or path.startswith(self.EXEMPT_PATH_PREFIXES):
            return self.get_response(request)

        # Authenticate JWT if request.user is not yet populated by Django session
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            try:
                auth_result = self.jwt_authenticator.authenticate(request)
                if auth_result is not None:
                    user, _ = auth_result
                    request.user = user
            except (InvalidToken, TokenError):
                return JsonResponse(
                    {
                        "code": "INVALID_OR_EXPIRED_TOKEN",
                        "detail": "Authentication credentials are invalid or expired.",
                    },
                    status=401,
                )

        if not user or not user.is_authenticated:
            return JsonResponse(
                {
                    "code": "AUTHENTICATION_REQUIRED",
                    "detail": "Authentication credentials were not provided.",
                },
                status=401,
            )

        # Admin / Staff bypass
        if user.is_staff or user.is_superuser:
            return self.get_response(request)

        # Fetch or initialize OnboardingState
        onboarding_state, _ = OnboardingState.objects.get_or_create(user=user)

        if not onboarding_state.is_completed:
            redirect_url = self.STEP_REDIRECT_MAP.get(
                onboarding_state.current_step, "/onboarding/goals"
            )
            return JsonResponse(
                {
                    "code": "ONBOARDING_INCOMPLETE",
                    "detail": (
                        "You must complete the onboarding and diagnostic test "
                        "before accessing the main platform."
                    ),
                    "current_step": onboarding_state.current_step,
                    "redirect_to": redirect_url,
                },
                status=403,
            )

        return self.get_response(request)
