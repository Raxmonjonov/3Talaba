import { useEffect, useRef, type ReactNode } from "react";
import { animate } from "animejs";
import { useReducedMotion } from "../hooks/usePerfFlags";

type Verdict = "correct" | "wrong" | null | undefined;

type QuestionCard3DProps = {
  children: ReactNode;
  /** Bumping this flips the card onto the next question. */
  step: number;
  /** Fires the green bloom or the shake once we know the answer was right. */
  verdict?: Verdict;
  className?: string;
};

/**
 * Wraps the placement card in a 3D perspective plane: the sheet turns over as
 * the test advances, then blooms green or nudges sideways when a verdict
 * arrives. Driven by anime.js (same engine as the landing demos) and skipped
 * under prefers-reduced-motion or the Settings motion opt-out.
 */
export function QuestionCard3D({
  children,
  step,
  verdict,
  className,
}: QuestionCard3DProps) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);

  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    if (reduced || !cardRef.current) return;

    const anim = animate(cardRef.current, {
      rotateY: [-24, 0],
      y: [14, 0],
      opacity: [0.55, 1],
      duration: 320,
      ease: "outCubic",
    });

    return () => {
      anim.pause();
      anim.revert();
    };
  }, [step, reduced]);

  useEffect(() => {
    if (reduced || !verdict || !cardRef.current) return;
    const el = cardRef.current;

    const anim =
      verdict === "correct"
        ? animate(el, {
            scale: [1, 1.02, 1],
            duration: 420,
            ease: "outBack",
          })
        : animate(el, {
            x: [
              { value: -6 },
              { value: 6 },
              { value: -4 },
              { value: 4 },
              { value: 0 },
            ],
            duration: 320,
            ease: "outQuad",
          });

    return () => {
      anim.pause();
      anim.revert();
      el.style.transform = "";
    };
  }, [verdict, reduced]);

  return (
    <div className="stage-3d">
      <div
        ref={cardRef}
        className={className}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
}
