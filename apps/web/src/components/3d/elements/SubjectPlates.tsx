import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import type { Group, Sprite } from "three";
import { glyphPlate } from "../lib/glyphs";

/** The exam subjects, set on short glowing plates. */
const PLATES = [
  { label: "SAT", color: "#ffd166", radius: 1.5, phase: 0, y: 0.85 },
  { label: "IELTS", color: "#3ddc84", radius: 1.35, phase: 2.1, y: -0.55 },
  { label: "π", color: "#47bfff", radius: 1.25, phase: 4.2, y: 1.25 },
  { label: "A+", color: "#c8a2ff", radius: 1.45, phase: 5.4, y: -1.15 },
];

/**
 * SAT, IELTS, π and A+ circling the hero globe. The plates always face the
 * camera and keep a small footprint, so the subjects read as part of the
 * world rather than a label pasted over the copy.
 */
export function SubjectPlates({
  speed = 0.14,
  scale = 0.4,
}: {
  speed?: number;
  /** Width of a plate in world units; kept small so it never crowds copy. */
  scale?: number;
}) {
  const group = useRef<Group>(null);
  const sprites = useRef<(Sprite | null)[]>([]);
  const textures = useMemo(
    () => PLATES.map((plate) => glyphPlate(plate.label)),
    [],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    const step = Math.min(delta, 0.05);
    node.rotation.y += step * speed;
    for (let i = 0; i < sprites.current.length; i++) {
      const sprite = sprites.current[i];
      if (sprite) {
        sprite.position.y =
          PLATES[i].y + Math.sin(state.clock.elapsedTime * 0.7 + i * 1.7) * 0.08;
      }
    }
  });

  return (
    <group ref={group}>
      {PLATES.map((plate, i) => (
        <sprite
          key={plate.label}
          ref={(node) => {
            sprites.current[i] = node;
          }}
          position={[
            Math.cos(plate.phase) * plate.radius,
            plate.y,
            Math.sin(plate.phase) * plate.radius,
          ]}
          scale={[scale, scale * 0.5, 1]}
        >
          <spriteMaterial
            map={textures[i]}
            color={plate.color}
            transparent
            opacity={0.72}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}
