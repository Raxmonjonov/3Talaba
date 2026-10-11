import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, RepeatWrapping } from "three";
import type { Group, Sprite } from "three";
import { glyphPlate, rainStrip } from "../lib/glyphs";

type Column = {
  x: number;
  z: number;
  speed: number;
  opacity: number;
  scaleY: number;
  offset: number;
};

/**
 * Soft Matrix rain: falling digits and letters instead of harsh neon lines.
 * Every column is a plane sharing one rasterised glyph strip — the clones only
 * differ in UV offset, so the GPU uploads the pixels once and the whole rain is
 * a handful of additive quads. Columns drift at deterministic speeds and wrap,
 * so nothing is allocated inside the frame loop.
 */
export function MatrixRain({
  count,
  area,
  depth = 4,
  tint = "#3ddc84",
  opacity = 0.5,
}: {
  count: number;
  /** Half-width of the band the rain fills, in world units. */
  area: number;
  /** How far back along -z the columns spread; the corridor uses ~46. */
  depth?: number;
  tint?: string;
  opacity?: number;
}) {
  const base = useMemo(() => rainStrip(), []);
  const columns = useMemo<Column[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = (i + 1) * 0.618033988749895;
        return {
          x: (t - Math.floor(t) - 0.5) * 2 * area,
          z: -0.6 - ((t * 1.7) % 1) * depth,
          speed: 0.06 + ((t * 2.3) % 1) * 0.12,
          opacity: opacity * (0.45 + ((t * 3.1) % 1) * 0.55),
          scaleY: 5 + ((t * 4.3) % 1) * 6,
          offset: (t * 5.7) % 1,
        };
      }),
    [count, area, depth, opacity],
  );

  // Cloned textures share the source pixels; each one only carries its own UV
  // offset, which is exactly what makes the columns fall out of sync.
  const textures = useMemo(
    () =>
      columns.map((column) => {
        const texture = base.clone();
        texture.needsUpdate = true;
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.repeat.set(1, column.scaleY * 0.5);
        texture.offset.set(0, column.offset);
        return texture;
      }),
    [columns, base],
  );

  useEffect(
    () => () => {
      textures.forEach((texture) => texture.dispose());
    },
    [textures],
  );

  useFrame((_state, delta) => {
    const step = Math.min(delta, 0.05);
    for (let i = 0; i < textures.length; i++) {
      textures[i].offset.y =
        (textures[i].offset.y + step * columns[i].speed) % 1;
    }
  });

  return (
    <group>
      {columns.map((column, i) => (
        <mesh key={i} position={[column.x, 0, column.z]}>
          <planeGeometry args={[0.34, column.scaleY]} />
          <meshBasicMaterial
            map={textures[i]}
            color={tint}
            transparent
            opacity={column.opacity}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Satellites orbiting the hero globe: SAT, IELTS, π and A+. */
const PLATES = [
  { label: "SAT", color: "#ffd166", radius: 1.5, phase: 0, y: 0.85 },
  { label: "IELTS", color: "#3ddc84", radius: 1.35, phase: 2.1, y: -0.55 },
  { label: "π", color: "#47bfff", radius: 1.25, phase: 4.2, y: 1.25 },
  { label: "A+", color: "#c8a2ff", radius: 1.45, phase: 5.4, y: -1.15 },
];

/**
 * Text plates that always face the camera and slowly circle the globe, so the
 * exam subjects read as part of the world rather than a label pasted on top.
 */
export function SubjectPlates({ speed = 0.16 }: { speed?: number }) {
  const group = useRef<Group>(null);
  const meshes = useRef<(Sprite | null)[]>([]);
  const textures = useMemo(() => PLATES.map((plate) => glyphPlate(plate.label)), []);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;
    node.rotation.y += Math.min(delta, 0.05) * speed;
    for (let i = 0; i < meshes.current.length; i++) {
      const mesh = meshes.current[i];
      if (mesh) {
        mesh.position.y = PLATES[i].y + Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.09;
      }
    }
  });

  return (
    <group ref={group}>
      {PLATES.map((plate, i) => (
        <sprite
          key={plate.label}
          ref={(node) => {
            meshes.current[i] = node;
          }}
          position={[
            Math.cos(plate.phase) * plate.radius,
            plate.y,
            Math.sin(plate.phase) * plate.radius,
          ]}
          scale={[0.62, 0.31, 1]}
        >
          <spriteMaterial
            map={textures[i]}
            color={plate.color}
            transparent
            opacity={0.92}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}
