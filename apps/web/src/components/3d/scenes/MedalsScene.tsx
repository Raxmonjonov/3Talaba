import { Suspense, useMemo, useRef } from "react";
import type { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { AchievementTier } from "@/lib/types";
import {
  use3DReady,
  useDeviceQuality,
  useWideViewport,
} from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";
import { usePointer } from "../hooks/usePointer";
import { PointerRig } from "../elements/PointerRig";

export interface MedalItem {
  slug: string;
  tier: AchievementTier;
  earned: boolean;
}

const TIER_COLOR: Record<AchievementTier, string> = {
  bronze: "#cd7f32",
  silver: "#c0c8d4",
  gold: "#ffd166",
};

const LOCKED_COLOR = "#3a4568";

/** One floating medal: lit metal when earned, a dull slate disc when locked. */
function Medal({
  item,
  col,
  row,
  cols,
  gap,
  active,
}: {
  item: MedalItem;
  col: number;
  row: number;
  cols: number;
  gap: number;
  active: boolean;
}) {
  const group = useRef<Group>(null);
  const color = item.earned ? TIER_COLOR[item.tier] : LOCKED_COLOR;
  const emissive = item.earned ? color : "#1a2238";
  const intensity = item.earned ? 0.45 : 0.12;

  useFrame((state) => {
    if (!group.current || !active) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = row * gap + Math.sin(t * 1.1 + col * 0.7) * 0.06;
    group.current.rotation.y = Math.sin(t * 0.55 + col) * 0.35;
  });

  return (
    <group
      ref={group}
      position={[(col - (cols - 1) / 2) * gap, row * gap, 0]}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={item.earned ? 0.35 : 0.8}
          metalness={item.earned ? 0.55 : 0.15}
          emissive={emissive}
          emissiveIntensity={intensity}
        />
      </mesh>
      {/* Ribbon stub so a locked disc still reads as a medal, not a coin. */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.11, 0.2, 0.04]} />
        <meshStandardMaterial
          color={item.earned ? "#7e14ff" : LOCKED_COLOR}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function MedalsScene({ items }: { items: MedalItem[] }) {
  const ready = use3DReady();
  const quality = useDeviceQuality();
  const wide = useWideViewport();
  const pointer = usePointer();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);

  // Phones get a narrower grid and a camera that pulls back far enough for
  // the horizontal FOV; desktop keeps the wide six-across shelf.
  const cols = wide ? 6 : 3;
  const gap = wide ? 0.95 : 0.8;
  const cameraZ = wide ? 4.2 : 5.6;

  const placed = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        col: index % cols,
        row: Math.floor(index / cols),
      })),
    [items, cols],
  );

  if (!ready) return null;

  const rows = Math.max(1, Math.ceil(items.length / cols));
  const heightPx = rows <= 1 ? 160 : rows === 2 ? 224 : rows === 3 ? 288 : 352;

  return (
    <div
      ref={host}
      className="w-full"
      style={{ height: heightPx }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        camera={{ position: [0, 0.2, cameraZ], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 5]} intensity={1} color="#c8b6ff" />
        <pointLight position={[-3, 1, 2]} intensity={0.5} color="#47bfff" />
        <Suspense fallback={null}>
          <group position={[0, -((rows - 1) * gap) / 2, 0]}>
            {placed.map(({ item, col, row }) => (
              <Float
                key={item.slug}
                speed={0.6 + (col % 3) * 0.15}
                rotationIntensity={0.05}
                floatIntensity={0.12}
              >
                <Medal
                  item={item}
                  col={col}
                  row={row}
                  cols={cols}
                  gap={gap}
                  active={active}
                />
              </Float>
            ))}
          </group>
        </Suspense>
        {quality === "high" ? (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.25} luminanceThreshold={0.75} />
          </EffectComposer>
        ) : null}
        <PointerRig pointer={pointer} reach={0.3} lookAt={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}

export default MedalsScene;
