"use client";

/**
 * Route-transition curtain — the site-wide replacement for the old opacity
 * fade. On every client navigation a "command panel" covers the viewport,
 * then slides up to reveal the freshly-mounted route beneath it (the overlay
 * IS the loading output; the page is what it reveals).
 *
 * Pin-safe by construction (CLAUDE.md pitfall #1): this is a fixed SIBLING of
 * {children}, never an ancestor of a pinned section, so its transform never
 * becomes the containing block for a pinned position:fixed element.
 *
 * Timing contract:
 *  - default CSS state = covering, so the new route never flashes before the
 *    curtain is in place. useGSAP runs in a layout effect (pre-paint).
 *  - first load is owned by BootSequence (same z-[60]); the curtain hides
 *    itself on the first mount so the two never fight.
 *  - reduced motion ⇒ no curtain at all (instant content).
 */
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/motion";
import { lexicon } from "@/config/console";
import { useUiStore } from "@/stores/uiStore";

export default function RouteCurtain() {
  const ref = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      /* The curtain default markup is display:none (so its "routing" panel
         never paints on first load or before hydration). It reveals ONLY for
         a real navigation: while !booted the BootSequence owns the screen, and
         reduced motion gets instant content — both leave the curtain hidden. */
      if (!useUiStore.getState().booted || reduce) return;

      gsap.set(el, { display: "flex", yPercent: 0, opacity: 1 });
      /* mark the viewport covered so entrance animations on the freshly-mounted
         route (DecodeText, reveals) hold until the curtain lifts — otherwise
         they finish unseen behind it and only show on a hard refresh */
      useUiStore.getState().setRouteTransitioning(true);
      const tl = gsap.timeline();
      if (meterRef.current) {
        tl.fromTo(
          meterRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.42, ease: "power2.out" }
        );
      }
      tl.to(el, {
        yPercent: -100,
        duration: 0.62,
        ease: "power3.inOut",
        onComplete: () => {
          gsap.set(el, { display: "none", clearProps: "transform,opacity" });
          useUiStore.getState().setRouteTransitioning(false);
          /* NOTE: no ScrollTrigger.refresh() here. LayoutShell is the single
             refresh owner per nav (it re-measures ~120ms after the pathname
             change, the documented mechanism — CLAUDE.md pitfall #3). The
             curtain is a fixed sibling and clearProps only touches the curtain
             itself, so it never changes pinned-section layout — a second
             refresh here was redundant and could re-pin mid-reveal. */
        },
      });
    },
    { scope: ref, dependencies: [path] }
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      /* hidden by default (SSR + every render); the layout effect sets
         display:flex pre-paint only for a real navigation, then back to none
         onComplete. Guarantees the "routing" panel never flashes on first load
         and the curtain never appears when `booted` flips. */
      style={{ display: "none" }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg"
    >
      {/* sweeping top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="w-full max-w-xs px-6 font-mono text-xs">
        <p className="text-muted">
          <span className="text-accent">{lexicon.sectionPrefix}</span>
          routing
          <span className="caret" />
        </p>
        <p className="mt-1 truncate text-text/70">{path}</p>
        {/* fill meter */}
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          <div
            ref={meterRef}
            className="h-full w-full origin-left bg-accent"
          />
        </div>
      </div>
    </div>
  );
}
