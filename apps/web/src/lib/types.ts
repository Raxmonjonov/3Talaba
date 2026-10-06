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

export interface PlacementQuestion {
  id: string;
  level: number;
  question: string;
  options: string[];
}

export interface PlacementResult {
  earned: number;
  possible: number;
  level: number;
  currentLevel: number;
  detail: {
    id: string;
    correct: boolean;
    chosen: number;
    explain: string;
  }[];
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