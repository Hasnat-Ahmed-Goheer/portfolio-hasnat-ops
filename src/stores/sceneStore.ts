"use client";

import { create } from "zustand";
import type { MotifKey } from "@/content/types";

/**
 * Shared state between DOM (ScrollTrigger timelines, terminal commands)
 * and the WebGL layer. Scenes read this in useFrame and lerp toward it —
 * never the other way around.
 */
interface SceneState {
  /** scroll progress of the active page's pinned set piece, 0..1 */
  progress: number;
  /** deployment motif for /work/[slug] */
  motif: MotifKey;
  motifAccent: string;
  /** monotonically increasing pulse counter — eggs/commands disturb scenes */
  disturb: number;
  /** about page: id of hovered/focused skill group ("" = none) */
  activeSkillGroup: string;
  /** work index: hovered project row (-1 = none) */
  activeProject: number;
  /** cursor tooltip for hovered 3D objects ("" = hidden) */
  hoverLabel: string;
  setProgress: (p: number) => void;
  setHoverLabel: (l: string) => void;
  setMotif: (m: MotifKey, accent: string) => void;
  bumpDisturb: () => void;
  setActiveSkillGroup: (id: string) => void;
  setActiveProject: (i: number) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  motif: "orbit",
  motifAccent: "#22d3ee",
  disturb: 0,
  activeSkillGroup: "",
  activeProject: -1,
  hoverLabel: "",
  setProgress: (progress) => set({ progress }),
  setHoverLabel: (hoverLabel) => set({ hoverLabel }),
  setMotif: (motif, motifAccent) => set({ motif, motifAccent }),
  bumpDisturb: () => set((s) => ({ disturb: s.disturb + 1 })),
  setActiveSkillGroup: (activeSkillGroup) => set({ activeSkillGroup }),
  setActiveProject: (activeProject) => set({ activeProject }),
}));
