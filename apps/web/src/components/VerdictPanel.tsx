import { useEffect, useRef } from "react";
import { animateVerdict } from "@/lib/anime";

type Verdict = "correct" | "wrong" | null;

type Feedback = {
  explanation?: string;
  expected?: string;
  interval?: string;
};

/**
 * Shared quiz feedback panel. A green line draws across a correct answer;
 * a wrong one shakes once. Both honour prefers-reduced-motion and the
 * Settings "Animatsiyalarni kamaytirish" toggle.
 */
export function VerdictPanel({
  verdict,
  feedback,
}: {
  verdict: Verdict;
  feedback: Feedback | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!feedback || !verdict) return;
    animateVerdict(panelRef.current, verdict);
  }, [verdict, feedback]);

  if (!feedback || !verdict) return null;

  return (
    <div
      ref={panelRef}
      role="status"
      className={`relative overflow-hidden rounded-xl border px-4 py-3 text-sm ${
        verdict === "correct"
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-200"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
      }`}
    >
      <span
        data-verdict-line
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-current opacity-40"
      />
      <p className="font-medium">
        {verdict === "correct" ? "To‘g‘ri" : "Noto‘g‘ri"}
      </p>
      {feedback.expected ? (
        <p className="mt-1 opacity-90">To‘g‘ri javob: {feedback.expected}</p>
      ) : null}
      {feedback.explanation ? (
        <p className="mt-1 opacity-90">{feedback.explanation}</p>
      ) : null}
      {feedback.interval ? (
        <p className="mt-1 text-xs opacity-80">
          Keyingi takrorlash: {feedback.interval}
        </p>
      ) : null}
    </div>
  );
}
