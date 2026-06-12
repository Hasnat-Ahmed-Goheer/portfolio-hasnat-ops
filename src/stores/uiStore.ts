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
  setTheme: (t: string) => boolean;
  setGpuTier: (t: GpuTier) => void;
  setReducedMotion: (v: boolean) => void;
  setBooted: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: DEFAULT_THEME,
  gpuTier: "full",
  reducedMotion: false,
  booted: false,
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
}));
