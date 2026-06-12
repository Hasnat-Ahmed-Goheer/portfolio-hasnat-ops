"use client";

/** Scroll-into-view reveal primitive. Reduced motion ⇒ rendered static. */
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { useUiStore } from "@/stores/uiStore";

interface RevealProps {
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
}

export default function Reveal({
  children,
  y = 28,
  delay = 0,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useUiStore((s) => s.reducedMotion);

  useGSAP(
    () => {
      if (reducedMotion || !ref.current) return;
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration: 1,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reducedMotion] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
