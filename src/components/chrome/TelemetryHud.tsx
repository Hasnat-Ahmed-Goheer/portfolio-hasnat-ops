"use client";

/**
 * Persistent corner telemetry — makes the whole site read as a running system.
 * Uptime, GPU fps (real frame meter), the active scene, and "pods online"
 * (kubectl-scale replicas) update through refs on a visibility-aware interval
 * (paused while the tab is hidden, matching the canvas), never React state.
 * Decorative readouts are aria-hidden; the collapse control is a real button.
 * md+ only (mobile has the terminal launcher in the opposite corner).
 */
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getFps } from "@/lib/perfMeter";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";

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

/** fps → health colour (truthful telemetry, not a static green dot) */
function fpsColor(fps: number): string {
  if (fps < 30) return "var(--danger)";
  if (fps < 50) return "var(--accent2)";
  return "var(--ok)";
}

export default function TelemetryHud() {
  const pathname = usePathname();
  const booted = useUiStore((s) => s.booted);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const [collapsed, setCollapsed] = useState(false);

  const dotRef = useRef<HTMLSpanElement>(null);
  const uptimeRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const podsRef = useRef<HTMLSpanElement>(null);

  /* visibility-aware interval (not rAF): these are ~1 Hz text writes that
     don't need frame alignment, and the loop must go quiet on a hidden tab
     so a backgrounded page idles like the canvas does. Uptime is derived from
     wall-clock so it stays accurate across pauses. */
  useEffect(() => {
    const start = Date.now();
    let timer: ReturnType<typeof setInterval> | undefined;
    const period = reducedMotion ? 2000 : 1000;

    const tick = () => {
      const secs = Math.floor((Date.now() - start) / 1000);
      const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
      const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
      const ss = String(secs % 60).padStart(2, "0");
      if (uptimeRef.current) uptimeRef.current.textContent = `${hh}:${mm}:${ss}`;
      const fps = getFps();
      if (fpsRef.current) fpsRef.current.textContent = `${fps}`;
      if (dotRef.current) dotRef.current.style.backgroundColor = fpsColor(fps);
      if (podsRef.current)
        podsRef.current.textContent = `${useSceneStore.getState().replicas}`;
    };

    const startTimer = () => {
      if (timer === undefined) {
        tick();
        timer = setInterval(tick, period);
      }
    };
    const stopTimer = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    const onVisibility = () =>
      document.visibilityState === "hidden" ? stopTimer() : startTimer();

    startTimer();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  const scene = sceneFor(pathname);

  return (
    <div
      className={`fixed bottom-5 left-5 z-30 hidden font-mono text-[10px] leading-tight transition-opacity duration-700 md:block motion-reduce:transition-none ${
        booted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-stretch overflow-hidden rounded-md border hairline bg-elev/80 backdrop-blur">
        {/* collapse toggle; the dot is fps-colored live telemetry */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Show telemetry" : "Hide telemetry"}
          aria-expanded={!collapsed}
          className="flex items-center gap-2 px-2.5 py-2 text-muted transition-colors hover:text-text"
        >
          <span
            ref={dotRef}
            className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-ok"
          />
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
      </div>
    </div>
  );
}
