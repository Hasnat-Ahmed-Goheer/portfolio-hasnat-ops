"use client";

/**
 * Self-contained Canvas2D toy — NO WebGL (the single R3F context is sacred).
 * A tiny pod scheduler: workloads (particles) drift through a flow field and
 * get pulled toward whichever "node" you point at, like the scheduler binding
 * pods to the least-loaded node. Click/drag to move the attractor; the
 * telemetry line reports live bound/pending counts.
 *
 * Reduced motion: no autonomous flow-field drift (the lattice holds still),
 * but the toy stays INTERACTIVE — pods move and bind only in direct response
 * to the pointer, which is user-initiated motion and fine under prefers-
 * reduced-motion. Pauses when the tab is hidden or the canvas scrolls out of
 * view (IntersectionObserver + visibilitychange).
 */
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/stores/uiStore";

const COUNT_FULL = 90;
const COUNT_MOBILE = 44;

interface Pod {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bound: number; // 0..1 how strongly it's caught by the attractor
}

export default function SchedulerToy() {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const gpuTier = useUiStore((s) => s.gpuTier);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bound, setBound] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = gpuTier === "mobile" ? COUNT_MOBILE : COUNT_FULL;
    /* reduced motion: no autonomous drift (the field holds still), but the toy
       stays INTERACTIVE — pods move only in direct response to the pointer,
       which is user-initiated motion and fine under prefers-reduced-motion. */
    const calm = reducedMotion;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const accent = readVar("--accent2") || "#f59e0b";
    const muted = readVar("--muted") || "#6b7280";

    /* attractor — follows the pointer. `over` = cursor is on the field (gentle
       pull), `active` = pressed (hard schedule). When the cursor is away, NO
       pull at all, so pods relax and the count returns to 0 instead of the node
       silently hoarding everything from its resting spot. */
    const attract = { x: 0.5, y: 0.5, active: false, over: false };

    const pods: Pod[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
      bound: 0,
    }));

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = 220;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    /* flow field: cheap rotating sin lattice. Writes into module-scoped scratch
       (flowX/flowY) instead of returning a tuple, so there's zero allocation in
       the per-frame loop (count × 60/s arrays otherwise). */
    let flowX = 0;
    let flowY = 0;
    function flow(x: number, y: number, t: number) {
      const a = Math.sin(x * 6.2 + t * 0.4) + Math.cos(y * 5.1 - t * 0.3);
      flowX = Math.cos(a * 1.7) * 0.00045;
      flowY = Math.sin(a * 1.7) * 0.00045;
    }

    let raf = 0;
    let t = 0;
    let running = true; // in-view + tab-visible gate (the pause owner)
    /* `looping` tracks whether a rAF chain is currently in flight. Under reduced
       motion the toy is EVENT-DRIVEN: nothing drifts, so a continuous 60fps
       redraw of a still lattice would be pure waste (and a continuous repaint is
       against the spirit of prefers-reduced-motion). Instead a pointer event
       `kick()`s a short loop that runs only until the bind easing has settled,
       then stops — zero frames while idle. Full-motion keeps the steady loop. */
    let looping = false;
    /* only push React state when the integer actually changes — the readout is
       a whole number, so a per-frame setState would re-render this component
       ~60×/s next to the WebGL canvas for nothing (audit HIGH-1) */
    let lastCaught = -1;

    /* reduced-motion idle test: pods never move under `calm` (no flow, no
       pull), so the only thing animating is each pod's `bound` easing toward
       its target. Once every pod has converged there is nothing left to draw,
       so the loop can stop until the next pointer event. */
    function settled() {
      for (const p of pods) {
        const dx = attract.x - p.x;
        const dy = attract.y - p.y;
        const d2 = dx * dx + dy * dy;
        const bindR2 = attract.active ? 0.05 : 0.03;
        const target = attract.over && d2 < bindR2 ? 1 : 0;
        if (Math.abs(target - p.bound) > 0.003) return false;
      }
      return true;
    }

    /* spin the loop if it isn't already (no-op under full motion, where the
       steady loop is always running). Used by the pointer handlers when calm. */
    function kick() {
      if (!running || looping) return;
      looping = true;
      raf = requestAnimationFrame(step);
    }

    function step() {
      t += running && !calm ? 0.016 : 0;
      ctx!.clearRect(0, 0, w, h);
      let caught = 0;

      for (const p of pods) {
        if (running) {
          const dx = attract.x - p.x;
          const dy = attract.y - p.y;
          const d2 = dx * dx + dy * dy;

          /* Autonomous drift at FULL speed, even for bound pods. Earlier builds
             slowed ("pinned") scheduled pods, but that made them linger and
             accumulate in the bind zone — a held press piled up a stuck clump.
             Keeping full drift means a pod is only ever counted while it is
             genuinely passing through the zone, so the count self-relaxes the
             instant you stop pressing / leave: nothing can pile up. */
          if (!calm) {
            flow(p.x, p.y, t);
            p.vx += flowX;
            p.vy += flowY;
          }

          /* Pull (gather) ONLY while pressing — that's the deliberate "schedule"
             action. Hover does NOT pull, so a parked cursor can't slowly vacuum
             a clump (which caused the count to oscillate/accrete). The radius is
             small + local so even a press only gathers the handful near the
             cursor, never the whole field. */
          if (attract.active && !calm && d2 < 0.05) {
            p.vx += dx * 0.0035;
            p.vy += dy * 0.0035;
          }
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.x += p.vx;
          p.y += p.vy;
          /* wrap */
          if (p.x < 0) p.x += 1;
          if (p.x > 1) p.x -= 1;
          if (p.y < 0) p.y += 1;
          if (p.y > 1) p.y -= 1;

          /* Bind = smoothed proximity within a TIGHT zone around the node, gated
             on `over`. Tight radius + residual drift means the bound set is a
             small, churning handful near where you point, and it eases back to 0
             when the cursor leaves — never a runaway pile. */
          const bindR2 = attract.active ? 0.05 : 0.03;
          const target = attract.over && d2 < bindR2 ? 1 : 0;
          p.bound += (target - p.bound) * 0.2;
        }
        if (p.bound > 0.5) caught++;

        const px = p.x * w;
        const py = p.y * h;
        const r = 1.4 + p.bound * 2.4;
        ctx!.beginPath();
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fillStyle = p.bound > 0.4 ? accent : muted;
        ctx!.globalAlpha = 0.35 + p.bound * 0.6;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      /* attractor crosshair (the node we're binding to) */
      const ax = attract.x * w;
      const ay = attract.y * h;
      ctx!.strokeStyle = accent;
      ctx!.globalAlpha = attract.active ? 0.75 : attract.over ? 0.5 : 0.2;
      ctx!.beginPath();
      ctx!.arc(ax, ay, 10, 0, Math.PI * 2);
      ctx!.moveTo(ax - 14, ay);
      ctx!.lineTo(ax + 14, ay);
      ctx!.moveTo(ax, ay - 14);
      ctx!.lineTo(ax, ay + 14);
      ctx!.stroke();
      ctx!.globalAlpha = 1;

      if (caught !== lastCaught) {
        lastCaught = caught;
        setBound(caught);
      }
      if (!running) {
        looping = false;
        return;
      }
      /* reduced motion: stop once everything has settled — the next pointer
         event will kick() the loop back to life. Full motion: keep looping. */
      if (calm && settled()) {
        looping = false;
        return;
      }
      raf = requestAnimationFrame(step);
    }

    /* pause when off-screen or tab hidden */
    let inView = true;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        toggle();
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    function toggle() {
      const shouldRun = inView && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        /* full motion resumes the steady loop; calm just redraws once and
           settles (kick spins it only long enough to repaint the current state) */
        if (!calm) {
          looping = true;
          raf = requestAnimationFrame(step);
        } else {
          kick();
        }
      } else if (!shouldRun && running) {
        running = false;
        looping = false;
        cancelAnimationFrame(raf);
      }
    }
    const onVis = () => toggle();
    document.addEventListener("visibilitychange", onVis);

    function pointerTo(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      attract.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      attract.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    }
    function isInside(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    }
    const onDown = (e: PointerEvent) => {
      attract.active = true;
      attract.over = true;
      pointerTo(e);
      canvas!.setPointerCapture(e.pointerId);
      kick(); // calm: spin the loop so the bind easing can animate to the press
    };
    /* hover-follow: the node tracks the cursor even with no button held, so
       just moving across the field schedules pods (press pulls harder). This
       is what makes the bound counter visibly respond to a plain mouse-over. */
    const onMove = (e: PointerEvent) => {
      attract.over = true;
      pointerTo(e);
      kick(); // calm: each move repaints the crosshair + re-eases nearby pods
    };
    /* Release on up. With setPointerCapture, releasing the button OUTSIDE the
       canvas would NOT fire pointerleave, so `over` could stay stuck true and
       the node would keep binding forever. Drop capture and re-test whether the
       pointer is actually still over the field; if not, clear `over` too. */
    const onUp = (e: PointerEvent) => {
      attract.active = false;
      if (canvas!.hasPointerCapture(e.pointerId)) {
        canvas!.releasePointerCapture(e.pointerId);
      }
      if (!isInside(e)) attract.over = false;
      kick(); // calm: let the released pods ease back out
    };
    /* cursor left the field → drop the pull so pods relax and the count eases
       back to 0 (pending = all) rather than staying pinned to a stale node */
    const onLeave = () => {
      attract.over = false;
      attract.active = false;
      kick(); // calm: animate the bound set easing back to 0
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerenter", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    looping = true;
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerenter", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, gpuTier]);

  const count = gpuTier === "mobile" ? COUNT_MOBILE : COUNT_FULL;

  return (
    <div className="group h-full rounded-lg border hairline bg-elev/50 p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs" style={{ color: "var(--accent2)" }}>
          exp/scheduler
        </p>
        <p className="font-mono text-[10px] text-muted">
          <span className="text-ok">●</span> canvas2d · no webgl
        </p>
      </div>
      <p className="mt-2 text-xl font-medium tracking-tight">Pod scheduler</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {count} workloads{reducedMotion ? " held in a still lattice" : " drift through a flow field"}.{" "}
        Move your cursor across the field — pods near the scheduling node are
        highlighted as bound{reducedMotion ? "" : "; press to pull a cluster onto it"}.
      </p>
      <div ref={wrapRef} className="mt-4">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair rounded border hairline"
          role="img"
          aria-label="Interactive pod scheduler: workloads drift and bind to a node you drag"
        />
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted" aria-live="off">
        bound <span style={{ color: "var(--accent2)" }}>{bound}</span> / {count}{" "}
        · pending {count - bound}
      </p>
    </div>
  );
}

function readVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
