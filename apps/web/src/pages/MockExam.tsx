import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type {
  MockExamAnswerResponse,
  MockExamDetail,
  MockExamQuestion,
} from "../lib/types";
import { QuestionBody } from "@/components/QuestionBody";

type FlatItem = MockExamQuestion & { section: string; index: number };

function flatten(exam: MockExamDetail): FlatItem[] {
  const out: FlatItem[] = [];
  let index = 0;
  for (const section of exam.sections) {
    for (const q of section.questions) {
      out.push({ ...q, section: section.title, index });
      index += 1;
    }
  }
  return out;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${String(rest).padStart(2, "0")}`;
}

export default function MockExam() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [exam, setExam] = useState<MockExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [feedback, setFeedback] = useState<{
    explanation?: string;
    expected?: string;
  } | null>(null);
  const [results, setResults] = useState<{
    score: number;
    maxScore: number;
    correct: number;
    total: number;
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const answersRef = useRef<Record<string, { correct: boolean; points: number }>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = useMemo(() => (exam ? flatten(exam) : []), [exam]);
  const current = items[cursor];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) return;
      setLoading(true);
      setError("");
      try {
        const data = await api<MockExamDetail>(`/api/content/mock-exams/${slug}`);
        if (cancelled) return;
        setExam(data);
        setSecondsLeft(data.durationMin * 60);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Imtihon topilmadi");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slug]);

  const finish = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const answers = Object.values(answersRef.current);
    setResults({
      score: answers.reduce((sum, a) => sum + (a.correct ? a.points : 0), 0),
      maxScore: exam?.maxPoints ?? 0,
      correct: answers.filter((a) => a.correct).length,
      total: items.length,
    });
  }, [exam?.maxPoints, items.length]);

  useEffect(() => {
    if (!started || results) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, results, finish]);

  function begin() {
    setStarted(true);
    setCursor(0);
    answersRef.current = {};
    setAnsweredCount(0);
    setVerdict(null);
    setFeedback(null);
    setFreeText("");
    setResults(null);
  }

  async function submit(given: string) {
    if (!exam || !current || submitting || verdict) return;
    setSubmitting(true);
    try {
      const data = await api<MockExamAnswerResponse>(
        `/api/content/mock-exams/${exam.slug}/answer`,
        {
          method: "POST",
          body: JSON.stringify({
            questionId: current.id,
            given,
            ms: 0,
          }),
        }
      );
      answersRef.current[current.id] = {
        correct: data.correct,
        points: data.correct ? data.points : 0,
      };
      setAnsweredCount(Object.keys(answersRef.current).length);
      setVerdict(data.correct ? "correct" : "wrong");
      setFeedback({
        explanation: data.explanation,
        expected: data.expected,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Javob yuborilmadi");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    setVerdict(null);
    setFeedback(null);
    setFreeText("");
    if (cursor + 1 >= items.length) {
      finish();
      return;
    }
    setCursor((c) => c + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Imtihon tayyorlanmoqda…</p>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => navigate("/mock-exams")} className="btn-secondary">
            Imtihonlar ro‘yxati
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  if (results) {
    const pct = results.maxScore > 0 ? Math.round((results.score / results.maxScore) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-semibold">{exam.title}</h1>
          <div className="auth-card space-y-2 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="text-4xl font-semibold">{results.score}</div>
            <p className="text-sm text-muted-foreground">
              / {results.maxScore} ball · {pct}%
            </p>
            <p className="text-sm text-muted-foreground">
              {results.correct} / {results.total} to‘g‘ri javob
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Xatolar takrorlash navbatiga tushdi. Dashboard’dan “Takrorlash” bo‘limida
            ularni yechishingiz mumkin.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate("/dashboard")} className="btn-primary">
              Dashboard
            </button>
            <button onClick={begin} className="btn-secondary">
              Qayta ishlash
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg space-y-6">
          <button
            onClick={() => navigate("/mock-exams")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            ← Imtihonlar
          </button>
          <div className="space-y-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
              {exam.exam}
            </span>
            <h1 className="text-2xl font-semibold">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">{exam.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{exam.itemCount}</p>
              <p className="text-xs text-muted-foreground">savol</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{exam.durationMin}</p>
              <p className="text-xs text-muted-foreground">daqiqa</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="font-semibold">{exam.maxPoints}</p>
              <p className="text-xs text-muted-foreground">ball</p>
            </div>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {exam.sections.map((s) => (
              <li key={s.title} className="flex justify-between">
                <span>{s.title}</span>
                <span>{s.questions.length} savol</span>
              </li>
            ))}
          </ul>
          <button onClick={begin} className="btn-primary w-full">
            Imtihonni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-sm font-semibold">{current.section}</h1>
            <p className="text-xs text-muted-foreground">
              Savol {cursor + 1} / {items.length} · {answeredCount} yechilgan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                secondsLeft < 60
                  ? "bg-red-50 text-red-700"
                  : "bg-secondary text-muted-foreground"
              }`}
              aria-label="Qolgan vaqt"
            >
              {formatClock(secondsLeft)}
            </span>
            <button
              onClick={finish}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Tugatish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-5 py-10">
        {feedback ? (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              verdict === "correct"
                ? "verdict-correct border-green-200 bg-green-50"
                : "verdict-wrong border-red-200 bg-red-50"
            }`}
          >
            <p className="font-medium">
              {verdict === "correct" ? "To‘g‘ri" : "Noto‘g‘ri"}
            </p>
            {feedback.expected ? (
              <p className="mt-1 text-muted-foreground">
                To‘g‘ri javob: {feedback.expected}
              </p>
            ) : null}
            {feedback.explanation ? (
              <p className="mt-1 text-muted-foreground">{feedback.explanation}</p>
            ) : null}
          </div>
        ) : null}

        <section className="auth-card space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
          <QuestionBody
            question={current}
            value={freeText}
            onChange={setFreeText}
            disabled={submitting || Boolean(verdict)}
            onChoose={submit}
          />
        </section>

        {verdict ? (
          <button onClick={next} className="btn-primary w-full">
            {cursor + 1 >= items.length ? "Natijani ko‘rish" : "Keyingi savol"}
          </button>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </main>
    </div>
  );
}
