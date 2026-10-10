import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { PLACEMENT_SUBJECTS, subjectLabel } from "@/lib/subjects";

/** How long the verdict stays on the card before it flips to the next one. */
const VERDICT_HOLD_MS = 400;
/** Hard ceiling on the adaptive test (server stops earlier when SE is low). */
const MAX_ITEMS = 25;

const SUBJECT_CHIPS = PLACEMENT_SUBJECTS;

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
  const [resumed, setResumed] = useState(false);
  const [subject, setSubject] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get("subject")
  );
  const reducedMotion = useReducedMotion();
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootRef = useRef(false);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  const load = useCallback(
    async (restart = false, nextSubject?: string | null) => {
      const s = nextSubject === undefined ? subject : nextSubject;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (restart) params.set("restart", "1");
        if (s) params.set("subject", s);
        const qs = params.toString();
        const data = await api<PlacementStartResponse>(
          `/api/content/placement/start${qs ? `?${qs}` : ""}`
        );
        setQuestion(data.question);
        setAnswered(data.answered);
        setResumed(Boolean(data.resumed));
        setVerdict(null);
        setSubmitting(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Savollar yuklanmadi");
      } finally {
        setLoading(false);
      }
    },
    [subject]
  );

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    let cancelled = false;

    load(false).catch(() => {
      if (!cancelled) setError("Savollar yuklanmadi");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  function restart() {
    setResult(null);
    setEarnedMedals([]);
    load(true).catch(() => {
      /* load() already sets the error */
    });
  }

  function switchSubject(next: string | null) {
    setResult(null);
    setEarnedMedals([]);
    setSubject(next);
    const params = new URLSearchParams();
    if (next) params.set("subject", next);
    setSearchParams(params, { replace: true });
    load(true, next).catch(() => {
      /* load() already sets the error */
    });
  }

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
          <div className="space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              Boshqa fandan qayta o‘lchash
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUBJECT_CHIPS.map((chip) => (
                <button
                  key={chip.value ?? "all-result"}
                  onClick={() => switchSubject(chip.value)}
                  className="rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
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
            <span className="flex items-center gap-2">
              {resumed ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
                  Davom ettirish
                </span>
              ) : null}
              {subjectLabel(subject)}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_CHIPS.map((chip) => {
              const active = chip.value === subject;
              return (
                <button
                  key={chip.value ?? "all"}
                  onClick={() => switchSubject(chip.value)}
                  disabled={submitting || chip.value === subject}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-70 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
          {resumed ? (
            <button
              onClick={restart}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Boshidan boshlash
            </button>
          ) : null}
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
