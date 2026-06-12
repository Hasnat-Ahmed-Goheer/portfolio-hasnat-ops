"use client";

/** Route-transition boundary: pages boot in (fade + lift + unblur). */
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion";

export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !ref.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 22, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power2.out" }
      );
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}
