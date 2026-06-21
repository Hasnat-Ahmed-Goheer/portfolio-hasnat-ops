"use client";

/**
 * Scroll-scrubbed "tuning in" decode — a section label arrives as static noise
 * and resolves to clean text as it crosses into the reading zone, then
 * re-scrambles when it scrolls back down. The site-wide spine tying the
 * terminal decode motif to the page rhythm.
 *
 * Driven by IntersectionObserver + rAF off the element's LIVE rect, NOT
 * ScrollTrigger — deliberately, for the same reason the home Counter avoids it:
 * these labels can sit below a 220vh pinned section whose pin-spacer shifts
 * their Y, so a ScrollTrigger start/end computed against stale layout goes
 * inactive at the wrong scroll position and freezes (verified: progress stuck
 * while the label was plainly on screen). The rect + IO are ground truth and
 * immune to pin/refresh/Lenis-lag math.
 *
 * Authored legible-by-default: `out` starts as the real text, so if JS never
 * runs the label is readable, never stuck as cipher (CLAUDE.md pitfall #5).
 * SSR / reduced motion = static text.
 */
import { useEffect, useRef, useState } from "react";

const GLYPHS = "█▓▒░<>/[]{}#$%&*+=";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

export default function ScrollDecodeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }

    let last = -1;
    const render = (p: number) => {
      const reveal = Math.floor(p * text.length);
      /* skip a re-render when the revealed-count hasn't changed AND we're at a
         resting end (fully clean / fully noise) — keeps idle labels quiet */
      if (reveal === last && (p <= 0 || p >= 1)) return;
      last = reveal;
      if (reveal >= text.length) {
        setOut(text);
        return;
      }
      let s = text.slice(0, reveal);
      for (let i = reveal; i < text.length; i++)
        s += text[i] === " " ? " " : glyph();
      setOut(s);
    };

    /* map the top edge travelling 90%→56% of the viewport height to noise→clean */
    const progress = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      return Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (vh * 0.34)));
    };

    let raf = 0;
    let active = false;
    const tick = () => {
      render(progress());
      raf = active ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          active = true;
          if (!raf) raf = requestAnimationFrame(tick);
        } else {
          active = false;
          /* settle to the correct resting end based on which way it left */
          render(e.boundingClientRect.top < 0 ? 1 : 0);
        }
      },
      /* a margin so the rAF is already running before the label reaches the
         reading zone and after it leaves it */
      { rootMargin: "12% 0px 12% 0px", threshold: 0 }
    );
    io.observe(el);
    /* seed immediately (above-fold labels mount already decoded) */
    render(progress());

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out}
    </span>
  );
}
