import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { featureFlags } from "@/lib/featureFlags";
import { useDeviceQuality, useReducedMotion, useWebGL } from "../hooks/usePerfFlags";

function FloatingBook() {
  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.15}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 0.1]} />
        <meshStandardMaterial color="#7e14ff" roughness={0.4} metalness={0.1} />
      </mesh>
    </Float>
  );
}

function MatrixSpheres() {
  const count = 12;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#47bfff" size={0.03} transparent opacity={0.25} />
    </points>
  );
}

function Effects() {
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.15} luminanceThreshold={0.85} />
    </EffectComposer>
  );
}

export default function Hero3D() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const quality = useDeviceQuality();

  if (!featureFlags.enable3D || !webgl || reduced || quality === "low") {
    return null;
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1]}
        shadows={false}
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop="demand"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 2, 2]} intensity={0.4} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <FloatingBook />
          <MatrixSpheres />
        </Suspense>
        <Effects />
      </Canvas>
    </div>
  );
}

