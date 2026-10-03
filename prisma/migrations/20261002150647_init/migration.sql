-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('uz', 'en');

-- CreateEnum
CREATE TYPE "AddressForm" AS ENUM ('FORMAL', 'WARM');

-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('system', 'light', 'dark');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('SAT', 'IELTS', 'ACADEMIC_ENGLISH', 'MATHEMATICS', 'LOGIC', 'WRITING', 'APPLICATIONS', 'CAREER');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ_SINGLE', 'MCQ_MULTI', 'NUMERIC', 'SHORT_TEXT', 'ORDERING', 'MATCHING', 'ESSAY');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('SAT', 'IELTS', 'ACADEMIC_ENGLISH', 'NONE');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Phase" AS ENUM ('FOUNDATION', 'BUILD', 'STRENGTHEN', 'SPRINT', 'MOCKS', 'FINAL');

-- CreateEnum
CREATE TYPE "DayStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'REST');

-- CreateEnum
CREATE TYPE "PlannedBlockType" AS ENUM ('LEARN', 'PRACTICE', 'TUTOR_CHAT', 'QUIZ', 'MOCK', 'REVIEW');

-- CreateEnum
CREATE TYPE "BlockStatus" AS ENUM ('PENDING', 'ACTIVE', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "LessonBlockKind" AS ENUM ('STORY', 'EXPLAIN', 'EXAMPLE', 'DRILL', 'AI_CHAT', 'QUIZ', 'ERROR_REVIEW', 'BREAK');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('STANDARD', 'SPRINT');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'ACTIVE', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('LESSON', 'ONBOARDING', 'ERROR_REVIEW', 'MOCK_REVIEW', 'FREE_CHAT');

-- CreateEnum
CREATE TYPE "CardKind" AS ENUM ('WORD', 'FORMULA', 'GRAMMAR', 'CONCEPT');

-- CreateEnum
CREATE TYPE "ErrorStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('PRIVACY', 'DATA_PROCESSING', 'GUARDIAN', 'MARKETING');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "DataRequestKind" AS ENUM ('EXPORT', 'DELETE');

-- CreateEnum
CREATE TYPE "DataRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "XpReason" AS ENUM ('ONBOARDING', 'LESSON_BLOCK', 'QUIZ', 'SESSION_COMPLETE', 'MOCK_EXAM', 'SRS_REVIEW', 'ACHIEVEMENT', 'STREAK_BONUS', 'ERROR_FIXED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "gender" "Gender",
    "birthDate" TIMESTAMP(3),
    "currentGrade" TEXT,
    "targetExam" "ExamType" NOT NULL DEFAULT 'SAT',
    "targetScore" INTEGER,
    "targetCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetUni" TEXT,
    "motivation" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "levelLocked" BOOLEAN NOT NULL DEFAULT false,
    "onboardedAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tashkent',
    "deletedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "nicknameEnabled" BOOLEAN NOT NULL DEFAULT true,
    "addressForm" "AddressForm" NOT NULL DEFAULT 'WARM',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "matrixIntroEnabled" BOOLEAN NOT NULL DEFAULT true,
    "theme" "ThemeMode" NOT NULL DEFAULT 'system',
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "fontScale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 60,
    "sessionBlockMinutes" INTEGER NOT NULL DEFAULT 15,
    "breakMinutes" INTEGER NOT NULL DEFAULT 5,
    "breakRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bedtimeReminder" BOOLEAN NOT NULL DEFAULT true,
    "bedtimeReminderAt" TEXT NOT NULL DEFAULT '23:00',
    "leaderboardVisible" BOOLEAN NOT NULL DEFAULT false,
    "showScoreProjection" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "subject" "Subject" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "subject" "Subject" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "levelRange" TEXT NOT NULL DEFAULT '0-5',

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "objectives" JSONB NOT NULL,
    "storyAct" INTEGER NOT NULL DEFAULT 1,
    "storyTitle" JSONB,
    "levelRange" TEXT NOT NULL DEFAULT '0-5',
    "estMinutes" INTEGER NOT NULL DEFAULT 60,
    "xpReward" INTEGER NOT NULL DEFAULT 40,
    "skillIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_blocks" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" "LessonBlockKind" NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "minMinutes" INTEGER NOT NULL DEFAULT 10,
    "skillId" TEXT,

    CONSTRAINT "lesson_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "name" JSONB NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "prompt" JSONB NOT NULL,
    "passage" JSONB,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedSeconds" INTEGER NOT NULL DEFAULT 60,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "explanation" JSONB,
    "matchRules" JSONB,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exams" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB,
    "exam" "ExamType" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "sections" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scaledScore" INTEGER,
    "band" DOUBLE PRECISION,
    "sectionScores" JSONB NOT NULL DEFAULT '[]',
    "timeSpentSec" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "mock_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "chosen" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "timeMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mock_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "abilityTheta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "abilityStderr" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rawCorrect" INTEGER NOT NULL DEFAULT 0,
    "rawTotal" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER,
    "scaledScore" INTEGER,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "itemTrace" JSONB NOT NULL DEFAULT '[]',
    "skillThetas" JSONB NOT NULL DEFAULT '{}',
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "chosen" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "responseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "difficultyBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thetaBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "thetaAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seAfter" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "placement_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "targetExam" "ExamType" NOT NULL,
    "targetScore" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "weeksTotal" INTEGER NOT NULL DEFAULT 52,
    "mode" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "changeReason" TEXT,
    "isArchivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_weeks" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "phase" "Phase" NOT NULL,
    "goal" JSONB NOT NULL,
    "focusSkillIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mockExamId" TEXT,
    "isRestWeek" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "study_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_days" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "targetMinutes" INTEGER NOT NULL,
    "completedMinutes" INTEGER NOT NULL DEFAULT 0,
    "deferredMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" "DayStatus" NOT NULL DEFAULT 'PENDING',
    "isStudyDay" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "study_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planned_blocks" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "lessonId" TEXT,
    "blockType" "PlannedBlockType" NOT NULL,
    "plannedMinutes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "BlockStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "planned_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "plannedBlockId" TEXT,
    "mockAttemptId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "mode" "SessionMode" NOT NULL DEFAULT 'STANDARD',
    "targetMinutes" INTEGER NOT NULL DEFAULT 60,
    "elapsedSec" INTEGER NOT NULL DEFAULT 0,
    "resumeStepId" TEXT,
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "breakOfferedAt" TIMESTAMP(3),
    "breaksTaken" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION,
    "summary" JSONB,
    "startReason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_steps" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "blockId" TEXT,
    "order" INTEGER NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "result" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "session_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "role" "MessageRole" NOT NULL,
    "kind" "MessageKind" NOT NULL DEFAULT 'LESSON',
    "content" TEXT NOT NULL,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "model" TEXT,
    "latencyMs" INTEGER,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tutor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "nicknameEnabled" BOOLEAN NOT NULL DEFAULT true,
    "addressForm" "AddressForm" NOT NULL DEFAULT 'WARM',
    "motivation" TEXT,
    "fears" TEXT,
    "studyStyle" JSONB,
    "favoriteSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dailyStartTime" TEXT NOT NULL DEFAULT '07:00',
    "studyDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningPace" TEXT NOT NULL DEFAULT 'NORMAL',
    "onboardedSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tutor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "body" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "lessonBlockId" TEXT,
    "topic" TEXT NOT NULL,
    "userAnswer" JSONB NOT NULL,
    "correctAnswer" JSONB NOT NULL,
    "reason" TEXT,
    "explanation" JSONB,
    "status" "ErrorStatus" NOT NULL DEFAULT 'OPEN',
    "timesShown" INTEGER NOT NULL DEFAULT 0,
    "timesFixed" INTEGER NOT NULL DEFAULT 0,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "error_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_cards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "CardKind" NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "note" TEXT,
    "source" TEXT,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewAt" TIMESTAMP(3),
    "state" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_logs" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" INTEGER NOT NULL,
    "elapsedMs" INTEGER NOT NULL DEFAULT 0,
    "stabilityAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueAfter" TIMESTAMP(3),

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_masteries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "theta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "samples" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_masteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_projections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exam" "ExamType" NOT NULL,
    "projectedScore" INTEGER NOT NULL,
    "lower" INTEGER NOT NULL,
    "upper" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakdown" JSONB NOT NULL DEFAULT '{}',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_projections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "XpReason" NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "icon" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "freezes" INTEGER NOT NULL DEFAULT 2,
    "freezeUsedDates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalDays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" TEXT NOT NULL,
    "ip" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_links" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "status" "GuardianStatus" NOT NULL DEFAULT 'PENDING',
    "scope" TEXT NOT NULL DEFAULT 'PROGRESS_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "guardian_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "DataRequestKind" NOT NULL,
    "status" "DataRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "artifactKey" TEXT,
    "note" TEXT,

    CONSTRAINT "data_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_PlannedBlockSessions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlannedBlockSessions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_subject_order_idx" ON "courses"("subject", "order");

-- CreateIndex
CREATE INDEX "modules_courseId_order_idx" ON "modules"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "modules_courseId_slug_key" ON "modules"("courseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_moduleId_idx" ON "lessons"("moduleId");

-- CreateIndex
CREATE INDEX "lessons_levelRange_idx" ON "lessons"("levelRange");

-- CreateIndex
CREATE INDEX "lesson_blocks_lessonId_kind_idx" ON "lesson_blocks"("lessonId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_blocks_lessonId_order_key" ON "lesson_blocks"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "skills_subject_idx" ON "skills"("subject");

-- CreateIndex
CREATE INDEX "questions_skillId_isActive_idx" ON "questions"("skillId", "isActive");

-- CreateIndex
CREATE INDEX "questions_type_idx" ON "questions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_questionId_order_key" ON "question_options"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "mock_exams_slug_key" ON "mock_exams"("slug");

-- CreateIndex
CREATE INDEX "mock_exams_exam_idx" ON "mock_exams"("exam");

-- CreateIndex
CREATE INDEX "mock_attempts_userId_startedAt_idx" ON "mock_attempts"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "mock_answers_attemptId_questionId_key" ON "mock_answers"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "placement_attempts_userId_createdAt_idx" ON "placement_attempts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "placement_answers_attemptId_idx" ON "placement_answers"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "placement_answers_attemptId_order_key" ON "placement_answers"("attemptId", "order");

-- CreateIndex
CREATE INDEX "study_plans_userId_status_idx" ON "study_plans"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "study_weeks_planId_index_key" ON "study_weeks"("planId", "index");

-- CreateIndex
CREATE INDEX "study_days_date_idx" ON "study_days"("date");

-- CreateIndex
CREATE UNIQUE INDEX "study_days_weekId_date_key" ON "study_days"("weekId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "planned_blocks_dayId_order_key" ON "planned_blocks"("dayId", "order");

-- CreateIndex
CREATE INDEX "lesson_sessions_userId_status_idx" ON "lesson_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "lesson_sessions_userId_startedAt_idx" ON "lesson_sessions"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_steps_sessionId_order_key" ON "session_steps"("sessionId", "order");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_createdAt_idx" ON "chat_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_userId_createdAt_idx" ON "chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_tutor_profiles_userId_key" ON "ai_tutor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_key_key" ON "prompt_templates"("key");

-- CreateIndex
CREATE INDEX "error_entries_userId_status_idx" ON "error_entries"("userId", "status");

-- CreateIndex
CREATE INDEX "review_cards_userId_dueAt_idx" ON "review_cards"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "review_cards_kind_idx" ON "review_cards"("kind");

-- CreateIndex
CREATE INDEX "review_logs_cardId_reviewedAt_idx" ON "review_logs"("cardId", "reviewedAt");

-- CreateIndex
CREATE INDEX "skill_masteries_userId_theta_idx" ON "skill_masteries"("userId", "theta");

-- CreateIndex
CREATE UNIQUE INDEX "skill_masteries_userId_skillId_key" ON "skill_masteries"("userId", "skillId");

-- CreateIndex
CREATE INDEX "score_projections_userId_exam_computedAt_idx" ON "score_projections"("userId", "exam", "computedAt");

-- CreateIndex
CREATE INDEX "xp_events_userId_createdAt_idx" ON "xp_events"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userId_key" ON "streaks"("userId");

-- CreateIndex
CREATE INDEX "consent_records_userId_kind_idx" ON "consent_records"("userId", "kind");

-- CreateIndex
CREATE INDEX "guardian_links_guardianId_status_idx" ON "guardian_links"("guardianId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_links_studentId_guardianId_key" ON "guardian_links"("studentId", "guardianId");

-- CreateIndex
CREATE INDEX "data_requests_userId_kind_idx" ON "data_requests"("userId", "kind");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_at_idx" ON "audit_logs"("at");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_buckets_key_key" ON "rate_limit_buckets"("key");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_windowStart_idx" ON "rate_limit_buckets"("windowStart");

-- CreateIndex
CREATE INDEX "_PlannedBlockSessions_B_index" ON "_PlannedBlockSessions"("B");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_blocks" ADD CONSTRAINT "lesson_blocks_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_attempts" ADD CONSTRAINT "mock_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_attempts" ADD CONSTRAINT "mock_attempts_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "mock_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_answers" ADD CONSTRAINT "mock_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "mock_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_answers" ADD CONSTRAINT "mock_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_attempts" ADD CONSTRAINT "placement_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "placement_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_answers" ADD CONSTRAINT "placement_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_weeks" ADD CONSTRAINT "study_weeks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_weeks" ADD CONSTRAINT "study_weeks_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "mock_exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_days" ADD CONSTRAINT "study_days_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "study_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_blocks" ADD CONSTRAINT "planned_blocks_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "study_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_blocks" ADD CONSTRAINT "planned_blocks_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sessions" ADD CONSTRAINT "lesson_sessions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_steps" ADD CONSTRAINT "session_steps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "lesson_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_steps" ADD CONSTRAINT "session_steps_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "lesson_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "lesson_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tutor_profiles" ADD CONSTRAINT "ai_tutor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_entries" ADD CONSTRAINT "error_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_entries" ADD CONSTRAINT "error_entries_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_entries" ADD CONSTRAINT "error_entries_lessonBlockId_fkey" FOREIGN KEY ("lessonBlockId") REFERENCES "lesson_blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_cards" ADD CONSTRAINT "review_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "review_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_masteries" ADD CONSTRAINT "skill_masteries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_masteries" ADD CONSTRAINT "skill_masteries_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_projections" ADD CONSTRAINT "score_projections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_links" ADD CONSTRAINT "guardian_links_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlannedBlockSessions" ADD CONSTRAINT "_PlannedBlockSessions_A_fkey" FOREIGN KEY ("A") REFERENCES "lesson_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlannedBlockSessions" ADD CONSTRAINT "_PlannedBlockSessions_B_fkey" FOREIGN KEY ("B") REFERENCES "planned_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
