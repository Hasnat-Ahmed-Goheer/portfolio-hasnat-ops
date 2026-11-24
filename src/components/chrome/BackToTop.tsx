"use client";

/**
 * Back-to-top button with a progress ring: the ring fills as you read down the
 * page, so it doubles as a "how far am I" gauge. Appears once you're about a
 * screen down. Bottom-right on desktop; on phones it sits above the terminal
 * launcher.
 */
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";

const R = 19;
const C = 2 * Math.PI * R;

export default function BackToTop() {
  const lenis = useLenis();
  const ringRef = useRef<SVGCircleElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ringRef.current?.setAttribute("stroke-dashoffset", String(C * (1 - p)));
      setShown(window.scrollY > window.innerHeight * 0.9);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
    /* move focus somewhere sensible for keyboard users */
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown || undefined}
      data-cursor="top ↑"
      className={`group fixed bottom-[5.25rem] right-[22px] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-elev/90 font-mono text-sm text-accent shadow-lg shadow-black/40 backdrop-blur transition-all duration-300 md:bottom-5 md:right-5 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <circle cx="22" cy="22" r={R} fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <circle
          ref={ringRef}
          cx="22"
          cy="22"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <span className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
        ↑
      </span>
    </button>
  );
}
