import { useEffect, useRef } from "react";
import { createAnimatable } from "animejs";
import { useReducedMotion } from "./usePerfFlags";

/**
 * Pointer-tracked 3D tilt for a call-to-action button: the plate leans toward
 * the cursor, which makes the primary action feel like a physical object you
 * can press.
 *
 * Built on anime.js createAnimatable so there is not a single React render
 * per pointer move. The tilt is dropped entirely for a coarse pointer and for
 * reduced motion / the Settings motion opt-out.
 */
export function useTilt3D<T extends HTMLElement>(reach = 9) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const animatable = createAnimatable(el, {
      x: { duration: 400, ease: "outCubic" },
      rotateX: { duration: 400, ease: "outCubic" },
      rotateY: { duration: 400, ease: "outCubic" },
    });

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      animatable.rotateY(nx * reach);
      animatable.rotateX(-ny * (reach * 0.7));
      animatable.y(-2);
      el.style.setProperty("--shine-x", `${(nx + 1) * 50}%`);
    };

    const onLeave = () => {
      animatable.rotateX(0);
      animatable.rotateY(0);
      animatable.y(0);
      el.style.setProperty("--shine-x", "50%");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      animatable.revert();
    };
  }, [reach, reduced]);

  return ref;
}
