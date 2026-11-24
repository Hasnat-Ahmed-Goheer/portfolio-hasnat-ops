"use client";

/**
 * Section tracker: a slim index on the right edge listing the current page's
 * sections. The one you're reading is lit, hovering shows every label,
 * and clicking jumps there (through Lenis when smooth scroll is on).
 *
 * It reads the sections from the page itself (each top-level <section> in
 * <main>, named by its aria-label), so every route gets it with no per-page
 * config. Desktop (xl+) only: below that the page content would run under it.
 */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { useUiStore } from "@/stores/uiStore";

interface Entry {
  el: HTMLElement;
  label: string;
}

function collect(): Entry[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>("main section"));
  /* top-level only: skip sections nested inside another section */
  const top = all.filter((s) => !s.parentElement?.closest("main section"));
  return top
    .filter((s) => s.offsetHeight > 0)
    .map((el, i) => ({
      el,
      label: (el.getAttribute("aria-label") ?? (i === 0 ? "intro" : "section")).toLowerCase(),
    }));
}

export default function SectionTracker() {
  const pathname = usePathname();
  const lenis = useLenis();
  const booted = useUiStore((s) => s.booted);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState(0);

  /* re-read the page after each route change, once the new page has mounted
     and the route curtain has lifted */
  useEffect(() => {
    setEntries([]);
    const t = setTimeout(() => setEntries(collect()), 500);
    const onResize = () => setEntries(collect());
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [pathname]);

  useEffect(() => {
    if (entries.length === 0) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let idx = 0;
      entries.forEach((e, i) => {
        if (e.el.getBoundingClientRect().top <= line) idx = i;
      });
      /* at the very bottom, the last section may never reach the line */
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)
        idx = entries.length - 1;
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [entries]);

  if (entries.length < 3) return null;

  const go = (el: HTMLElement) => {
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Page sections"
      className={`group/tracker fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 font-mono text-[11px] transition-opacity duration-500 xl:flex ${
        booted ? "opacity-100" : "opacity-0"
      }`}
    >
      <p className="mb-2 pr-1 tabular-nums text-muted" aria-hidden="true">
        <span className="text-accent">{String(active + 1).padStart(2, "0")}</span>
        /{String(entries.length).padStart(2, "0")}
      </p>
      {entries.map((e, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => go(e.el)}
            aria-current={on ? "true" : undefined}
            className="flex items-center gap-3 py-1 text-muted outline-offset-4 hover:text-text"
          >
            <span
              /* labels show on hover/focus only: at xl widths a resting label
                 would sit over the right edge of the page content */
              className={`translate-x-1 rounded border hairline bg-bg/90 px-1.5 py-0.5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/tracker:translate-x-0 group-hover/tracker:opacity-100 group-focus-within/tracker:translate-x-0 group-focus-within/tracker:opacity-100 ${
                on ? "text-accent" : ""
              }`}
            >
              {e.label}
            </span>
            <span
              aria-hidden="true"
              className={`block h-px transition-all duration-300 ${
                on ? "w-7 bg-accent" : "w-3.5 bg-muted/60"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
