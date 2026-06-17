"use client";

import { create } from "zustand";

/**
 * Console-UI cross-cutting state that isn't DOM→3D (sceneStore) or capability
 * (uiStore): the ⌘K command palette open state, and the skills→projects filter
 * that links /about to /work.
 */
interface ConsoleState {
  /** ⌘K command palette open? */
  paletteOpen: boolean;
  /** skills cluster id locked from /about to filter /work ("" = none) */
  skillFilter: string;
  setPaletteOpen: (v: boolean) => void;
  togglePalette: () => void;
  setSkillFilter: (id: string) => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  paletteOpen: false,
  skillFilter: "",
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
  setSkillFilter: (skillFilter) => set({ skillFilter }),
}));
