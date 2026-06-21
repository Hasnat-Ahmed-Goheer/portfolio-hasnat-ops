"use client";

/**
 * The hero name, made kinetic. Two layers over one set of per-letter spans:
 *
 *  1. Decode reveal — same scramble→resolve motif as DecodeText, gated on the
 *     page being VISIBLE (booted && !routeTransitioning) so it plays after the
 *     boot screen / route curtain lifts, never unseen behind them.
 *  2. Cursor magnetism — while a fine pointer hovers the name, each letter
 *     leans toward the cursor with a distance falloff and springs back, echoing
 *     the draggable cluster's magnetism so the whole hero feels like one field.
 *
 * SSR / no-JS / reduced motion render the plain name (letters, no transform).
 * The accessible name lives on the wrapper's aria-label; letters are hidden.
 */
import { useEffect, useRef } from "react";
import { useUiStore } from "@/stores/uiStore";

const GLYPHS = "█▓▒░<>/[]{}#$%&*+=";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const RADIUS = 150; // px — how far the cursor's pull reaches
const STRENGTH = 0.42; // fraction of cursor offset a letter chases
const MAX_OFF = 15; // px — clamp so letters lean, never fly

export default function KineticName({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const booted = useUiStore((s) => s.booted);
  const transitioning = useUiStore((s) => s.routeTransitioning);
  const visible = booted && !transitioning;

  /* ---- decode reveal (gated on visibility, like DecodeText) ---- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-kn-letter]")
    );
    if (!letters.length) return;

    let raf = 0;
    let failsafe: ReturnType<typeof setTimeout> | undefined;

    const real = letters.map((l) => l.dataset.char ?? "");
    const setAll = (fn: (i: number) => string) =>
      letters.forEach((l, i) => {
        if (real[i] === " ") return;
        l.textContent = fn(i);
      });

    const runDecode = () => {
      let frame = 0;
      const total = Math.max(20, letters.length + 10);
      const tick = () => {
        frame++;
        const reveal = (frame / total) * letters.length;
        if (reveal >= letters.length) {
          setAll((i) => real[i]);
          return;
        }
        setAll((i) => (i < reveal ? real[i] : glyph()));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (visible) {
      runDecode();
    } else {
      setAll(() => glyph());
      if (booted) failsafe = setTimeout(runDecode, 1600);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, [text, visible, booted]);

  /* ---- cursor magnetism (fine pointer + motion only) ---- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const letters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-kn-letter]")
    );
    if (!letters.length) return;

    const cur = letters.map(() => ({ x: 0, y: 0 }));
    let centers: { x: number; y: number }[] | null = null;
    let px = 0,
      py = 0,
      hovering = false,
      raf = 0;

    /* letter centres relative to the root's box — invariant under scroll, so
       we only re-measure on resize (cheap: one layout read per letter once) */
    const measure = () => {
      const base = root.getBoundingClientRect();
      centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - base.left,
          y: r.top + r.height / 2 - base.top,
        };
      });
    };

    const tick = () => {
      let moving = false;
      for (let i = 0; i < letters.length; i++) {
        let tx = 0,
          ty = 0;
        if (hovering && centers) {
          const dx = px - centers[i].x;
          const dy = py - centers[i].y;
          const dist = Math.hypot(dx, dy);
          const f = Math.max(0, 1 - dist / RADIUS);
          tx = Math.max(-MAX_OFF, Math.min(MAX_OFF, dx * STRENGTH * f));
          ty = Math.max(-MAX_OFF, Math.min(MAX_OFF, dy * STRENGTH * f));
        }
        cur[i].x += (tx - cur[i].x) * 0.18;
        cur[i].y += (ty - cur[i].y) * 0.18;
        if (Math.abs(cur[i].x - tx) > 0.1 || Math.abs(cur[i].y - ty) > 0.1)
          moving = true;
        letters[i].style.transform = `translate(${cur[i].x.toFixed(2)}px, ${cur[
          i
        ].y.toFixed(2)}px)`;
      }
      raf = moving || hovering ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* listen on window, not the element: the hero is `.scene-passthrough`
       (pointer-events:none on fine pointers, so the cluster canvas underneath
       stays interactive). Window still receives the bubbled move, and a cheap
       bounding-box gate keeps the per-letter math off until the cursor nears
       the name — so the canvas keeps the cursor AND the name reacts. */
    const onMove = (e: PointerEvent) => {
      if (!centers) measure();
      const base = root.getBoundingClientRect();
      const near =
        e.clientX >= base.left - RADIUS &&
        e.clientX <= base.right + RADIUS &&
        e.clientY >= base.top - RADIUS &&
        e.clientY <= base.bottom + RADIUS;
      if (near) {
        px = e.clientX - base.left;
        py = e.clientY - base.top;
        hovering = true;
        start();
      } else if (hovering) {
        hovering = false;
        start();
      }
    };
    const onResize = () => {
      centers = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <span ref={rootRef} className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-kn-letter
          data-char={ch}
          aria-hidden="true"
          className="inline-block will-change-transform"
          style={ch === " " ? { whiteSpace: "pre" } : undefined}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
