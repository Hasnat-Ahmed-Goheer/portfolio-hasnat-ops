"use client";

/**
 * Decrypt lens — a soft circle around the cursor that "re-tunes" the text it
 * passes over: characters under the lens flicker to cipher glyphs and resolve
 * back to the real character a beat after the cursor leaves, so dragging across
 * the block reads like a scanner decrypting the line in real time.
 *
 * Deliberately legible AT REST (the resting state is the real prose, not
 * cipher): this wraps primary content — the hero bio — and a permanently
 * scrambled intro sentence would cost more in credibility than it buys in
 * spectacle. The effect lives entirely in the interaction.
 *
 * Fine pointer + motion only. SSR / no-JS / reduced motion / touch render the
 * plain text. Accessible text is on the wrapper's aria-label; glyph spans are
 * hidden from the a11y tree.
 */
import { useEffect, useRef } from "react";

const GLYPHS = "█▓▒░<>/[]{}#$%&*+=";
const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const RADIUS = 90; // px — lens reach
const HOLD = 220; // ms a touched char stays ciphered after the cursor leaves

export default function DecryptLens({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const chars = Array.from(
      root.querySelectorAll<HTMLElement>("[data-dl-char]")
    );
    if (!chars.length) return;
    const real = chars.map((c) => c.dataset.char ?? "");
    const until = new Array(chars.length).fill(0); // resolveAt timestamp per char

    let centers: { x: number; y: number }[] | null = null;
    let raf = 0;

    const measure = () => {
      const base = root.getBoundingClientRect();
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - base.left,
          y: r.top + r.height / 2 - base.top,
        };
      });
    };

    const tick = () => {
      const now = performance.now();
      let pending = false;
      for (let i = 0; i < chars.length; i++) {
        if (until[i] === 0 || real[i] === " ") continue;
        if (now < until[i]) {
          chars[i].textContent = glyph();
          pending = true;
        } else {
          chars[i].textContent = real[i];
          until[i] = 0;
        }
      }
      raf = pending ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* window listener + bounding gate: the hero block is `.scene-passthrough`
       (pointer-events:none on fine pointers so the canvas stays interactive),
       so the element itself never receives the move — window does. */
    const onMove = (e: PointerEvent) => {
      if (!centers) measure();
      const base = root.getBoundingClientRect();
      if (
        e.clientX < base.left - RADIUS ||
        e.clientX > base.right + RADIUS ||
        e.clientY < base.top - RADIUS ||
        e.clientY > base.bottom + RADIUS
      )
        return;
      const px = e.clientX - base.left;
      const py = e.clientY - base.top;
      const now = performance.now();
      for (let i = 0; i < chars.length; i++) {
        if (real[i] === " " || !centers) continue;
        const dx = px - centers[i].x;
        const dy = py - centers[i].y;
        if (dx * dx + dy * dy < RADIUS * RADIUS) until[i] = now + HOLD;
      }
      start();
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
  }, [text]);

  return (
    /* letters are plain inline spans, so assistive tech and crawlers read
       them as one run of text; no aria-label (ignored on a plain span) */
    <span ref={rootRef} className={className}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-dl-char
          data-char={ch}
          style={ch === " " ? { whiteSpace: "pre-wrap" } : undefined}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
