"use client";

/** Terminal-style scramble→decode reveal for labels. RM ⇒ static text. */
import { useEffect, useState } from "react";

const GLYPHS = "█▓▒░<>/[]{}#$%&*+=";

export default function DecodeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOut(text);
      return;
    }
    let frame = 0;
    let raf = 0;
    const totalFrames = Math.max(18, text.length + 8);
    const tick = () => {
      frame++;
      const reveal = Math.floor((frame / totalFrames) * text.length);
      if (reveal >= text.length) {
        setOut(text);
        return;
      }
      const noiseLen = Math.min(text.length - reveal, 3);
      let noise = "";
      for (let i = 0; i < noiseLen; i++) {
        noise += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(text.slice(0, reveal) + noise);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      {out}
    </span>
  );
}
