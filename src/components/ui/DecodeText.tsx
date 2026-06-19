"use client";

/** Terminal-style scramble→decode reveal for labels. RM ⇒ static text.
 *
 * The reveal is held until the page is actually VISIBLE — i.e. booted AND not
 * mid route-transition. Otherwise it runs on mount and finishes behind the boot
 * screen / route curtain, so the user only ever saw it on a hard refresh. While
 * covered it shows an encrypted placeholder, then decodes the instant the
 * curtain lifts (with a failsafe so an interrupted curtain can't freeze it).
 * SSR / no-JS / reduced motion render the real text immediately. */
import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/uiStore";

const GLYPHS = "█▓▒░<>/[]{}#$%&*+=";

function scramble(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
  return s;
}

export default function DecodeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [out, setOut] = useState(text);
  /* visible = the route is actually on screen — gate the reveal on it */
  const booted = useUiStore((s) => s.booted);
  const transitioning = useUiStore((s) => s.routeTransitioning);
  const visible = booted && !transitioning;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }

    let raf = 0;
    let failsafe: ReturnType<typeof setTimeout> | undefined;
    const runDecode = () => {
      let frame = 0;
      const totalFrames = Math.max(18, text.length + 8);
      const tick = () => {
        frame++;
        const reveal = Math.floor((frame / totalFrames) * text.length);
        if (reveal >= text.length) {
          setOut(text);
          return;
        }
        const noiseLen = Math.min(text.length - reveal, 3);
        setOut(text.slice(0, reveal) + scramble(noiseLen));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    if (visible) {
      runDecode();
    } else {
      /* still covered (boot screen or route curtain): pre-encrypt and wait so
         the decode plays where the user can see it. The failsafe only guards
         the curtain case (booted): it decodes anyway if a transition flag gets
         stuck (interrupted curtain). NOT armed during boot — the boot screen
         can outlast it, and `booted` flipping reliably re-runs this effect. */
      setOut(scramble(Math.min(text.length, 12)));
      if (booted) failsafe = setTimeout(runDecode, 1600);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
    };
  }, [text, visible, booted]);

  return (
    <span className={className} aria-label={text}>
      {out}
    </span>
  );
}
