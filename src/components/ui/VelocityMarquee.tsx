"use client";

/**
 * Scroll-reactive ticker. A band of words drifts sideways on its own;
 * scrolling speeds it up in the direction you scroll, and the text leans
 * (skews) with the scroll speed, then eases back to a slow drift.
 *
 * The scroll speed comes from window.scrollY deltas per frame, so it works
 * with Lenis smooth scroll and with native scroll alike. The loop only runs
 * while the band is on screen. Reduced motion renders a static row.
 */
import { useEffect, useRef, useState } from "react";

const BASE = 36; // px/s idle drift
const BOOST = 0.32; // share of scroll speed added to the drift
const MAX_SKEW = 7; // deg

export default function VelocityMarquee({
  items,
  label,
}: {
  items: string[];
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /* the looping copies are added after mount, so the server HTML (what
     crawlers read) holds the list once */
  const [looped, setLooped] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!looped) {
      setLooped(true);
      return;
    }

    const group = track.firstElementChild as HTMLElement | null;
    if (!group) return;
    let groupW = group.offsetWidth;

    let x = 0;
    let dir = -1; // -1 = leftwards
    let vel = 0; // smoothed scroll speed, px/s
    let skew = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let visible = false;

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000) || 0.016;
      lastT = t;
      const y = window.scrollY;
      const v = (y - lastY) / dt;
      lastY = y;
      vel += (v - vel) * 0.12;
      /* scrolling down pulls the band left, scrolling up pushes it right,
         and it keeps drifting the way it was last pushed */
      if (Math.abs(vel) > 40) dir = vel > 0 ? -1 : 1;

      x += (dir * BASE + dir * Math.abs(vel) * BOOST) * dt;
      if (x <= -groupW) x += groupW;
      if (x > 0) x -= groupW;

      const targetSkew = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, -vel * 0.006));
      skew += (targetSkew - skew) * 0.15;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible && !raf) {
        lastT = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(wrap);
    const onResize = () => (groupW = group.offsetWidth);
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [items, looped]);

  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : label}
      className="flex shrink-0 items-center"
    >
      {items.map((it, i) => (
        <li key={i} className="flex items-center">
          <span
            className={
              i % 2 === 0
                ? "text-text"
                : "text-muted"
            }
          >
            {it}
          </span>
          <span aria-hidden="true" className="px-6 text-accent/70 sm:px-10">
            /
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden border-b hairline bg-bg/85 py-6 sm:py-8"
    >
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap text-4xl font-medium tracking-tight will-change-transform sm:text-6xl"
      >
        {row(false)}
        {looped && row(true)}
        {looped && row(true)}
      </div>
      {/* soft fade at both edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent sm:w-32"
      />
    </div>
  );
}
