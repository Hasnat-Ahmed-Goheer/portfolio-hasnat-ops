"use client";

/**
 * Persistent corner telemetry — makes the whole site read as a running system.
 * Uptime, GPU fps (real frame meter), the active scene, and "pods online"
 * (kubectl-scale replicas) update through refs ~2×/s, never React state. Also
 * hosts the ambient-sound toggle. Decorative readouts are aria-hidden; the
 * sound button is a real labelled control. md+ only (mobile has the terminal
 * launcher in the opposite corner). Collapses to a single status dot.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getFps } from "@/lib/perfMeter";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { useConsoleStore, readStoredSound } from "@/stores/consoleStore";
import { setAudioEnabled } from "@/lib/audio";

const SCENE_LABEL: Record<string, string> = {
  "/": "cluster.hive",
  "/about": "latent.field",
  "/work": "pipeline.flow",
  "/experience": "pipeline.dim",
  "/lab": "latent.lab",
  "/contact": "uplink.beacon",
};

function sceneFor(path: string): string {
  if (path.startsWith("/work/")) return "deployment.motif";
  return SCENE_LABEL[path] ?? "console.idle";
}

export default function TelemetryHud() {
  const pathname = usePathname();
  const booted = useUiStore((s) => s.booted);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const soundEnabled = useConsoleStore((s) => s.soundEnabled);
  const setSoundEnabled = useConsoleStore((s) => s.setSoundEnabled);
  const [collapsed, setCollapsed] = useState(false);

  const uptimeRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const podsRef = useRef<HTMLSpanElement>(null);

  /* hydrate the persisted sound preference once, post-mount (avoids SSR) */
  useEffect(() => {
    const stored = readStoredSound();
    if (stored) setSoundEnabled(true);
  }, [setSoundEnabled]);

  /* keep the audio engine in sync with the toggle */
  useEffect(() => {
    setAudioEnabled(soundEnabled);
  }, [soundEnabled]);

  /* ref-driven readouts — ~2×/s, no re-renders */
  useEffect(() => {
    const start = performance.now();
    let last = 0;
    let raf = 0;
    const interval = reducedMotion ? 1000 : 500;
    const tick = (now: number) => {
      if (now - last >= interval) {
        last = now;
        const secs = Math.floor((now - start) / 1000);
        const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
        const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
        const ss = String(secs % 60).padStart(2, "0");
        if (uptimeRef.current) uptimeRef.current.textContent = `${hh}:${mm}:${ss}`;
        if (fpsRef.current) fpsRef.current.textContent = `${getFps()}`;
        if (podsRef.current)
          podsRef.current.textContent = `${useSceneStore.getState().replicas}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const scene = sceneFor(pathname);

  return (
    <div
      className={`fixed bottom-5 left-5 z-30 hidden font-mono text-[10px] leading-tight transition-opacity duration-700 md:block motion-reduce:transition-none ${
        booted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-stretch overflow-hidden rounded-md border hairline bg-elev/80 backdrop-blur">
        {/* collapse toggle / live status dot */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Show telemetry" : "Hide telemetry"}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 px-2.5 py-2 text-muted transition-colors hover:text-text"
        >
          <span className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-ok" />
          {collapsed && <span className="text-muted/70">sys</span>}
        </button>

        {!collapsed && (
          <div
            aria-hidden="true"
            className="flex items-center gap-3 border-l hairline px-3 py-2 text-muted/80"
          >
            <span>
              up <span ref={uptimeRef} className="text-text/70">00:00:00</span>
            </span>
            <span className="hidden lg:inline">
              <span className="text-text/70">{scene}</span>
            </span>
            <span>
              gpu <span ref={fpsRef} className="text-text/70">60</span>
              <span className="text-muted/50">fps</span>
            </span>
            <span>
              pods <span ref={podsRef} className="text-text/70">100</span>
            </span>
          </div>
        )}

        {/* ambient sound toggle — a real control (not aria-hidden) */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={soundEnabled ? "Mute ambient sound" : "Enable ambient sound"}
          aria-pressed={soundEnabled}
          className={`border-l hairline px-2.5 py-2 transition-colors hover:text-text ${
            soundEnabled ? "text-accent" : "text-muted"
          }`}
        >
          {soundEnabled ? "♪ on" : "♪ off"}
        </button>
      </div>
    </div>
  );
}
