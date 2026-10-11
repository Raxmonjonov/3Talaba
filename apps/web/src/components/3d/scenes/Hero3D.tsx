import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AdditiveBlending } from "three";
import type { BufferAttribute, Mesh, Points } from "three";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";
import { usePointer } from "../hooks/usePointer";
import { PointerRig } from "../elements/PointerRig";
import { SubjectPlates } from "../elements/SubjectPlates";
import { MatrixRain } from "../elements/MatrixRain";
import { radialGlow, ringGlow } from "../lib/glyphs";

/** Fractional part — a deterministic stand-in for Math.random during render. */
const frac = (n: number) => n - Math.floor(n);

/**
 * The hero stage, held to the right of the headline column. Everything here is
 * procedural: a wireframe globe with a warm halo and two orbit rings, three
 * drifting books, the exam plates and a thin veil of rising motes. No model
 * files, no network — the whole scene is a few kilobytes of geometry.
 */

/** A slowly turning wireframe globe: the "target university" of the journey. */
function Globe() {
  const shell = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    const step = Math.min(delta, 0.05);
    if (shell.current) shell.current.rotation.y += step * 0.16;
    // The outer ring drifts against the globe so the pair never reads static.
    if (ring.current) ring.current.rotation.z -= step * 0.05;
  });

  const halo = useMemo(() => radialGlow(2.6), []);
  const orbit = useMemo(() => ringGlow(), []);

  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial
          color="#47bfff"
          wireframe
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* A faint core so the wireframe reads as a solid object, not a net. */}
      <mesh>
        <sphereGeometry args={[0.68, 24, 18]} />
        <meshBasicMaterial
          color="#1b1636"
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>

      {/* Warm halo behind the globe; additive, so it glows without a light. */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial
          map={halo}
          color="#7e14ff"
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Two orbit rings at different tilts: the classroom's quiet clockwork. */}
      <mesh ref={ring} rotation={[Math.PI / 2.35, 0.2, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial
          map={orbit}
          color="#47bfff"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 1.75, -0.35, 0.4]}>
        <planeGeometry args={[2.1, 2.1]} />
        <meshBasicMaterial
          map={orbit}
          color="#ffd166"
          transparent
          opacity={0.34}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** A book: a coloured cover with a lighter page block showing at the edge. */
function Book({
  position,
  spin,
  color,
}: {
  position: readonly [number, number, number];
  spin: number;
  color: string;
}) {
  return (
    <group position={position as [number, number, number]} rotation={[0, spin, 0.12]}>
      <mesh>
        <boxGeometry args={[0.44, 0.6, 0.07]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0.12}
          emissive={color}
          emissiveIntensity={0.16}
        />
      </mesh>
      <mesh position={[0.015, 0, 0]}>
        <boxGeometry args={[0.4, 0.56, 0.045]} />
        <meshStandardMaterial color="#f6f1ff" roughness={0.9} metalness={0} />
      </mesh>
      {/* Spine: a slim gold band, the only warm accent on the cover. */}
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.03, 0.6, 0.075]} />
        <meshStandardMaterial
          color="#ffd166"
          roughness={0.4}
          metalness={0.35}
          emissive="#ffd166"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

/** Books drifting around the globe at deterministic spots. */
function FloatingBooks({ rich }: { rich: boolean }) {
  const books = useMemo(
    () =>
      [
        { position: [-0.75, 1.55, -0.4] as const, spin: 0.5, color: "#7e14ff" },
        { position: [0.62, -1.45, -0.6] as const, spin: -0.4, color: "#c8a2ff" },
        { position: [-0.1, -1.8, 0.3] as const, spin: 0.9, color: "#47bfff" },
      ] as const,
    [],
  );

  return (
    <group>
      {(rich ? books : books.slice(0, 2)).map((book) => (
        <Float
          key={book.color}
          speed={0.6 + Math.abs(book.spin) * 0.6}
          rotationIntensity={0.06}
          floatIntensity={0.16}
          floatingRange={[-0.06, 0.06]}
        >
          <Book position={book.position} spin={book.spin} color={book.color} />
        </Float>
      ))}
    </group>
  );
}

/**
 * A thin veil of motes drifting upward, each drawn as a soft radial dot so it
 * reads as dust in the light rather than a pixel. Replaces the old glyph rain:
 * quieter, cheaper, and it never crosses the headline.
 */
function Motes({ count }: { count: number }) {
  const points = useRef<Points>(null);
  const glow = useMemo(() => radialGlow(3.2), []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = (i + 1) * 0.618033988749895;
      // Kept to the right of centre so the copy column stays clear.
      arr[i * 3] = 0.4 + (frac(t) - 0.5) * 6;
      arr[i * 3 + 1] = (frac(t * 1.7) - 0.5) * 4.4;
      arr[i * 3 + 2] = -0.4 - frac(t * 2.3) * 2.6;
      speeds[i] = 0.05 + frac(t * 3.7) * 0.1;
    }
    return { arr, speeds };
  }, [count]);

  useFrame((_state, delta) => {
    const attribute = points.current?.geometry.getAttribute(
      "position",
    ) as BufferAttribute | undefined;
    if (!attribute) return;
    const step = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      let y = attribute.getY(i) + step * positions.speeds[i];
      // Wrap back to the bottom instead of growing the buffer.
      if (y > 2.4) y = -2.4;
      attribute.setY(i, y);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.arr, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glow}
        color="#8fe8ff"
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
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
          {/* Held to the right of the hero so it never sits behind the
              headline column, which owns the left two thirds. */}
          <group position={[1.75, 0, 0]}>
            <Globe />
            <FloatingBooks rich={rich} />
            <SubjectPlates />
          </group>
          {/* Rain pushed behind the globe so the headline column stays clean. */}
          <MatrixRain
            count={rich ? 28 : 10}
            area={4.5}
            offsetX={1.4}
            depth={5}
            opacity={0.35}
          />
          <Motes count={rich ? 34 : 14} />
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
