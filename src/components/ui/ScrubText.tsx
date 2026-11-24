"use client";

/**
 * Reading-highlight paragraph: every word starts grey and lights up white in order as
 * the paragraph scrolls through the viewport, tied to scroll position, so
 * scrolling back dims it again. Used on the big statement lines (case-study
 * problem, about story) where it paces the reading.
 *
 * Words are plain inline spans with real spaces between them, so screen
 * readers and crawlers read normal text. SSR, no-JS and reduced motion render
 * it fully lit. The scroll position comes from the live rect plus an
 * IntersectionObserver, the same as ScrollDecodeText, so pinned sections
 * above it can't throw the math off. Colour is written straight to the DOM,
 * never through React state.
 *
 * Grey-to-white, not faded opacity: the unlit words are still body text and
 * must stay readable. --muted on --bg is about 6:1, above the 4.5:1 minimum,
 * where a 0.18-opacity fade measured 1.6:1.
 */
import { useEffect, useRef } from "react";

export default function ScrubText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    const n = spans.length;
    let lastLit = -1;

    const render = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      /* starts as the top crosses 85% of the viewport, completes as the
         bottom crosses ~55%: the lit edge stays near the reading line */
      const p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      const lit = p * n;
      if (Math.abs(lit - lastLit) < 0.01) return;
      lastLit = lit;
      for (let i = 0; i < n; i++) {
        const t = Math.max(0, Math.min(1, lit - i));
        spans[i].style.color =
          t >= 1
            ? "var(--text)"
            : t <= 0
              ? "var(--muted)"
              : `color-mix(in srgb, var(--text) ${Math.round(t * 100)}%, var(--muted))`;
      }
    };

    let raf = 0;
    let active = false;
    const tick = () => {
      render();
      raf = active ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        active = !!e?.isIntersecting;
        if (active && !raf) raf = requestAnimationFrame(tick);
        if (!active) render();
      },
      { rootMargin: "10% 0px 10% 0px" }
    );
    io.observe(el);
    render();

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      spans.forEach((s) => (s.style.color = ""));
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span data-w className="transition-colors duration-150 ease-out">
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
