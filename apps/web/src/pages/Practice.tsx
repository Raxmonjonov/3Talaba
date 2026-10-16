import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type {
  PracticeAnswerResponse,
  ServedQuestion,
} from "../lib/types";
import { QuestionBody } from "@/components/QuestionBody";
import { QuestionCard3D } from "@/components/3d/elements/QuestionCard3D";
import { VerdictPanel } from "@/components/VerdictPanel";
import { subjectLabel } from "@/lib/subjects";
import { AppShell } from "@/components/AppShell";

/** Soft cap so a session cannot loop forever on a huge bank. */
const MAX_DRILL = 12;

/** Fallback per-question target when a question carries no timing hint. */
const DEFAULT_PACE_SECONDS = 60;

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

const CONFIDENCE_LEVELS = [
  { level: 1, label: "Past" },
  { level: 2, label: "O‘rta" },
  { level: 3, label: "Yuqori" },
] as const;

/**
 * Metacognitive calibration feedback: compares how sure the student felt with
 * whether they were actually right. Overconfidence (sure but wrong) is the
 * most dangerous case and gets called out.
 */
function confidenceNote(verdict: "correct" | "wrong", level: number): string {
  if (verdict === "wrong" && level === 3) {
    return "Ishonchingiz komil edi, ammo javob xato — bu eng xavfli xatolik (haddan ziyod ishonch). Buni albatta ko‘rib chiqing.";
  }
  if (verdict === "wrong" && level === 1) {
    return "Ishonchingiz past edi va xato bo‘ldi — o‘rganish jarayonida bu normal holat.";
  }
  if (verdict === "correct" && level === 1) {
    return "To‘g‘ri chiqdi, lekin ishonchingiz past edi — bu mavzuni yana mashq qilib mustahkamlang.";
  }
  if (verdict === "correct" && level === 3) {
    return "Ishonch va natija mos keldi — bilimingiz puxta.";
  }
  return "Ishonch va natija o‘rtasidagi moslikni kuzatib boring.";
}

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject");
  const skill = searchParams.get("skill");
  const skillsParam = searchParams.get("skills");
  const reviewMode = searchParams.get("review") === "1";
  const [question, setQuestion] = useState<ServedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [verdict, setVerdict] = useState<"correct" | "wrong" | null>(null);
  const [freeText, setFreeText] = useState("");
  const [feedback, setFeedback] = useState<{
    explanation?: string;
    expected?: string;
    interval?: string;
  } | null>(null);
  const [recallMode, setRecallMode] = useState(!reviewMode);
  const [feynmanAnswer, setFeynmanAnswer] = useState("");
  const [askingFeynman, setAskingFeynman] = useState(false);
  const [confidenceMode, setConfidenceMode] = useState(
    searchParams.get("confidence") === "1"
  );
  const [timedMode, setTimedMode] = useState(searchParams.get("timed") === "1");
  const [paceLeft, setPaceLeft] = useState<number | null>(null);
  const [answeredMs, setAnsweredMs] = useState<number | null>(null);
  const [pending, setPending] = useState<{ given: string; ms: number } | null>(
    null
  );
  const [answeredConfidence, setAnsweredConfidence] = useState<number | null>(
    null
  );
  const seenRef = useRef<string[]>([]);
  const startedRef = useRef(0);
  const showQuestion = Boolean(question) && !askingFeynman;

  const scopeLabel = skill
    ? skill
    : skillsParam
      ? `${skillsParam.split(",").length} mavzu`
      : subject
        ? subjectLabel(subject)
        : reviewMode
          ? "Takrorlash navbati"
          : "Umumiy savol zaxirasi";

  function clearFilter() {
    if (skill || skillsParam) {
      navigate("/skills");
      return;
    }
    navigate(reviewMode ? "/practice?review=1" : "/practice");
  }

  const loadNext = useCallback(
    async (exclude: string[]) => {
      const params = new URLSearchParams();
      if (exclude.length) params.set("exclude", exclude.join(","));
      if (subject) params.set("subject", subject);
      if (skill) params.set("skill", skill);
      if (skillsParam) params.set("skills", skillsParam);
      if (reviewMode) params.set("review", "1");
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await api<{ question: ServedQuestion }>(
        `/api/content/practice/next${query}`
      );
      setQuestion(data.question);
      setFreeText("");
      setPaceLeft(
        data.question?.seconds && data.question.seconds > 0
          ? data.question.seconds
          : DEFAULT_PACE_SECONDS
      );
    },
    [subject, skill, skillsParam, reviewMode]
  );

  useEffect(() => {
    let cancelled = false;
    startedRef.current = Date.now();
    loadNext([])
      .catch((err) => {
        if (cancelled) return;
        // Empty review queue is a normal end, not an error.
        if (reviewMode) {
          setQuestion(null);
          setError("");
          return;
        }
        setError(err instanceof Error ? err.message : "Savol topilmadi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadNext, reviewMode]);

  // Timed practice ("imtihon sur'ati"): count down the per-question target so
  // the student rehearses answering under exam-like time pressure. It never
  // blocks answering — running out just flags the pace.
  const paceTarget =
    question?.seconds && question.seconds > 0
      ? question.seconds
      : DEFAULT_PACE_SECONDS;

  useEffect(() => {
    if (!timedMode || !question || verdict || pending || askingFeynman) return;
    const id = setInterval(() => {
      setPaceLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [timedMode, question, verdict, pending, askingFeynman]);

  function choose(given: string) {
    if (!question || submitting || answered >= MAX_DRILL || verdict || pending) {
      return;
    }

    const ms = Math.max(0, Date.now() - startedRef.current);

    // Metacognitive calibration: when enabled, ask the student how sure they
    // are *before* revealing the result, so confidence can be compared to it.
    if (confidenceMode) {
      setPending({ given, ms });
      return;
    }

    void submit(given, null, ms);
  }

  async function submit(given: string, confidence: number | null, ms: number) {
    if (!question) return;

    setPending(null);
    setSubmitting(true);
    setAnsweredConfidence(confidence);
    setAnsweredMs(ms);
    startedRef.current = Date.now();

    try {
      const data = await api<PracticeAnswerResponse>(
        "/api/content/practice/answer",
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            given,
            ms,
            ...(confidence != null ? { confidence } : {}),
          }),
        }
      );

      setAnswered((n) => n + 1);
      if (!seenRef.current.includes(question.id)) {
        seenRef.current = [...seenRef.current, question.id];
      }
      setVerdict(data.correct ? "correct" : "wrong");
      setFeedback({
        explanation: data.explanation,
        expected: data.expected,
        interval: data.review?.interval,
      });
      if (data.correct) {
        const nextCorrect = correctCount + 1;
        setCorrectCount(nextCorrect);
        // Feynman technique: every other correct answer, ask the student to
        // explain the concept in their own words to cement it (active recall).
        if (recallMode && nextCorrect % 2 === 0) {
          setAskingFeynman(true);
        }
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
    setPending(null);
    setAnsweredConfidence(null);
    setAnsweredMs(null);
    if (answered >= MAX_DRILL) {
      navigate("/dashboard");
      return;
    }
    setLoading(true);
    try {
      await loadNext(seenRef.current);
      startedRef.current = Date.now();
    } catch (err) {
      // Empty review queue is a normal end, not an error.
      if (reviewMode) {
        setQuestion(null);
        setError("");
        return;
      }
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
          <h1 className="text-2xl font-semibold">
            {reviewMode ? "Takrorlash tugadi" : "Mashq tugadi"}
          </h1>
          <p className="text-muted-foreground">
            {correctCount} / {answered} to‘g‘ri.{" "}
            {reviewMode
              ? "Navbat tozalandi — xatolar keyin qayta keladi."
              : "Xatolar keyin qayta keladi."}
          </p>
          <button onClick={() => navigate("/dashboard")} className="btn-primary">
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      title={
        askingFeynman
          ? "Feynman usuli"
          : reviewMode
            ? "Takrorlash"
            : "Mashq"
      }
      subtitle={
        <>
          <span className="block truncate">
            {answered} / {MAX_DRILL} · {correctCount} to‘g‘ri
          </span>
          <span className="block truncate">{scopeLabel}</span>
        </>
      }
      maxWidth="max-w-2xl"
      backTo="/dashboard"
      backLabel="Dashboard"
      actions={
        <div className="flex items-center gap-3">
          {!reviewMode ? (
            <button
              onClick={() => setRecallMode((v) => !v)}
              className={`text-sm underline underline-offset-4 ${
                recallMode ? "text-primary" : "text-muted-foreground"
              }`}
              title="To‘g‘ri javobdan keyin tushunchani o‘z so‘zlaringiz bilan tushuntirasiz (Feynman usuli)"
            >
              Feynman: {recallMode ? "yoqilgan" : "o‘chiq"}
            </button>
          ) : null}
          <button
            onClick={() => setConfidenceMode((v) => !v)}
            className={`text-sm underline underline-offset-4 ${
              confidenceMode ? "text-primary" : "text-muted-foreground"
            }`}
            title="Javobdan oldin ishonchingizni belgilaysiz — bu o‘z bilimingizni to‘g‘ri baholashni (metakognitsiya) o‘rgatadi"
          >
            Ishonch: {confidenceMode ? "yoqilgan" : "o‘chiq"}
          </button>
          <button
            onClick={() => setTimedMode((v) => !v)}
            className={`text-sm underline underline-offset-4 ${
              timedMode ? "text-primary" : "text-muted-foreground"
            }`}
            title="Har bir savol uchun maqsadli vaqt ko‘rsatiladi — imtihon sur'atida javob berishni mashq qilasiz"
          >
            Vaqt: {timedMode ? "yoqilgan" : "o‘chiq"}
          </button>
          {skill || skillsParam || subject ? (
            <button
              onClick={clearFilter}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Filtrni tozalash
            </button>
          ) : null}
          {timedMode && question && !verdict ? (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
                paceLeft != null && paceLeft <= 10
                  ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200"
                  : "bg-secondary text-muted-foreground"
              }`}
              aria-label="Qolgan vaqt"
            >
              {paceLeft != null && paceLeft <= 0
                ? "Vaqt tugadi"
                : formatClock(paceLeft ?? paceTarget)}
            </span>
          ) : null}
        </div>
      }
      showNav={false}
    >
        {feedback ? (
          <VerdictPanel verdict={verdict} feedback={feedback} />
        ) : null}

        {verdict && answeredConfidence != null ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {confidenceNote(verdict, answeredConfidence)}
          </p>
        ) : null}

        {timedMode && verdict && answeredMs != null ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            {answeredMs <= paceTarget * 1000 ? (
              <>
                Vaqt: {Math.round(answeredMs / 1000)}s — maqsad {paceTarget}s.
                Imtihon sur'atiga sig‘dingiz. ✓
              </>
            ) : (
              <>
                Vaqt: {Math.round(answeredMs / 1000)}s — maqsad {paceTarget}s.
                Bir oz sekin: savolni tezroq o‘qish yoki yechish strategiyasini
                mashq qiling.
              </>
            )}
          </p>
        ) : null}

        {showQuestion ? (
          <QuestionCard3D
            step={answered}
            verdict={verdict}
            className="auth-card space-y-6 rounded-2xl border bg-card p-8 shadow-sm"
          >
            <QuestionBody
              question={question!}
              value={freeText}
              onChange={setFreeText}
              disabled={submitting || Boolean(verdict) || Boolean(pending)}
              onChoose={choose}
            />
          </QuestionCard3D>
        ) : null}

        {pending ? (
          <div className="auth-card space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold">Javobni yuborishdan oldin</h2>
            <p className="text-sm text-muted-foreground">
              O‘zingizga qanchalik ishonchingiz komil? Bu — o‘z bilimingizni to‘g‘ri
              baholash (metakognitsiya) mashqi.
            </p>
            <div className="flex flex-wrap gap-3">
              {CONFIDENCE_LEVELS.map((item) => (
                <button
                  key={item.level}
                  onClick={() => submit(pending.given, item.level, pending.ms)}
                  disabled={submitting}
                  className="btn-secondary"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {askingFeynman ? (
          <div className="auth-card space-y-4 rounded-2xl border bg-card p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Feynman usuli — tushuntirib bering</h2>
            <p className="text-sm text-muted-foreground">
              Savolni to‘g‘ri yechdingiz. Endi shu tushunchani o‘zingizning so‘zlaringiz bilan,
              hech narsani bilmaydigan odamga oddiy qilib tushuntirib bering. Bu bilimni
              mustahkamlaydi (active recall + elaboration).
            </p>
            <textarea
              value={feynmanAnswer}
              onChange={(e) => setFeynmanAnswer(e.target.value)}
              placeholder="Masalan: bu nimani anglatadi, qanday ishlaydi, misol bilan tushuntiring..."
              className="field min-h-[120px] resize-y"
              autoFocus
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (!feynmanAnswer.trim()) return;
                  setAskingFeynman(false);
                  setFeynmanAnswer("");
                }}
                disabled={!feynmanAnswer.trim()}
                className="btn-primary"
              >
                Tushuntirishni saqlash
              </button>
              <button
                onClick={() => {
                  setAskingFeynman(false);
                  setFeynmanAnswer("");
                }}
                className="btn-secondary"
              >
                O‘tkazib yuborish
              </button>
            </div>
          </div>
        ) : null}

        {verdict && !askingFeynman ? (
          <button onClick={next} className="btn-primary w-full">
            {answered >= MAX_DRILL ? "Tugatish" : "Keyingi savol"}
          </button>
        ) : null}

        {error ? (
          <p className="alert-error">
            {error}
          </p>
        ) : null}
    </AppShell>
  );
}
