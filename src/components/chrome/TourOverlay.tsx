"use client";

/**
 * TourOverlay — the on-screen caption layer for the guided tour (`demo`/`tour`).
 *
 * Pure view + interrupt wiring over consoleStore's tour state; all timing and
 * scene side effects live in lib/tour.ts. The overlay:
 *  - shows the current beat's title/body + a progress indicator + a clearly
 *    visible "Esc to exit" / skip control (aria-live=polite, keyboard-operable);
 *  - stops the tour on Esc, on any user navigation away from the beat's route,
 *    and when the terminal opens (the three documented interrupts);
 *  - is pin-safe: a fixed sibling of <main> with NO transform/filter/
 *    will-change/backdrop-filter, so it can never become a pinned section's
 *    containing block (CLAUDE.md pitfall #1).
 *
 * z: sits at z-[45] — above content + nav/scroll-progress (z-10..z-40) but
 * below the terminal/palette (z-50+) and the cursor, per the z-index contract.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConsoleStore } from "@/stores/consoleStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { tourBeats, stopTour } from "@/lib/tour";

export default function TourOverlay() {
  const active = useConsoleStore((s) => s.tourActive);
  const beatIdx = useConsoleStore((s) => s.tourBeat);
  const terminalOpen = useTerminalStore((s) => s.open);
  const pathname = usePathname();
  const skipRef = useRef<HTMLButtonElement>(null);

  /* Navigation interrupt — stop the tour if the user navigates away. The trap
     (which broke every tour launched off-home, e.g. the `demo` command from
     /lab): a beat sets its expected route, but `router.push` is async so
     `pathname` still reads the LAUNCH route for a tick — treating that initial
     mismatch as a user-nav killed the tour before beat 0 ever ran. So we only
     interrupt once the tour has actually ARRIVED at the current beat's route;
     until then a mismatch is just the tour's own navigation in flight. */
  const expectedRoute = useRef<string>("/");
  const arrived = useRef(false);
  const lastBeat = useRef<number>(-1);
  useEffect(() => {
    if (!active) {
      arrived.current = false;
      lastBeat.current = -1;
      return;
    }
    const route = tourBeats[beatIdx]?.route ?? "/";
    expectedRoute.current = route;
    if (beatIdx !== lastBeat.current) {
      /* the beat just changed — (re)start the arrival wait for its route; a
         same-route beat counts as already arrived. Never an interrupt. */
      lastBeat.current = beatIdx;
      arrived.current = pathname === route;
      return;
    }
    /* same beat, pathname moved: landing on the route = arrived; moving away
       AFTER arriving = the user took control → stop. */
    if (pathname === route) arrived.current = true;
    else if (arrived.current) stopTour();
  }, [active, beatIdx, pathname]);

  /* Terminal interrupt — opening the terminal hands control back to the
     operator. But `demo` launches the tour while the terminal is still closing,
     so only interrupt on a FRESH open: ignore the terminal being open until we
     have first observed it closed during this tour. */
  const sawTerminalClosed = useRef(false);
  useEffect(() => {
    if (!active) {
      sawTerminalClosed.current = false;
      return;
    }
    if (!terminalOpen) {
      sawTerminalClosed.current = true;
      return;
    }
    if (sawTerminalClosed.current) stopTour();
  }, [active, terminalOpen]);

  /* interrupt: Esc exits; also move focus to the skip control on start so the
     keyboard path has an obvious, reachable exit, and restore focus to whatever
     launched the tour (terminal input / ⌘K trigger) on exit so the keyboard
     user isn't orphaned on the now-unmounted button (audit MED-3). */
  useEffect(() => {
    if (!active) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stopTour();
      }
    };
    window.addEventListener("keydown", onKey);
    skipRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      if (prevFocus && prevFocus.isConnected) prevFocus.focus();
    };
  }, [active]);

  /* belt-and-braces: always release timers/scene if this unmounts mid-tour */
  useEffect(() => () => stopTour(), []);

  if (!active) return null;

  const beat = tourBeats[beatIdx];
  if (!beat) return null;
  const total = tourBeats.length;

  return (
    <section
      aria-live="polite"
      aria-label="Guided tour"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[45] flex justify-center px-4 md:bottom-10"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-lg border hairline bg-elev/95 p-4 font-mono shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>guided tour</span>
          <span className="ml-auto tabular-nums text-muted/70">
            {String(beatIdx + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        <p className="mt-2 text-sm text-accent">{beat.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-text/85">{beat.body}</p>

        {/* progress rail — segment per beat */}
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {tourBeats.map((_, i) => (
            <span
              key={i}
              className={`h-0.5 flex-1 rounded-full ${
                i <= beatIdx ? "bg-accent" : "bg-line"
              }`}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
          <span>auto-advancing</span>
          <button
            ref={skipRef}
            type="button"
            onClick={() => stopTour()}
            className="rounded border hairline px-2 py-1 text-[10px] text-text/80 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            esc to exit
          </button>
        </div>
      </div>
    </section>
  );
}
