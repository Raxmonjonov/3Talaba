import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Mesh } from "three";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";
import { usePointer } from "../hooks/usePointer";
import { PointerRig } from "../elements/PointerRig";

/** Fractional part — a deterministic stand-in for Math.random during render. */
const frac = (n: number) => n - Math.floor(n);

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

/** Books drifting around the globe at deterministic spots. */
function FloatingBooks({ rich }: { rich: boolean }) {
  const books = useMemo(
    () =>
      [
        { position: [-1.5, 0.75, -0.4], spin: 0.5, color: "#7e14ff" },
        { position: [1.6, -0.55, -0.6], spin: -0.4, color: "#c8a2ff" },
        { position: [-1.1, -0.9, 0.3], spin: 0.9, color: "#47bfff" },
      ] as const,
    [],
  );

  return (
    <group>
      {(rich ? books : books.slice(0, 2)).map((book) => (
        <Float
          key={book.color}
          speed={0.7 + Math.abs(book.spin)}
          rotationIntensity={0.08}
          floatIntensity={0.18}
        >
          <mesh
            position={book.position as [number, number, number]}
            rotation={[0, book.spin, 0.12]}
          >
            <boxGeometry args={[0.44, 0.6, 0.08]} />
            <meshStandardMaterial color={book.color} roughness={0.45} metalness={0.1} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/** The soft Matrix fall: a deterministic sprinkle of cyan motes. */
function MatrixMotes({ count }: { count: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i + 1) * 0.618033988749895;
      arr[i * 3] = (frac(t) - 0.5) * 6.4;
      arr[i * 3 + 1] = (frac(t * 1.7) - 0.5) * 4.2;
      arr[i * 3 + 2] = (frac(t * 2.3) - 0.5) * 2;
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#47bfff" size={0.035} transparent opacity={0.3} />
    </points>
  );
}

export default function Hero3D() {
  const ready = use3DReady();
  const quality = useDeviceQuality();
  const pointer = usePointer();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);

  if (!ready) return null;

  const rich = quality !== "low";

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        shadows={false}
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 4]} intensity={0.9} color="#c8b6ff" />
        <pointLight position={[-3, -1, 2]} intensity={0.5} color="#47bfff" />
        <Suspense fallback={null}>
          <Globe />
          <FloatingBooks rich={rich} />
          <MatrixMotes count={rich ? 16 : 7} />
        </Suspense>
        {rich && quality === "high" ? (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.16} luminanceThreshold={0.85} />
          </EffectComposer>
        ) : null}
        <PointerRig pointer={pointer} reach={0.4} />
      </Canvas>
    </div>
  );
}
