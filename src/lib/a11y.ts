"use client";

import { useEffect } from "react";
import { useUiStore, type GpuTier } from "@/stores/uiStore";

function detectGpuTier(): GpuTier {
  let gl: WebGLRenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "off";
  } catch {
    return "off";
  }

  /* Software renderers (SwiftShader / llvmpipe / Mesa offscreen / Microsoft
     Basic) report WebGL as available but run on the CPU — common in
     containers, VMs and WSL without GPU passthrough. They'd otherwise pass as
     "full" and get the 42k-point shader + full bloom and crawl. Tier them down
     to the reduced "mobile" path (fewer points, no postprocessing). */
  try {
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = dbg
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
      : "";
    if (/swiftshader|llvmpipe|softpipe|software|mesa offscreen|microsoft basic/i.test(renderer))
      return "mobile";
  } catch {
    /* extension blocked (privacy) — fall through to heuristics */
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
