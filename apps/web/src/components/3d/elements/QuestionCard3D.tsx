import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
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
 * arrives. Nothing here changes the DOM structure the tests rely on, and every
 * animation is skipped under prefers-reduced-motion.
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

    const tween = gsap.fromTo(
      cardRef.current,
      { rotateY: -24, y: 14, opacity: 0.55 },
      { rotateY: 0, y: 0, opacity: 1, duration: 0.32, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, [step, reduced]);

  useEffect(() => {
    if (reduced || !verdict || !cardRef.current) return;
    const el = cardRef.current;

    const tweens =
      verdict === "correct"
        ? [
            gsap.fromTo(
              el,
              { boxShadow: "0 0 0 0 hsl(142 70% 45% / 0)" },
              {
                boxShadow: "0 0 32px 2px hsl(142 70% 45% / 0.5)",
                duration: 0.22,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
              },
            ),
          ]
        : [
            gsap.fromTo(
              el,
              { x: -6 },
              { x: 6, duration: 0.05, repeat: 5, yoyo: true, ease: "none" },
            ),
          ];

    return () => {
      tweens.forEach((t) => t.kill());
      gsap.set(el, { x: 0 });
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
