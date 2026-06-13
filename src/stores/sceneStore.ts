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
  /** fraction of cluster nodes that should be "scheduled" (kubectl scale) */
  replicaFrac: number;
  /** echoed replica count for the telemetry/UI, set by kubectl scale */
  replicas: number;
  /** kill pulse: bump seq + name so the cluster evicts a matching pod */
  killSeq: number;
  killName: string;
  setProgress: (p: number) => void;
  setHoverLabel: (l: string) => void;
  setMotif: (m: MotifKey, accent: string) => void;
  bumpDisturb: () => void;
  setActiveSkillGroup: (id: string) => void;
  setActiveProject: (i: number) => void;
  scaleReplicas: (n: number) => void;
  killPod: (name: string) => void;
}

/** logical replica baseline — `kubectl scale --replicas=N` is read against it */
export const BASE_REPLICAS = 100;

export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  motif: "orbit",
  motifAccent: "#22d3ee",
  disturb: 0,
  activeSkillGroup: "",
  activeProject: -1,
  hoverLabel: "",
  replicaFrac: 1,
  replicas: BASE_REPLICAS,
  killSeq: 0,
  killName: "",
  setProgress: (progress) => set({ progress }),
  setHoverLabel: (hoverLabel) => set({ hoverLabel }),
  setMotif: (motif, motifAccent) => set({ motif, motifAccent }),
  bumpDisturb: () => set((s) => ({ disturb: s.disturb + 1 })),
  setActiveSkillGroup: (activeSkillGroup) => set({ activeSkillGroup }),
  setActiveProject: (activeProject) => set({ activeProject }),
  scaleReplicas: (n) =>
    set({
      replicas: n,
      replicaFrac: Math.max(0, Math.min(1, n / BASE_REPLICAS)),
    }),
  killPod: (name) => set((s) => ({ killSeq: s.killSeq + 1, killName: name })),
}));
