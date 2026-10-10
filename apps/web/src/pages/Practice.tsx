import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type {
  PracticeAnswerResponse,
  ServedQuestion,
} from "../lib/types";

/** Soft cap so a session cannot loop forever on a huge bank. */
const MAX_DRILL = 12;

export default function Practice() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<ServedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [feedback, setFeedback] = useState<{
    explanation?: string;
    expected?: string;
    interval?: string;
  } | null>(null);
  const seenRef = useRef<string[]>([]);
  const startedRef = useRef(0);

  const loadNext = useCallback(async (exclude: string[]) => {
    const query = exclude.length ? `?exclude=${encodeURIComponent(exclude.join(","))}` : "";
    const data = await api<{ question: ServedQuestion }>(
      `/api/content/practice/next${query}`
    );
    setQuestion(data.question);
  }, []);

  useEffect(() => {
    let cancelled = false;
    startedRef.current = Date.now();
    loadNext([])
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Savol topilmadi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadNext]);

  async function choose(optionIndex: number) {
    if (!question || submitting || answered >= MAX_DRILL) return;

    setSubmitting(true);
    const ms = Math.max(0, Date.now() - startedRef.current);
    startedRef.current = Date.now();

    try {
      const data = await api<PracticeAnswerResponse>(
        "/api/content/practice/answer",
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            given: String(optionIndex),
            ms,
          }),
        }
      );

      setAnswered((n) => n + 1);
      if (data.correct) setCorrectCount((n) => n + 1);
      setVerdict(data.correct ? "correct" : "wrong");
      setFeedback({
        explanation: data.explanation,
        expected: data.expected,
        interval: data.review?.interval,
      });

      if (!seenRef.current.includes(question.id)) {
        seenRef.current = [...seenRef.current, question.id];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Javob yuborilmadi");
    } finally {
      setSubmitting(false);
    }
  }

  async function next() {
    setVerdict(null);
    setFeedback(null);
    if (answered >= MAX_DRILL) {
      navigate("/dashboard");
      return;
    }
    setLoading(true);
    try {
      await loadNext(seenRef.current);
      startedRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Keyingi savol yo‘q");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Savol tayyorlanmoqda…</p>
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => navigate("/dashboard")} className="btn-secondary">
            Dashboardga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (answered >= MAX_DRILL || (!question && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Mashq tugadi</h1>
          <p className="text-muted-foreground">
            {correctCount} / {answered} to‘g‘ri. Xatolar keyin qayta keladi.
          </p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Mashq</h1>
            <p className="text-xs text-muted-foreground">
              {answered} / {MAX_DRILL} · {correctCount} to‘g‘ri
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Chiqish
          </button>
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
            {feedback.interval ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Keyingi takrorlash: {feedback.interval}
              </p>
            ) : null}
          </div>
        ) : null}

        {question ? (
          <section className="auth-card space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-medium">{question.prompt}</h2>
            <div className="grid gap-2">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={submitting || Boolean(verdict)}
                  className="rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {verdict ? (
          <button onClick={next} className="btn-primary w-full">
            {answered >= MAX_DRILL ? "Tugatish" : "Keyingi savol"}
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
