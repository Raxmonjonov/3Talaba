import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, RepeatWrapping } from "three";
import { rainStrip } from "../lib/glyphs";

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
 * differ in UV offset, so the GPU uploads the pixels once. Columns drift at
 * deterministic speeds and wrap; nothing is allocated inside the frame loop.
 */
export function MatrixRain({
  count,
  area,
  offsetX = 0,
  depth = 4,
  tint = "#3ddc84",
  opacity = 0.5,
}: {
  count: number;
  /** Half-width of the band the rain fills, in world units. */
  area: number;
  /** Shifts the whole band sideways; the hero pushes it clear of the copy. */
  offsetX?: number;
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
          x: offsetX + (t - Math.floor(t) - 0.5) * 2 * area,
          z: -0.6 - ((t * 1.7) % 1) * depth,
          speed: 0.06 + ((t * 2.3) % 1) * 0.12,
          opacity: opacity * (0.45 + ((t * 3.1) % 1) * 0.55),
          scaleY: 5 + ((t * 4.3) % 1) * 6,
          offset: (t * 5.7) % 1,
        };
      }),
    [count, area, offsetX, depth, opacity],
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
