"use client";

/**
 * Readability scrim — a pointer-events-none veil between the WebGL canvas
 * (.scene-layer, z-0) and <main> (z-10). The single persistent scene runs
 * behind every route; on content-heavy pages its live field + bloom shimmer
 * under body copy and wreck contrast. This lays a soft, center-weighted wash
 * of the page bg over the reading column while letting the scene glow at the
 * margins — so text gets a quiet bed without flattening the art.
 *
 * Intensity is route-aware: zero on the home hero (scene stays vivid), light
 * on already-dimmed scenes (experience/contact), full on the hot full-bright
 * scenes (work/lab/about). Only opacity changes between routes, so the swap
 * animates smoothly and rides under the route curtain.
 *
 * Stays pointer-events-none so .scene-passthrough sections still fall through
 * to the canvas. Fixed sibling of the shell with no transform → cannot become
 * a pin containing block (CLAUDE.md pitfall #1).
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";

/** overall veil strength per route, 0..1 (scales the gradient's opacity) */
function scrimStrengthFor(path: string): number {
  if (path === "/") return 0; // home hero — let the cluster breathe
  if (path === "/work" || path.startsWith("/work/")) return 0.85;
  if (path === "/lab") return 0.85;
  if (path === "/about") return 0.85;
  if (path === "/experience" || path === "/contact") return 0.55; // already dim scenes
  return 0.6;
}

/* Home keeps the hero vivid (strength 0 above), but the name, bio and the
   pinned statements used to sit straight on bright nodes. Two home-only
   layers fix that without dimming the art:
   - a bottom-up wash behind the hero copy (the copy sits at the bottom of
     the first screen), fading out as the hero scrolls away;
   - the normal centre veil, fading in with scroll (0 at the top, 0.8 one
     screen down) so the statements, stats and cards get a quiet bed.
   Both are written straight to style on scroll (rAF-batched), never through
   React state, so scrolling costs no re-renders. */
function HomeScrim({ reducedMotion }: { reducedMotion: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      if (heroRef.current) heroRef.current.style.opacity = String(1 - p);
      if (veilRef.current) veilRef.current.style.opacity = String(p * 0.8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const base = { position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" } as const;
  return (
    <>
      <div
        ref={heroRef}
        aria-hidden="true"
        style={{
          ...base,
          transition: reducedMotion ? "none" : "opacity 0.15s linear",
          background:
            "linear-gradient(to top, color-mix(in srgb, var(--bg) 82%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 28%, transparent 58%), radial-gradient(ellipse 60% 45% at 18% 72%, color-mix(in srgb, var(--bg) 55%, transparent), transparent 70%)",
        }}
      />
      <div
        ref={veilRef}
        aria-hidden="true"
        style={{
          ...base,
          opacity: 0,
          background: VEIL,
        }}
      />
    </>
  );
}

const VEIL =
  "radial-gradient(ellipse 125% 115% at 50% 48%, color-mix(in srgb, var(--bg) 72%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 50%, color-mix(in srgb, var(--bg) 12%, transparent) 100%)";

export default function SceneScrim() {
  const pathname = usePathname();
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const gpuTier = useUiStore((s) => s.gpuTier);
  /* no live canvas → no shimmer to quiet (static gradient fallback handles its
     own contrast); skip the scrim entirely so reading surfaces stay crisp */
  if (gpuTier === "off") return null;

  if (pathname === "/") return <HomeScrim reducedMotion={reducedMotion} />;

  const strength = scrimStrengthFor(pathname);
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        opacity: strength,
        transition: reducedMotion ? "none" : "opacity 0.4s ease",
        /* center-weighted: veils the reading column, fades to clear at the far
           edges/corners so the scene still glows in the margins. Alphas stay
           modest so even at full strength it's a wash, never a blackout. */
        background: VEIL,
      }}
    />
  );
}
