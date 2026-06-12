"use client";

/**
 * Augmenting cursor ring (never replaces the native cursor — a11y-safe).
 * Disabled on coarse pointers and under reduced motion.
 */
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/stores/uiStore";

export default function Cursor() {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    let x = -100, y = -100, tx = -100, ty = -100, scale = 1, tScale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;
      tScale = t?.closest("a,button,[data-interactive],input,textarea") ? 1.8 : 1;
    };
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      scale += (tScale - scale) * 0.18;
      el.style.transform = `translate(${x - 14}px, ${y - 14}px) scale(${scale})`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, reducedMotion]);

  if (!enabled || reducedMotion) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] h-7 w-7 rounded-full border border-accent/50 mix-blend-screen"
    />
  );
}
