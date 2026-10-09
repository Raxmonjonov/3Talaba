import { useRef } from "react";
import type { RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Vec2 } from "../hooks/usePointer";

/**
 * Eases the camera toward the pointer so the stage feels like it is looking
 * back at you. The camera drifts around the position the scene declared, so
 * each stage keeps its own framing. Everything happens inside the frame loop:
 * no re-renders, no effects, and a zeroed vector on touch devices means a
 * steady camera.
 */
export function PointerRig({
  pointer,
  reach = 0.4,
  lookAt,
}: {
  pointer: RefObject<Vec2>;
  reach?: number;
  lookAt?: [number, number, number];
}) {
  const base = useRef<Vector3 | null>(null);
  const eased = useRef<Vec2>({ x: 0, y: 0 });
  const target = useRef(new Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (base.current === null) {
      base.current = state.camera.position.clone();
      if (lookAt) target.current.set(lookAt[0], lookAt[1], lookAt[2]);
    }

    const k = Math.min(Math.min(delta, 0.05) * 3, 1);
    eased.current.x += (pointer.current.x * reach - eased.current.x) * k;
    eased.current.y += (-pointer.current.y * reach * 0.7 - eased.current.y) * k;

    state.camera.position.set(
      base.current.x + eased.current.x,
      base.current.y + eased.current.y,
      base.current.z,
    );
    state.camera.lookAt(target.current);
  });

  return null;
}
