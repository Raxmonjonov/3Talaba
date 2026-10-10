import { Suspense, useMemo, useRef } from "react";
import type { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { AchievementTier } from "@/lib/types";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
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

const LOCKED_COLOR = "#26304f";

const COLS = 6;
const GAP = 0.95;

/** One floating medal: lit metal when earned, a dull slate disc when locked. */
function Medal({
  item,
  col,
  row,
  active,
}: {
  item: MedalItem;
  col: number;
  row: number;
  active: boolean;
}) {
  const group = useRef<Group>(null);
  const color = item.earned ? TIER_COLOR[item.tier] : LOCKED_COLOR;
  const emissive = item.earned ? color : "#0b1020";
  const intensity = item.earned ? 0.45 : 0.05;

  useFrame((state) => {
    if (!group.current || !active) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = row * GAP + Math.sin(t * 1.1 + col * 0.7) * 0.06;
    group.current.rotation.y = Math.sin(t * 0.55 + col) * 0.35;
  });

  return (
    <group ref={group} position={[(col - (COLS - 1) / 2) * GAP, row * GAP, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 28]} />
        <meshStandardMaterial
          color={color}
          roughness={item.earned ? 0.35 : 0.8}
          metalness={item.earned ? 0.55 : 0.15}
          emissive={emissive}
          emissiveIntensity={intensity}
        />
      </mesh>
      {/* Ribbon stub so a locked disc still reads as a medal, not a coin. */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.12, 0.22, 0.04]} />
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
  const pointer = usePointer();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);

  const placed = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        col: index % COLS,
        row: Math.floor(index / COLS),
      })),
    [items],
  );

  if (!ready) return null;

  const rows = Math.max(1, Math.ceil(items.length / COLS));
  const heightClass = rows <= 1 ? "h-40" : rows === 2 ? "h-56" : "h-72";

  return (
    <div ref={host} className={`w-full ${heightClass}`} aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        camera={{ position: [0, 0.3, 4.2], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 5]} intensity={1} color="#c8b6ff" />
        <pointLight position={[-3, 1, 2]} intensity={0.5} color="#47bfff" />
        <Suspense fallback={null}>
          <group position={[0, -((rows - 1) * GAP) / 2, 0]}>
            {placed.map(({ item, col, row }) => (
              <Float
                key={item.slug}
                speed={0.6 + (col % 3) * 0.15}
                rotationIntensity={0.05}
                floatIntensity={0.12}
              >
                <Medal item={item} col={col} row={row} active={active} />
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
