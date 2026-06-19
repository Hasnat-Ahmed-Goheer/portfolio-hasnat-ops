"use client";

import { create } from "zustand";
import { DEFAULT_THEME, themes, type ThemeName } from "@/config/theme";

export type GpuTier = "full" | "mobile" | "off";

interface UiState {
  theme: ThemeName;
  /** WebGL capability tier — "off" renders DOM-only fallbacks */
  gpuTier: GpuTier;
  reducedMotion: boolean;
  booted: boolean;
  /** true once the WebGL scene has actually rendered its first frames —
      gates the canvas fade-in and lets BootSequence reveal a warm scene */
  sceneReady: boolean;
  /** a touch long-press is dragging a cluster node — LayoutShell pauses Lenis
      smooth-scroll while true so the drag doesn't fight the page scroll */
  dragLock: boolean;
  /** true while the route curtain is covering the viewport during a client
      navigation. Entrance animations (DecodeText, reveals) gate on this so they
      play AFTER the curtain lifts instead of finishing unseen behind it. */
  routeTransitioning: boolean;
  setTheme: (t: string) => boolean;
  setGpuTier: (t: GpuTier) => void;
  setReducedMotion: (v: boolean) => void;
  setBooted: (v: boolean) => void;
  setSceneReady: (v: boolean) => void;
  setDragLock: (v: boolean) => void;
  setRouteTransitioning: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: DEFAULT_THEME,
  gpuTier: "full",
  reducedMotion: false,
  booted: false,
  sceneReady: false,
  dragLock: false,
  routeTransitioning: false,
  setTheme: (t) => {
    if (!(t in themes)) return false;
    const name = t as ThemeName;
    document.documentElement.dataset.theme = name;
    set({ theme: name });
    return true;
  },
  setGpuTier: (gpuTier) => set({ gpuTier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setBooted: (booted) => set({ booted }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setDragLock: (dragLock) => set({ dragLock }),
  setRouteTransitioning: (routeTransitioning) => set({ routeTransitioning }),
}));
