"use client";

import { useEffect } from "react";
import { useUiStore, type GpuTier } from "@/stores/uiStore";

function detectGpuTier(): GpuTier {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return "off";
  } catch {
    return "off";
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const smallScreen = window.matchMedia("(max-width: 768px)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  if ((coarse && smallScreen) || lowMem) return "mobile";
  return "full";
}

/**
 * Mounts once in the layout shell: resolves WebGL capability tier and
 * tracks prefers-reduced-motion live. Reduced motion forces tier "off"
 * (scenes render static DOM fallbacks).
 */
export function useCapabilities() {
  const setGpuTier = useUiStore((s) => s.setGpuTier);
  const setReducedMotion = useUiStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReducedMotion(mq.matches);
      setGpuTier(mq.matches ? "off" : detectGpuTier());
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setGpuTier, setReducedMotion]);
}
