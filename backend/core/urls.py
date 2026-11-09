"""
URL Routing for Adaptive AI Exam Platform (/api/v1/).
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    CurrentStudyPlanView,
    GoogleOAuth2LoginView,
    OnboardingDiagnosticStartView,
    OnboardingDiagnosticSubmitView,
    OnboardingGoalSelectionView,
    OnboardingStateView,
    PracticeSubmissionView,
    PremiumFullMockTestsView,
)

urlpatterns = [
    # 1. Authentication (JWT + Google OAuth2)
    path("api/v1/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/auth/google/", GoogleOAuth2LoginView.as_view(), name="google_oauth2_login"),

    # 2. Mandatory Multi-Step Onboarding & Diagnostic Flow
    path("api/v1/onboarding/state/", OnboardingStateView.as_view(), name="onboarding_state"),
    path("api/v1/onboarding/goals/", OnboardingGoalSelectionView.as_view(), name="onboarding_goals"),
    path(
        "api/v1/onboarding/diagnostic/start/",
        OnboardingDiagnosticStartView.as_view(),
        name="onboarding_diagnostic_start",
    ),
    path(
        "api/v1/onboarding/diagnostic/submit/",
        OnboardingDiagnosticSubmitView.as_view(),
        name="onboarding_diagnostic_submit",
    ),

    # 3. Adaptive Study Plan (Protected by OnboardingEnforcementMiddleware + IsOnboardingCompleted)
    path("api/v1/study-plan/current/", CurrentStudyPlanView.as_view(), name="study_plan_current"),

    # 4. AI Practice & Evaluation (Protected by Onboarding + RBAC Quotas)
    path(
        "api/v1/practice/tests/<uuid:test_id>/submit/",
        PracticeSubmissionView.as_view(),
        name="practice_submit",
    ),
    path(
        "api/v1/practice/premium-mocks/",
        PremiumFullMockTestsView.as_view(),
        name="premium_mocks",
    ),
]
