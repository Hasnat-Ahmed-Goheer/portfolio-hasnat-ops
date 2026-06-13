"use client";

/**
 * Augmenting cursor ring (never replaces the native cursor — a11y-safe).
 * Reads the metaphor from context: a hovered cluster pod → "drag", elements
 * with [data-cursor] → their label (e.g. "inspect →", "$_"). Disabled on
 * coarse pointers and under reduced motion.
 */
import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/stores/uiStore";
import { useSceneStore } from "@/stores/sceneStore";

export default function Cursor() {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return;
    const el = ref.current;
    const lbl = labelRef.current;
    if (!el || !lbl) return;
    let x = -100, y = -100, tx = -100, ty = -100, scale = 1, tScale = 1;
    let domLabel = "";
    let shown = "";
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;
      const cursorEl = t?.closest<HTMLElement>("[data-cursor]");
      domLabel = cursorEl?.dataset.cursor ?? "";
      tScale = t?.closest("a,button,[data-interactive],[data-cursor],input,textarea")
        ? 1.8
        : 1;
    };
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      /* a hovered 3D pod wins: the hive is grabbable */
      const label = useSceneStore.getState().hoverLabel ? "drag" : domLabel;
      const want = label ? 1.8 : tScale;
      scale += (want - scale) * 0.18;
      el.style.transform = `translate(${x - 14}px, ${y - 14}px) scale(${scale})`;
      if (label !== shown) {
        shown = label;
        lbl.textContent = label;
        lbl.style.opacity = label ? "1" : "0";
      }
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
      className="pointer-events-none fixed left-0 top-0 z-[70] flex h-7 w-7 items-center justify-center rounded-full border border-accent/50 mix-blend-screen"
    >
      <span
        ref={labelRef}
        style={{ opacity: 0 }}
        className="absolute left-8 whitespace-nowrap font-mono text-[10px] text-accent transition-opacity duration-150"
      />
    </div>
  );
}
