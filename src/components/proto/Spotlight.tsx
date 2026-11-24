"use client";

/**
 * Wraps a grid of cards; each [data-spot] card gets --mx/--my set to the
 * cursor position inside it, which the card's CSS uses for a soft light that
 * follows the pointer and a border that brightens near it.
 */
import { useRef, type ReactNode } from "react";

export default function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    ref.current?.querySelectorAll<HTMLElement>("[data-spot]").forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={className}>
      {children}
    </div>
  );
}
