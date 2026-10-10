import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type {
  Achievement,
  PlacementAnswerResponse,
  PlacementStartResponse,
  Session,
  ServedQuestion,
} from "../lib/types";
import { QuestionCard3D } from "@/components/3d/elements/QuestionCard3D";
import { ConfettiBurst } from "@/components/3d/elements/ConfettiBurst";
import { useReducedMotion } from "@/components/3d/hooks/usePerfFlags";

/** How long the verdict stays on the card before it flips to the next one. */
const VERDICT_HOLD_MS = 400;
/** Hard ceiling on the adaptive test (server stops earlier when SE is low). */
const MAX_ITEMS = 25;

type AdaptiveResult = {
  currentLevel: number;
  answered: number;
  correctCount: number;
};

export default function Placement({
  onFinish,
}: {
  onFinish: (level: number) => void;
}) {
  const [question, setQuestion] = useState<ServedQuestion | null>(null);
  const [answered, setAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AdaptiveResult | null>(null);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [earnedMedals, setEarnedMedals] = useState<Achievement[]>([]);
  const reducedMotion = useReducedMotion();
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await api<PlacementStartResponse>(
          "/api/content/placement/start"
        );
        if (cancelled) return;
        setQuestion(data.question);
        setAnswered(data.answered);
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

  const finishWith = useCallback((data: PlacementAnswerResponse) => {
    const finished: AdaptiveResult = {
      currentLevel: data.currentLevel ?? 0,
      answered: data.answered,
      correctCount: data.correctCount ?? 0,
    };
    setResult(finished);
    api<Achievement[]>("/api/user/achievements?locale=uz")
      .then((all) => setEarnedMedals(all.filter((a) => a.earnedAt !== null)))
      .catch(() => {
        /* the result itself is enough without the shelf */
      });
  }, []);

  async function choose(optionIndex: number) {
    if (!question || submitting) return;

    setSubmitting(true);
    setVerdict(null);

    try {
      const data = await api<PlacementAnswerResponse>(
        "/api/content/placement/answer",
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            given: String(optionIndex),
          }),
        }
      );

      if (data.finished || !data.question) {
        finishWith(data);
        return;
      }

      if (reducedMotion) {
        setQuestion(data.question);
        setAnswered(data.answered);
        setSubmitting(false);
        return;
      }

      setVerdict(data.correct ? "correct" : "wrong");
      holdRef.current = setTimeout(() => {
        setVerdict(null);
        setQuestion(data.question ?? null);
        setAnswered(data.answered);
        setSubmitting(false);
      }, VERDICT_HOLD_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Javob yuborilmadi");
      setSubmitting(false);
    }
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
      <div className="relative min-h-screen flex items-center justify-center px-5 py-10">
        <ConfettiBurst trigger={1} />
        <div className="w-full max-w-lg space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Darajangiz aniqlandi</h1>
            <p className="text-muted-foreground text-sm">
              {result.correctCount} / {result.answered} to‘g‘ri javob
            </p>
          </div>

          <div className="auth-card space-y-2 rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="text-5xl font-semibold">{level}</div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>

          {earnedMedals.length > 0 ? (
            <section
              aria-label="Yangi yutuqlar"
              className="space-y-3 rounded-2xl border border-[#ffd166]/40 bg-[#ffd166]/10 p-5"
            >
              <h2 className="text-sm font-medium">Yangi yutuqlar</h2>
              <ul className="flex flex-wrap gap-3">
                {earnedMedals.map((medal) => (
                  <li
                    key={medal.slug}
                    className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"
                    title={medal.description}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-3 w-3 rounded-full ${
                        medal.tier === "gold"
                          ? "bg-[#ffd166]"
                          : medal.tier === "silver"
                            ? "bg-slate-400"
                            : "bg-amber-700"
                      }`}
                    />
                    {medal.title}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <button
            onClick={async () => {
              onFinish(level);
              // Client-side jump: a full reload would re-run /auth/me while the
              // server is still writing the placement medals, and SQLite can
              // make that boot spinner stick.
              try {
                const session = await api<Session>("/api/chat/start", {
                  method: "POST",
                });
                navigate(`/study/${session.id}`);
              } catch {
                navigate("/dashboard");
              }
            }}
            className="btn-primary w-full"
          >
            Darsni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Savol bazasi hozircha bo‘sh. Keyinroq urinib ko‘ring.
        </p>
      </div>
    );
  }

  // Adaptive length: show progress against the ceiling, not a fixed total.
  const progressPct = Math.min(100, ((answered + 1) / MAX_ITEMS) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Savol {answered + 1}</span>
            <span>Adaptiv daraja o‘lchovi</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <QuestionCard3D
          step={answered}
          verdict={verdict}
          className="auth-card space-y-6 rounded-2xl border bg-card p-8 shadow-sm"
        >
          <h1 className="text-xl font-medium">{question.prompt}</h1>
          <div className="grid gap-2">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={submitting}
                className="rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                {option.label}
              </button>
            ))}
          </div>
        </QuestionCard3D>

        <p className="text-center text-xs text-muted-foreground">
          Noto‘g‘ri javobdan qo‘rqmaydi — savollar sizga moslashadi.
        </p>
      </div>
    </div>
  );
}
