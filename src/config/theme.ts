/**
 * theme.ts — creative token layer (palette / type / fx intensities).
 * Mirrored as CSS variables in globals.css. Scenes read colors from here
 * so retuning the art direction never touches component code.
 */
export const themes = {
  ops: {
    label: "ops",
    bg: "#0a0e14",
    bgElev: "#0e141d",
    text: "#e6edf3",
    muted: "#8b98a9",
    line: "rgba(230,237,243,0.08)",
    accent: "#22d3ee", // cyan — healthy / interactive
    accent2: "#f59e0b", // amber — warnings / eggs
    accent3: "#8b5cf6", // violet — AI / latent scenes only
    ok: "#34d399",
    danger: "#f87171",
  },
  phosphor: {
    label: "phosphor",
    bg: "#050805",
    bgElev: "#0a120a",
    text: "#d8f3d8",
    muted: "#6fa86f",
    line: "rgba(216,243,216,0.10)",
    accent: "#4ade80",
    accent2: "#facc15",
    accent3: "#a3e635",
    ok: "#4ade80",
    danger: "#f87171",
  },
} as const;

export type ThemeName = keyof typeof themes;
export const DEFAULT_THEME: ThemeName = "ops";

/** Postprocessing intensities — first knobs dropped under load. */
export const fx = {
  bloomIntensity: 0.9,
  bloomThreshold: 0.18,
  /* barely-there filmic hint, gated on sceneReady (see Effects.tsx). Kept low
     on purpose: the grain is texture, not a load-state mask (the boot curtain +
     sceneReady reveal already hide the converging field), and at higher values
     its screen-blended static shimmered over body copy on content routes. */
  grainOpacity: 0.022,
  vignetteDarkness: 0.55,
};
