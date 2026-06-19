"use client";

/**
 * Live control panel for the background latent field (the same shader rendering
 * behind /lab). Sliders write to labStore; LatentScene's "lab" variant reads
 * them in useFrame and lerps its uniforms. One-way DOM→3D flow — we never read
 * back from the scene.
 *
 * Capability-aware: on the "off" tier there is no canvas to drive, so the panel
 * explains that and disables itself rather than pretending to do nothing.
 */
import { useLabStore, LAB_FIELD_DEFAULTS } from "@/stores/labStore";
import { useUiStore } from "@/stores/uiStore";

interface Param {
  key: keyof typeof LAB_FIELD_DEFAULTS;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const PARAMS: Param[] = [
  { key: "noiseScale", label: "noise scale", min: 0.2, max: 3, step: 0.05, unit: "×freq" },
  { key: "flowSpeed", label: "flow speed", min: 0, max: 4, step: 0.05, unit: "×drift" },
  { key: "spread", label: "cluster spread", min: 0, max: 2.5, step: 0.05, unit: "×amp" },
  { key: "energy", label: "field energy", min: 0.2, max: 2, step: 0.05, unit: "×lum" },
];

export default function LatentControls() {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const state = useLabStore();
  const live = gpuTier !== "off";

  const setters: Record<keyof typeof LAB_FIELD_DEFAULTS, (v: number) => void> = {
    noiseScale: state.setNoiseScale,
    flowSpeed: state.setFlowSpeed,
    spread: state.setSpread,
    energy: state.setEnergy,
  };

  return (
    <div
      className="group h-full rounded-lg border hairline bg-elev/50 p-7"
      aria-label="Latent field controls"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs" style={{ color: "var(--accent2)" }}>
          exp/latent-field
        </p>
        <p className="font-mono text-[10px] text-muted">
          {live ? (
            <>
              <span className="text-ok">●</span> live · drives the field behind this page
            </>
          ) : (
            <>
              <span className="text-muted">○</span> canvas off · params no-op
            </>
          )}
        </p>
      </div>
      <p className="mt-2 text-xl font-medium tracking-tight">Latent field</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The 36k-point field drifting behind this page is{" "}
        <span className="font-mono text-[color:var(--accent2)]">exp/latent-field</span>,
        unsupervised. Retune the proc in real time — every slider rewrites a
        shader uniform on the next frame.
      </p>

      <fieldset
        className="mt-5 space-y-4"
        disabled={!live}
        aria-disabled={!live}
      >
        {PARAMS.map((p) => {
          const value = state[p.key];
          const inputId = `lab-field-${p.key}`;
          return (
            <div key={p.key}>
              <div className="flex items-baseline justify-between font-mono text-[11px]">
                <label htmlFor={inputId} className="text-muted">
                  {p.label}
                </label>
                <span style={{ color: live ? "var(--accent2)" : undefined }}>
                  {value.toFixed(2)} {p.unit}
                </span>
              </div>
              <input
                id={inputId}
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={value}
                onChange={(e) => setters[p.key](Number(e.target.value))}
                className="lab-range mt-2 w-full"
                aria-label={p.label}
              />
            </div>
          );
        })}
      </fieldset>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => state.reset()}
          disabled={!live}
          className="rounded border hairline px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-[color:var(--accent2)]/50 hover:text-[color:var(--accent2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent2)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          reset to baseline
        </button>
        {!live && (
          <span className="font-mono text-[10px] text-muted/70">
            reduced-motion / no-WebGL — the field renders as a static gradient
          </span>
        )}
      </div>
    </div>
  );
}
