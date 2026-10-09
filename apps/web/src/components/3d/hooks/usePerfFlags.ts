import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function useWebGL() {
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

export function useDeviceQuality() {
  const [quality, setQuality] = useState<"low" | "medium" | "high">("high");
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    const cores = navigator.hardwareConcurrency ?? 2;
    const dpr = window.devicePixelRatio ?? 1;
    if (isMobile || cores <= 2 || dpr > 2.5) {
      setQuality("low");
    } else if (cores <= 4) {
      setQuality("medium");
    } else {
      setQuality("high");
    }
  }, []);
  return quality;
}


