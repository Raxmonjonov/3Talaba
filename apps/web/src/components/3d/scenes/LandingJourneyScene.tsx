import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";

/** Fractional part — a deterministic stand-in for Math.random during render. */
const frac = (n: number) => n - Math.floor(n);

type ProgressRef = { current: number };
type Depths = readonly [number, number, number];

/** Where the camera sits at the start of the page, and how far it travels. */
const CAMERA_NEAR = 3;
const CAMERA_TRAVEL = 37;
const CAMERA_END = CAMERA_NEAR - CAMERA_TRAVEL;

/** How far ahead of the camera a station sits when its section is centred. */
const LEAD = 5;

/**
 * Stations live off to the right of the camera path, so the reader's eye — and
 * the left-hand column where every heading sits — always looks down an empty
 * corridor. Only the gate at the very end is dead ahead. The offset shrinks
 * with the viewport, otherwise a phone's narrow frustum would push every
 * station clean off the screen.
 */
const SIDE_MAX = 3.6;
const SIDE_MIN = 1.2;

const sideFor = (width: number, height: number) => {
  const aspect = width / Math.max(1, height);
  return Math.max(
    SIDE_MIN,
    Math.min(SIDE_MAX, SIDE_MAX * Math.min(1, aspect / 1.5)),
  );
};

/** The last station, just beyond where the camera stops. */
const GATE_DEPTH = CAMERA_END - 13;

const FALLBACK_DEPTHS: Depths = [-13, -20, -29];

const depthFor = (progress: number) =>
  CAMERA_NEAR - progress * CAMERA_TRAVEL - LEAD;

/**
 * Measures the landing page so each station lines up with the transparent
 * section it belongs to: Kirish → Placement → Darslar → Natijalar →
 * Universitetlar. Sections painted with `bg-surface` are opaque dividers, so
 * they are skipped — a station never hides behind a solid band.
 */
function useJourneyLayout(enabled: boolean) {
  const [layout, setLayout] = useState<{ depths: Depths; side: number }>({
    depths: FALLBACK_DEPTHS,
    side: SIDE_MAX,
  });

  useEffect(() => {
    if (!enabled) return;

    const measure = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const windows = Array.from(
        document.querySelectorAll<HTMLElement>("main > section"),
      ).filter(
        (section) => getComputedStyle(section).backgroundColor === "rgba(0, 0, 0, 0)",
      );
      // The first transparent section is the hero — the journey starts there,
      // so the next three carry the stations.
      const [cards, books, results] = windows.slice(1, 4);

      const depthForSection = (section?: HTMLElement, fallback = 0) => {
        if (!section) return fallback;
        const rect = section.getBoundingClientRect();
        const centre =
          rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2;
        return depthFor(Math.min(1, Math.max(0, centre / max)));
      };

      setLayout({
        depths: [
          depthForSection(cards, FALLBACK_DEPTHS[0]),
          depthForSection(books, FALLBACK_DEPTHS[1]),
          depthForSection(results, FALLBACK_DEPTHS[2]),
        ],
        side: sideFor(window.innerWidth, window.innerHeight),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled]);

  return layout;
}

/** The Matrix fall lining the whole corridor. */
function CorridorMotes({ count }: { count: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i + 1) * 0.618033988749895;
      arr[i * 3] = (frac(t) - 0.5) * 14;
      arr[i * 3 + 1] = (frac(t * 1.7) - 0.5) * 7;
      arr[i * 3 + 2] = 2 - frac(t * 2.9) * 46;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#47bfff" size={0.05} transparent opacity={0.22} />
    </points>
  );
}

/** "Placement test": a raft of question cards waiting to be answered. */
function CardStation({
  depth,
  side,
  rich,
}: {
  depth: number;
  side: number;
  rich: boolean;
}) {
  const cards = useMemo(
    () =>
      Array.from({ length: rich ? 7 : 4 }, (_, i) => {
        const t = (i + 1) * 0.618033988749895;
        return {
          x: side - 1.4 + frac(t) * 2.8,
          y: (frac(t * 1.3) - 0.5) * 3,
          rot: (frac(t * 2.1) - 0.5) * 0.9,
        };
      }),
    [rich, side],
  );

  return (
    <group position={[0, 0, depth]}>
      {cards.map((card, i) => (
        <mesh
          key={i}
          position={[card.x, card.y, (i % 3) * 0.5]}
          rotation={[0, 0, card.rot]}
        >
          <boxGeometry args={[1, 0.64, 0.05]} />
          <meshStandardMaterial
            color="#7e14ff"
            roughness={0.5}
            metalness={0.1}
            emissive="#7e14ff"
            emissiveIntensity={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

/** "Darslar": books climbing one after another. */
function BookStation({
  depth,
  side,
  rich,
}: {
  depth: number;
  side: number;
  rich: boolean;
}) {
  const books = useMemo(
    () =>
      Array.from({ length: rich ? 7 : 4 }, (_, i) => ({
        x: side - 1.2 + i * 0.55,
        y: -1.4 + i * 0.46,
        spin: 0.3 + frac(i * 0.618033988749895) * 1.4,
        color: i % 2 === 0 ? "#ffd166" : "#c8a2ff",
      })),
    [rich, side],
  );

  return (
    <group position={[0, 0, depth]}>
      {books.map((book, i) => (
        <mesh
          key={i}
          position={[book.x, book.y, 0]}
          rotation={[0, book.spin, 0.14]}
        >
          <boxGeometry args={[0.44, 0.6, 0.08]} />
          <meshStandardMaterial
            color={book.color}
            roughness={0.45}
            metalness={0.12}
            emissive={book.color}
            emissiveIntensity={0.14}
          />
        </mesh>
      ))}
    </group>
  );
}

/** "Natijalar": a bar chart rising out of the floor. */
function ResultStation({
  depth,
  side,
  rich,
}: {
  depth: number;
  side: number;
  rich: boolean;
}) {
  const bars = useMemo(
    () =>
      Array.from({ length: rich ? 9 : 5 }, (_, i) => ({
        x: side - 1.6 + i * 0.5,
        h: 0.4 + frac((i + 1) * 0.618033988749895) * 1.5,
      })),
    [rich, side],
  );

  return (
    <group position={[0, -2.4, depth]}>
      {bars.map((bar, i) => (
        <mesh key={i} position={[bar.x, bar.h / 2, 0]}>
          <boxGeometry args={[0.26, bar.h, 0.26]} />
          <meshStandardMaterial
            color="#3ddc84"
            roughness={0.4}
            emissive="#3ddc84"
            emissiveIntensity={0.26}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * "Universitetlar": the gate waiting straight ahead, past where the camera
 * stops. It only fades in on the last stretch of the page, so a distant arch
 * never drifts behind the copy in the middle of the journey — the destination
 * appears exactly as the reader arrives at it.
 */
function GateStation({ progress }: { progress: ProgressRef }) {
  const group = useRef<Group>(null);

  useFrame(() => {
    const gate = group.current;
    if (!gate) return;
    const reveal = Math.min(1, Math.max(0, (progress.current - 0.72) / 0.2));

    gate.visible = reveal > 0.02;
    gate.traverse((child) => {
      const material = (child as Mesh).material as
        | MeshStandardMaterial
        | undefined;
      if (!material || !("opacity" in material)) return;
      material.transparent = reveal < 1;
      material.opacity = reveal;
    });
  });

  return (
    <group ref={group} position={[0, 0, GATE_DEPTH]} visible={false}>
      <mesh position={[-1.7, 2.6, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 5.2, 14]} />
        <meshStandardMaterial color="#c8a2ff" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[1.7, 2.6, 0]}>
        <cylinderGeometry args={[0.26, 0.32, 5.2, 14]} />
        <meshStandardMaterial color="#c8a2ff" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 5.45, 0]}>
        <boxGeometry args={[4.4, 0.5, 0.7]} />
        <meshStandardMaterial
          color="#ffd166"
          roughness={0.35}
          metalness={0.35}
          emissive="#ffd166"
          emissiveIntensity={0.32}
        />
      </mesh>
    </group>
  );
}

/** Walks the camera down the corridor, following the page's scroll position. */
function ScrollCamera({ progress }: { progress: ProgressRef }) {
  useFrame((state, delta) => {
    const p = progress.current;
    const targetZ = CAMERA_NEAR - p * CAMERA_TRAVEL;
    const targetY = 0.3 + Math.sin(p * Math.PI * 2) * 0.6;
    const targetX = Math.sin(p * Math.PI * 3) * 0.7;
    const camera = state.camera;
    const k = 1 - Math.pow(0.002, Math.min(delta, 0.05));

    camera.position.x += (targetX - camera.position.x) * k;
    camera.position.y += (targetY - camera.position.y) * k;
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.lookAt(
      state.pointer.x * 1.1,
      0.1 + state.pointer.y * 0.5,
      camera.position.z - 10,
    );
  });

  return null;
}

export default function LandingJourneyScene() {
  const ready = use3DReady();
  const quality = useDeviceQuality();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);
  const progress = useRef(0);
  const { depths, side } = useJourneyLayout(ready);

  useEffect(() => {
    if (!ready) return;

    const read = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      progress.current = Math.min(1, Math.max(0, window.scrollY / max));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [ready]);

  if (!ready) return null;

  const rich = quality !== "low";

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        camera={{ position: [0, 0.3, CAMERA_NEAR], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 3]} intensity={0.85} color="#c8b6ff" />
        <pointLight position={[-4, 1, -12]} intensity={0.6} color="#7e14ff" />
        <pointLight position={[3, -1, -30]} intensity={0.6} color="#3ddc84" />
        <Suspense fallback={null}>
          <CorridorMotes count={rich ? 60 : 26} />
          <CardStation depth={depths[0]} side={side} rich={rich} />
          <BookStation depth={depths[1]} side={side} rich={rich} />
          <ResultStation depth={depths[2]} side={side} rich={rich} />
          <GateStation progress={progress} />
        </Suspense>
        {quality === "high" ? (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.18} luminanceThreshold={0.82} />
          </EffectComposer>
        ) : null}
        <ScrollCamera progress={progress} />
      </Canvas>
    </div>
  );
}
