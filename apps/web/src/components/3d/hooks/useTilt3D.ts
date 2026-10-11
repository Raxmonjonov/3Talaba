import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "./usePerfFlags";

/**
 * Pointer-tracked 3D tilt for a call-to-action button: the plate leans toward
 * the cursor and its highlight slides across, which makes the primary action
 * feel like a physical object you can press.
 *
 * Everything is written straight to the DOM through GSAP quickTo, so there is
 * not a single React render per pointer move. The tilt is dropped entirely for
 * a coarse pointer (no hover to speak of) and for reduced motion.
 */
export function useTilt3D<T extends HTMLElement>(reach = 9) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rotateX = gsap.quickTo(el, "rotationX", {
      duration: 0.4,
      ease: "power2.out",
    });
    const rotateY = gsap.quickTo(el, "rotationY", {
      duration: 0.4,
      ease: "power2.out",
    });
    const lift = gsap.quickTo(el, "y", { duration: 0.4, ease: "power2.out" });
    const shine = gsap.quickTo(el, "--shine-x", {
      duration: 0.5,
    }) as unknown as (value: string) => void;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      rotateY(nx * reach);
      rotateX(-ny * (reach * 0.7));
      lift(-2);
      shine(`${(nx + 1) * 50}%`);
    };

    const onLeave = () => {
      rotateX(0);
      rotateY(0);
      lift(0);
      shine("50%");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reach, reduced]);

  return ref;
}
