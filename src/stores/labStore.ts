"use client";

import { create } from "zustand";

/**
 * Lab sandbox controls. DOM sliders on /lab write here; the "lab" variant of
 * LatentScene reads these in useFrame and lerps its shader uniforms toward
 * them (one-way DOM→3D flow, same contract as sceneStore — never write back
 * from useFrame). Values are normalized so the scene can map them to uniforms.
 *
 * Defaults equal the scene's stock look, so an untouched panel == today's
 * field. The "off" tier has no canvas; the panel still moves these values, it
 * just drives nothing — graceful no-op.
 */
interface LabState {
  /** spatial frequency of the flow field (× base) */
  noiseScale: number;
  /** drift speed of the field over time (× base) */
  flowSpeed: number;
  /** how far points wander from their rest cloud (× base) */
  spread: number;
  /** overall brightness/energy of the field (× base) */
  energy: number;
  setNoiseScale: (v: number) => void;
  setFlowSpeed: (v: number) => void;
  setSpread: (v: number) => void;
  setEnergy: (v: number) => void;
  reset: () => void;
}

export const LAB_FIELD_DEFAULTS = {
  noiseScale: 1,
  flowSpeed: 1,
  spread: 1,
  energy: 1,
} as const;

export const useLabStore = create<LabState>((set) => ({
  ...LAB_FIELD_DEFAULTS,
  setNoiseScale: (noiseScale) => set({ noiseScale }),
  setFlowSpeed: (flowSpeed) => set({ flowSpeed }),
  setSpread: (spread) => set({ spread }),
  setEnergy: (energy) => set({ energy }),
  reset: () => set({ ...LAB_FIELD_DEFAULTS }),
}));
