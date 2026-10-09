import { Suspense, useRef } from "react";
import type { Mesh } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { use3DReady, useDeviceQuality } from "../hooks/usePerfFlags";
import { useActiveView } from "../hooks/useActiveView";

/** The tutor's face: a lit core inside a slowly turning wire shell. */
function Orb({ thinking }: { thinking: boolean }) {
  const shell = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (shell.current) shell.current.rotation.y += delta * 0.5;
    if (shell.current) shell.current.rotation.x += delta * 0.22;
    if (core.current) {
      const pulse = thinking ? 1 + Math.sin(t * 6) * 0.12 : 1 + Math.sin(t * 1.6) * 0.04;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={core}>
        <sphereGeometry args={[0.62, 24, 18]} />
        <meshStandardMaterial
          color="#47bfff"
          emissive="#7e14ff"
          emissiveIntensity={0.8}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.92, 1]} />
        <meshBasicMaterial color="#c8a2ff" wireframe transparent opacity={0.4} />
      </mesh>
      <pointLight position={[0, 0, 1.2]} intensity={0.8} color="#47bfff" />
    </group>
  );
}

function TutorOrbScene({ thinking }: { thinking: boolean }) {
  const ready = use3DReady();
  const quality = useDeviceQuality();
  const host = useRef<HTMLDivElement>(null);
  const active = useActiveView(host, ready);

  if (!ready) return null;

  return (
    <div ref={host} className="h-9 w-9 shrink-0" aria-hidden="true">
      <Canvas
        dpr={[1, quality === "high" ? 1.5 : 1]}
        camera={{ position: [0, 0, 2.6], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={active ? "always" : "never"}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 3]} intensity={0.7} color="#c8b6ff" />
        <Suspense fallback={null}>
          <Orb thinking={thinking} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default TutorOrbScene;
