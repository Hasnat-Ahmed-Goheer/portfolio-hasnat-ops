"use client";

/**
 * One line of text scaled to exactly fill its container's width. Starts from
 * a vw-based guess (so the server render is close), then measures the real
 * glyph width and corrects the font size, again on resize and once the web
 * font has loaded.
 */
import { useEffect, useRef, type CSSProperties } from "react";

export default function FitText({
  children,
  guess,
  style,
  className,
}: {
  children: string;
  /** initial font size, e.g. "17vw" */
  guess: string;
  style?: CSSProperties;
  className?: string;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;
    const fit = () => {
      text.style.fontSize = guess;
      const avail = wrap.clientWidth;
      const used = text.getBoundingClientRect().width;
      if (used > 0) {
        const px = parseFloat(getComputedStyle(text).fontSize);
        text.style.fontSize = `${(px * avail) / used}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [guess, children]);

  return (
    <span ref={wrapRef} className={`block w-full ${className ?? ""}`}>
      <span ref={textRef} className="inline-block whitespace-nowrap" style={{ fontSize: guess, ...style }}>
        {children}
      </span>
    </span>
  );
}
