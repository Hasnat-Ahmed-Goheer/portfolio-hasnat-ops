"use client";

/**
 * Magnetic hover: children drift gently toward the cursor and spring back.
 * Fine pointers only; disabled under reduced motion.
 */
import { useEffect, useRef, type ReactNode } from "react";

export default function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, active = false;

    const tick = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate(${x}px, ${y}px)`;
      if (active || Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        el.style.transform = "";
        raf = 0;
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const max = 12;
      tx = Math.max(-max, Math.min(max, (e.clientX - r.left - r.width / 2) * strength));
      ty = Math.max(-max, Math.min(max, (e.clientY - r.top - r.height / 2) * strength));
      active = true;
      start();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      active = false;
      start();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
