"use client";

import { create } from "zustand";
import { HOME } from "@/lib/fakeFs";

export type LineKind = "in" | "out" | "ok" | "err" | "dim";
export interface TermLine {
  id: number;
  text: string;
  kind: LineKind;
}

interface TerminalState {
  open: boolean;
  lines: TermLine[];
  history: string[];
  hIdx: number; // -1 = not navigating
  cwd: string[];
  unlocked: string[]; // discovered easter eggs
  setOpen: (v: boolean) => void;
  push: (text: string, kind?: LineKind) => void;
  clear: () => void;
  setCwd: (cwd: string[]) => void;
  addHistory: (cmd: string) => void;
  navHistory: (dir: 1 | -1, current: string) => string;
  unlock: (egg: string) => void;
}

let lineId = 0;
const MAX_LINES = 400; // virtualization guard

export const useTerminalStore = create<TerminalState>((set, get) => ({
  open: false,
  lines: [],
  history: [],
  hIdx: -1,
  cwd: [...HOME],
  unlocked: [],
  setOpen: (open) => set({ open }),
  push: (text, kind = "out") =>
    set((s) => ({
      lines: [...s.lines, { id: lineId++, text, kind }].slice(-MAX_LINES),
    })),
  clear: () => set({ lines: [] }),
  setCwd: (cwd) => set({ cwd }),
  addHistory: (cmd) =>
    set((s) => ({
      history: cmd.trim() ? [...s.history, cmd] : s.history,
      hIdx: -1,
    })),
  navHistory: (dir, current) => {
    const { history, hIdx } = get();
    if (!history.length) return current;
    let next = hIdx === -1 ? history.length : hIdx;
    next += dir;
    if (next < 0) next = 0;
    if (next >= history.length) {
      set({ hIdx: -1 });
      return "";
    }
    set({ hIdx: next });
    return history[next];
  },
  unlock: (egg) =>
    set((s) =>
      s.unlocked.includes(egg) ? s : { unlocked: [...s.unlocked, egg] }
    ),
}));
