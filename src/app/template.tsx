"use client";

/**
 * Route-transition boundary. Opacity-only on purpose: this wrapper is an
 * ancestor of every pinned ScrollTrigger section, and any leftover inline
 * transform/filter here becomes the containing block for position: fixed,
 * silently breaking all pins (CLAUDE.md pitfall #1). clearProps + refresh
 * on complete keep the document pristine for pinning.
 */
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(el, { clearProps: "all" });
            ScrollTrigger.refresh();
          },
        }
      );
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}
