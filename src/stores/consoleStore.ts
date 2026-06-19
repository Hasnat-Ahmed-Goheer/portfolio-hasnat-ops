"use client";

import { create } from "zustand";
import { setSoundEnabled as syncSoundEngine, confirm as soundConfirm } from "@/lib/sound";

/**
 * Console-UI cross-cutting state that isn't DOM→3D (sceneStore) or capability
 * (uiStore): the ⌘K command palette open state, the skills→projects filter
 * that links /about to /work, and the (off-by-default, persisted) sound toggle.
 */
interface ConsoleState {
  /** ⌘K command palette open? */
  paletteOpen: boolean;
  /** skills cluster id locked from /about to filter /work ("" = none) */
  skillFilter: string;
  /** guided tour (`demo`/`tour`) currently playing? */
  tourActive: boolean;
  /** index of the current tour beat (see lib/tour.ts) */
  tourBeat: number;
  /** ambient UI sound on? default FALSE for everyone; persisted to localStorage */
  soundEnabled: boolean;
  setPaletteOpen: (v: boolean) => void;
  togglePalette: () => void;
  setSkillFilter: (id: string) => void;
  setTourActive: (v: boolean) => void;
  setTourBeat: (i: number) => void;
  setSoundEnabled: (v: boolean) => void;
  toggleSound: () => void;
}

const SOUND_KEY = "ops-sound";

/** SSR-safe read of the persisted preference; never throws (private mode, etc.) */
function readSoundPref(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
}

function persistSoundPref(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SOUND_KEY, v ? "1" : "0");
  } catch {
    /* storage unavailable — preference simply won't persist */
  }
}

/** apply a sound preference: store + engine + localStorage, in one place */
function applySound(set: (p: Partial<ConsoleState>) => void, v: boolean) {
  syncSoundEngine(v);
  persistSoundPref(v);
  set({ soundEnabled: v });
  /* turning ON: a single confirm tone so the unmute is audible. This runs
     synchronously inside the toggle's click/keydown handler, so it's a valid
     user gesture for the AudioContext unlock. */
  if (v) soundConfirm();
}

export const useConsoleStore = create<ConsoleState>((set, get) => ({
  paletteOpen: false,
  skillFilter: "",
  tourActive: false,
  tourBeat: 0,
  /* default off on the server AND first client render to avoid hydration
     mismatch; the real preference is rehydrated post-mount via rehydrateSound() */
  soundEnabled: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
  setSkillFilter: (skillFilter) => set({ skillFilter }),
  setTourActive: (tourActive) => set({ tourActive }),
  setTourBeat: (tourBeat) => set({ tourBeat }),
  setSoundEnabled: (v) => applySound(set, v),
  toggleSound: () => applySound(set, !get().soundEnabled),
}));

/** Rehydrate the persisted sound preference after mount (client-only). Safe to
    call repeatedly; never creates an AudioContext (that waits for a gesture). */
export function rehydrateSound() {
  const v = readSoundPref();
  if (v !== useConsoleStore.getState().soundEnabled) {
    syncSoundEngine(v);
    useConsoleStore.setState({ soundEnabled: v });
  } else {
    /* keep the engine's enabled mirror in sync even when value matches default */
    syncSoundEngine(v);
  }
}
