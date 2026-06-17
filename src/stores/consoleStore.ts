"use client";

import { create } from "zustand";

/**
 * Console-UI cross-cutting state that isn't DOM→3D (sceneStore) or capability
 * (uiStore): the ⌘K command palette, the ambient-sound toggle, and the
 * skills→projects filter that links /about to /work.
 */
interface ConsoleState {
  /** ⌘K command palette open? */
  paletteOpen: boolean;
  /** ambient sound feedback (off by default; persisted) */
  soundEnabled: boolean;
  /** skills cluster id locked from /about to filter /work ("" = none) */
  skillFilter: string;
  setPaletteOpen: (v: boolean) => void;
  togglePalette: () => void;
  setSoundEnabled: (v: boolean) => void;
  setSkillFilter: (id: string) => void;
}

const SOUND_KEY = "hasnat.ops:sound";

export const useConsoleStore = create<ConsoleState>((set) => ({
  paletteOpen: false,
  soundEnabled: false,
  skillFilter: "",
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
  setSoundEnabled: (soundEnabled) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SOUND_KEY, soundEnabled ? "1" : "0");
      } catch {
        /* private-mode / quota — sound just won't persist */
      }
    }
    set({ soundEnabled });
  },
  setSkillFilter: (skillFilter) => set({ skillFilter }),
}));

/** read the persisted sound preference (call once on the client, post-mount) */
export function readStoredSound(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}
