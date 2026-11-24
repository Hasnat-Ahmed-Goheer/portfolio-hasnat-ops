"use client";

/**
 * The "off" tier backdrop: no WebGL, just the static nebula gradient. Lives
 * outside CanvasRoot so visitors on this tier (reduced motion, no WebGL,
 * software rendering) never download three.js / R3F.
 */
import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";

export default function StaticBackdrop() {
  /* no canvas will ever render a frame, so unblock the boot reveal now */
  useEffect(() => {
    useUiStore.getState().setSceneReady(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="scene-layer"
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 30% 35%, color-mix(in srgb, var(--accent) 9%, transparent), transparent), radial-gradient(ellipse 55% 45% at 75% 70%, color-mix(in srgb, var(--accent3) 7%, transparent), transparent)",
      }}
    />
  );
}
