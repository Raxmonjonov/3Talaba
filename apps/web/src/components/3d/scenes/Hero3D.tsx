import { Suspense, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import type { Mesh } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { featureFlags } from "@/lib/featureFlags";
import {
  useDeviceQuality,
  useReducedMotion,
  useWebGL,
} from "../hooks/usePerfFlags";

/** Fractional part — a deterministic stand-in for Math.random during render. */
const frac = (n: number) => n - Math.floor(n);

type Vec2 = { x: number; y: number };

/**
 * Eases the camera toward the pointer so the stage feels like it is looking
 * back at you. Runs entirely inside the frame loop: no re-renders, no effects.
 */
function PointerRig({ pointer }: { pointer: RefObject<Vec2> }) {
  const eased = useRef<Vec2>({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = Math.min(dt * 3, 1);
    eased.current.x += (pointer.current.x * 0.4 - eased.current.x) * k;
    eased.current.y += (-pointer.current.y * 0.28 - eased.current.y) * k;
    state.camera.position.x = eased.current.x;
    state.camera.position.y = eased.current.y;
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/** A slowly turning wireframe globe: the "target university" of the journey. */
function Globe() {
  const ref = useRef<Mesh>(null);
  useFrame((_state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.18;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.72, 1]} />
      <meshBasicMaterial color="#47bfff" wireframe transparent opacity={0.32} />
    </mesh>
  );
}

/** Three books drifting around the globe at deterministic spots. */
function FloatingBooks() {
  const books = useMemo(
    () =>
      [
        { position: [-1.5, 0.75, -0.4], rotation: 0.5, color: "#7e14ff" },
        { position: [1.6, -0.55, -0.6], rotation: -0.4, color: "#c8a2ff" },
        { position: [-1.1, -0.9, 0.3], rotation: 0.9, color: "#47bfff" },
      ] as const,
    [],
  );

  return (
    <group>
      {books.map((book) => (
        <Float
          key={book.color}
          speed={0.7 + Math.abs(book.rotation)}
          rotationIntensity={0.08}
          floatIntensity={0.18}
        >
          <mesh position={book.position as [number, number, number]} rotation={[0, book.rotation, 0.12]}>
            <boxGeometry args={[0.44, 0.6, 0.08]} />
            <meshStandardMaterial color={book.color} roughness={0.45} metalness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** The soft Matrix fall: a deterministic sprinkle of cyan motes. */
function MatrixMotes() {
  const count = 14;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i + 1) * 0.618033988749895;
      arr[i * 3] = (frac(t) - 0.5) * 6.4;
      arr[i * 3 + 1] = (frac(t * 1.7) - 0.5) * 4.2;
      arr[i * 3 + 2] = (frac(t * 2.3) - 0.5) * 2;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#47bfff" size={0.035} transparent opacity={0.3} />
    </points>
  );
}

function Effects() {
  const quality = useDeviceQuality();
  if (quality === "medium") return null;
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.16} luminanceThreshold={0.85} />
    </EffectComposer>
  );
}

export default function Hero3D() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const quality = useDeviceQuality();
  const pointer = useRef<Vec2>({ x: 0, y: 0 });

  const enabled =
    featureFlags.enable3D && webgl && !reduced && quality !== "low";

  useEffect(() => {
    if (!enabled || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        shadows={false}
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={0.9} color="#c8b6ff" />
        <pointLight position={[-3, -1, 2]} intensity={0.5} color="#47bfff" />
        <Suspense fallback={null}>
          <Globe />
          <FloatingBooks />
          <MatrixMotes />
        </Suspense>
        <Effects />
        <PointerRig pointer={pointer} />
      </Canvas>
    </div>
  );
}
