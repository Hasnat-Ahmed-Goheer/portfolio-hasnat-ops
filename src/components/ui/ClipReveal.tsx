"use client";

/**
 * Image reveal: the frame opens from a smaller inset window to full size while
 * the image inside settles from a slight zoom, so screenshots "open up" as they
 * arrive instead of fading in. Plays once per element.
 *
 * Uses clip-path and transform only (no layout properties), so it can't cause
 * layout shift. Put data-clip-zoom on the wrapper of the image to zoom. Reduced motion renders it open from the start.
 */
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/motion";

export default function ClipReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      /* zoom a wrapper, not the img itself: the img has its own CSS hover
         transition on transform, which would smear a per-frame tween */
      const img = el.querySelector<HTMLElement>("[data-clip-zoom]");
      const tl = gsap.timeline({
        delay,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        defaults: { duration: 1.2, ease: "expo.out" },
      });
      tl.fromTo(
        el,
        { clipPath: "inset(14% 10% 14% 10% round 14px)", opacity: 0.4 },
        { clipPath: "inset(0% 0% 0% 0% round 8px)", opacity: 1, clearProps: "clipPath" }
      );
      if (img)
        tl.fromTo(img, { scale: 1.18 }, { scale: 1, clearProps: "transform" }, 0);
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
