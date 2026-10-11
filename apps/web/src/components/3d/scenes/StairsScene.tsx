import { Suspense, useMemo, useRef } from "react";
import type { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";
import { usePointer } from "../hooks/usePointer";
import { PointerRig } from "../elements/PointerRig";

const TOTAL_STEPS = 10;
const STEP_WIDTH = 0.44;
const STEP_DEPTH = 0.9;

/** One tread of the staircase: lit green behind you, gold where you stand. */
function Step({ index, level }: { index: number; level: number }) {
  const reached = index < level;
  const current = index === level;
  const color = current ? "#ffd166" : reached ? "#3ddc84" : "#26304f";

  return (
    <mesh position={[(index - TOTAL_STEPS / 2) * STEP_WIDTH, index * 0.14, 0]}>
      <boxGeometry args={[STEP_WIDTH * 0.86, 0.16, STEP_DEPTH]} />
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={reached ? 0.35 : 0.08}
      />
    </mesh>
  );
}

/** The dream university waiting on the top tread: a portal ring + graduation cap. */
function DreamMarker({ active }: { active: boolean }) {
  const group = useRef<Group>(null);
  const portal = useRef<Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current && active) {
      group.current.position.y =
        TOTAL_STEPS * 0.14 + 0.48 + Math.sin(t * 1.4) * 0.06;
      group.current.rotation.y += delta * 0.25;
    }
    if (portal.current && active) {
      portal.current.rotation.z = t * 0.35;
      portal.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.04);
    }
  });

  return (
    <group position={[(TOTAL_STEPS / 2) * STEP_WIDTH, TOTAL_STEPS * 0.14 + 0.35, -0.15]}>
      {/* Soft portal ring the student is walking toward. */}
      <group ref={portal}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 12, 48]} />
          <meshStandardMaterial
            color="#7de2ff"
            emissive="#47bfff"
            emissiveIntensity={0.9}
            roughness={0.35}
            metalness={0.4}
          />
        </mesh>
      </group>
      <group ref={group} position={[0, 0.15, 0]}>
        <mesh>
          <cylinderGeometry args={[0.13, 0.17, 0.17, 16]} />
          <meshStandardMaterial color="#ffd166" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[0, 0.18, 0.06]}>
          <boxGeometry args={[0.52, 0.03, 0.52]} />
          <meshStandardMaterial
            color="#ffe9a8"
            roughness={0.35}
            metalness={0.35}
            emissive="#ffd166"
            emissiveIntensity={0.45}
          />
        </mesh>
      </group>
    </group>
  );
}

function StairsScene({ level }: { level: number }) {
  const ready = use3DReady();
  const quality = useDeviceQuality();
  const pointer = usePointer();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);
  const steps = useMemo(
    () => Array.from({ length: TOTAL_STEPS + 1 }, (_, i) => i),
    [],
  );

  if (!ready) return null;

  return (
    <div ref={host} className="h-56 w-full sm:h-64" aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        camera={{ position: [0, 1.5, 4.4], fov: 42 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1} color="#c8b6ff" />
        <pointLight position={[-3, 1, 2]} intensity={0.45} color="#47bfff" />
        <Suspense fallback={null}>
          <group position={[0, -0.7, 0]}>
            {steps.map((index) => (
              <Step key={index} index={index} level={level} />
            ))}
            <DreamMarker active={active} />
          </group>
        </Suspense>
        {quality === "high" ? (
          <EffectComposer>
            <Bloom mipmapBlur intensity={0.2} luminanceThreshold={0.8} />
          </EffectComposer>
        ) : null}
        <PointerRig pointer={pointer} reach={0.35} lookAt={[0, 0.2, 0]} />
      </Canvas>
    </div>
  );
}

export default StairsScene;
