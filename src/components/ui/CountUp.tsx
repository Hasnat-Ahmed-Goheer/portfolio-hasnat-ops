"use client";

/**
 * Count-up number for stat tiles. Takes the display string ("15+", "<200ms",
 * "−60%", "sub-200ms"), splits out the number, and counts it up from 0 the
 * first time it scrolls into view.
 *
 * The resting text is always the real value: SSR, no-JS and reduced motion
 * all show "15+", never "0+". The count is only an enhancement.
 *
 * IntersectionObserver, not ScrollTrigger: on home these tiles sit below a
 * pinned section whose pin-spacer shifts their position, so a ScrollTrigger
 * start measured against stale layout can be missed. IO fires on the real
 * intersection.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";

const PARTS = /^(\D*?)(\d+(?:\.\d+)?)(.*)$/;

export default function CountUp({
  value,
  className,
  duration = 1.6,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = PARTS.exec(value);
    if (!el || !m) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, prefix, num, suffix] = m;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;

    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const obj = { v: 0 };
        tween = gsap.to(obj, {
          v: target,
          duration,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = value;
          },
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = value;
    };
  }, [value, duration]);

  /* tabular-nums: digits are equal width, so the tile doesn't jitter (or
     shift layout) while the number climbs */
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {value}
    </span>
  );
}
