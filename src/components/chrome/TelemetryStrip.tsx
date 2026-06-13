"use client";

/**
 * Always-on "the system is running" telemetry: req/s + p99 latency wander on
 * a cheap noise walk, GPU fps is read from the real frame meter. Updates a
 * few spans via refs (~5/s) — no React state churn. Static under reduced
 * motion. Purely decorative, aria-hidden.
 */
import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/uiStore";
import { getFps } from "@/lib/perfMeter";

export default function TelemetryStrip() {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const rps = useRef<HTMLSpanElement>(null);
  const p99 = useRef<HTMLSpanElement>(null);
  const fps = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let r = 1240;
    let l = 38;
    let last = 0;
    let raf = 0;
    const tick = (now: number) => {
      if (now - last > 200) {
        last = now;
        /* mean-reverting random walk so the numbers feel alive but bounded */
        r += (1240 - r) * 0.05 + (Math.random() - 0.5) * 70;
        l += (38 - l) * 0.08 + (Math.random() - 0.5) * 4;
        if (rps.current)
          rps.current.textContent =
            r >= 1000 ? `${(r / 1000).toFixed(2)}k` : `${Math.round(r)}`;
        if (p99.current) p99.current.textContent = `${Math.max(8, l).toFixed(0)}ms`;
        if (fps.current) fps.current.textContent = `${getFps()}fps`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <span
      aria-hidden="true"
      className="flex items-center gap-x-4 gap-y-1 whitespace-nowrap"
    >
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" />
        req/s <span ref={rps} className="text-text/70">1.24k</span>
      </span>
      <span>
        p99 <span ref={p99} className="text-text/70">38ms</span>
      </span>
      <span className="hidden sm:inline">
        gpu <span ref={fps} className="text-text/70">60fps</span>
      </span>
    </span>
  );
}
