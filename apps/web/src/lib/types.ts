export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number | null;
  target: string | null;
  preferredTitle: string | null;
  currentLevel: number;
  focusMode: boolean;
  softConfirm: boolean;
}

export interface Session {
  id: string;
  title?: string | null;
  startedAt: string;
  endedAt?: string | null;
  totalMinutes?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface SessionWithMessages extends Session {
  messages: Message[];
}

export interface ChatResponse {
  message: Message;
  engine: {
    lessonId: string | null;
    usedAI: boolean;
  };
}

export interface SettingsResponse {
  id: string;
  preferredTitle: string | null;
  focusMode: boolean;
  softConfirm: boolean;
  currentLevel: number;
}

export interface PlacementOption {
  label: string;
  accepts?: string[];
}

export interface ServedQuestion {
  id: string;
  skill: string;
  type: string;
  prompt: string;
  passage?: string;
  options: PlacementOption[];
  difficulty: number;
  seconds?: number;
}

export interface PlacementStartResponse {
  question: ServedQuestion | null;
  answered: number;
  finished: boolean;
}

export interface PlacementAnswerResponse {
  finished: boolean;
  correct: boolean;
  explanation?: string;
  answered: number;
  question?: ServedQuestion | null;
  currentLevel?: number;
  correctCount?: number;
}

export interface PracticeAnswerResponse {
  correct: boolean;
  explanation?: string;
  expected?: string;
  review?: { grade: number; dueAt: string; interval: string };
}

export interface ReviewSummary {
  dueNow: number;
  totalCards: number;
  weakSkills: { skill: string; accuracy: number; attempts: number }[];
  next7Days: number[];
}

export interface ReviewsResponse {
  due: { questionId: string; due: string }[];
  summary: ReviewSummary;
}

export interface CourseListItem {
  slug: string;
  subject: string;
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
}

export interface LessonRef {
  id: string;
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  levelRange: string;
  estMinutes: number;
  xpReward: number;
  storyTitle?: string;
  courseSlug: string;
  moduleSlug: string;
  blockCount: number;
}

export interface CourseModule {
  slug: string;
  title: string;
  description: string;
  levelRange: string;
  lessons: LessonRef[];
}

export interface CourseDetail extends CourseListItem {
  modules: CourseModule[];
}

export interface LessonBlock {
  kind: string;
  title: string;
  minMinutes: number;
  content: string;
  skills: string[];
}

export interface LessonDetail extends LessonRef {
  blocks: LessonBlock[];
}

export interface EnrollResponse {
  courseSlug: string;
  enrolled: boolean;
}

export interface SkillMapItem {
  slug: string;
  subject: string;
  name: string;
  parent: string | null;
  questionCount: number;
  attempts: number;
  mastery: number | null;
}

export interface ProgressPoint {
  date: string;
  minutes: number;
  completed: number;
}

export interface ProgressResponse {
  series: ProgressPoint[];
  totals: {
    minutes: number;
    completed: number;
    activeDays: number;
    sessions: number;
  };
}

export type AchievementTier = "bronze" | "silver" | "gold";

export interface Achievement {
  slug: string;
  tier: AchievementTier;
  title: string;
  description: string;
  earnedAt: string | null;
}