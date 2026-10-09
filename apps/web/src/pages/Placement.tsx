import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import type { PlacementQuestion, PlacementResult } from "../lib/types";
import { QuestionCard3D } from "@/components/3d/elements/QuestionCard3D";
import { useReducedMotion } from "@/components/3d/hooks/usePerfFlags";

/** How long the verdict stays on the card before it flips to the next one. */
const VERDICT_HOLD_MS = 240;

export default function Placement({
  onFinish,
}: {
  onFinish: (level: number) => void;
}) {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const reducedMotion = useReducedMotion();
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api<PlacementQuestion[]>("/api/learning/placement");
        if (!cancelled) setQuestions(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Savollar yuklanmadi");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function grade(payload: Record<string, number>) {
    setSubmitting(true);
    try {
      setResult(
        await api<PlacementResult>("/api/learning/placement", {
          method: "POST",
          body: JSON.stringify({ answers: payload }),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Natija saqlanmadi");
    } finally {
      setSubmitting(false);
    }
  }

  function choose(optionIndex: number) {
    const question = questions[index];
    if (!question || submitting) return;

    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);
    setVerdict(null);

    if (index + 1 >= questions.length) {
      grade(next);
      return;
    }

    const advance = () => {
      setVerdict(null);
      setSubmitting(false);
      setIndex(index + 1);
    };

    // Reduced motion skips the score probe entirely: no animation to feed.
    if (reducedMotion) {
      advance();
      return;
    }

    setSubmitting(true);
    api<Pick<PlacementResult, "detail">>("/api/learning/placement", {
      method: "POST",
      body: JSON.stringify({ answers: next, check: true }),
    })
      .then((checked) => {
        const row = checked.detail.find((d) => d.id === question.id);
        setVerdict(row?.correct ? "correct" : "wrong");
        holdRef.current = setTimeout(advance, VERDICT_HOLD_MS);
      })
      .catch(() => advance());
  }

  useEffect(
    () => () => {
      if (holdRef.current) clearTimeout(holdRef.current);
    },
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Savollar tayyorlanmoqda…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const level = result.currentLevel;

    const summary =
      level === 0
        ? "Noldan boshlaymiz. Bu normal — har bir buyuk o‘qituvchi shundan boshlagan."
        : level <= 3
          ? "Boshlang‘ich qatlam. Poydevor mustahkamlanadi."
          : level <= 6
            ? "O‘rta qatlam. Endi tizimli ishlash boshlaydi."
            : "Yuqori qatlam. Murakkab mavzularga o‘tamiz.";

    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Darajangiz aniqlandi</h1>
            <p className="text-muted-foreground text-sm">
              {result.earned} / {result.possible} to‘g‘ri javob
            </p>
          </div>

          <div className="auth-card space-y-2 rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="text-5xl font-semibold">{level}</div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-medium">Har bir javob tahlili</h2>
            <ul className="space-y-2">
              {result.detail.map((d) => (
                <li
                  key={d.id}
                  className={`flex gap-2 text-sm ${
                    d.correct ? "verdict-correct" : "verdict-wrong"
                  }`}
                >
                  <span className={d.correct ? "text-foreground" : "text-red-700"}>
                    {d.correct ? "\u2713" : "\u2717"}
                  </span>
                  <span className="text-muted-foreground">{d.explain}</span>
                </li>
              ))}

            </ul>
          </div>

          <button onClick={() => onFinish(level)} className="btn-primary w-full">
            Darsni boshlash
          </button>
        </div>
      </div>
    );
  }

  const question = questions[index];

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Tayyorlanmoqda…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Savol {index + 1} / {questions.length}
            </span>
            <span>Daraja o‘lchovi</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <QuestionCard3D
          step={index}
          verdict={verdict}
          className="auth-card space-y-6 rounded-2xl border bg-card p-8 shadow-sm"
        >
          <h1 className="text-xl font-medium">{question.question}</h1>
          <div className="grid gap-2">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={submitting}
                className="rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                {option}
              </button>
            ))}
          </div>
        </QuestionCard3D>

        <p className="text-center text-xs text-muted-foreground">
          Noto‘g‘ri javobdan qo‘rqmaydi — bu sizga moslash uchun.
        </p>
      </div>
    </div>
  );
}