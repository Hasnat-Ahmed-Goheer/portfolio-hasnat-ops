"use client";

/** Cursor-following tooltip for 3D hover targets (cluster nodes). */
import { useEffect, useRef } from "react";
import { useSceneStore } from "@/stores/sceneStore";

export default function HoverTip() {
  const label = useSceneStore((s) => s.hoverLabel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = ref.current;
      if (el)
        el.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  if (!label) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[65] rounded border hairline bg-elev/95 px-2 py-1 font-mono text-[11px] text-accent shadow-lg shadow-black/40"
    >
      {label}
    </div>
  );
}
