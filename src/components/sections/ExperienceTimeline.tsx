"use client";

/**
 * Experience: the event log. A commit-stream line draws as you scroll;
 * role entries dock in alternating from each side.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { lexicon } from "@/config/console";
import { experience } from "@/content/experience";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

function fmt(ym: string) {
  if (ym === "present") return "HEAD";
  const [y, m] = ym.split("-");
  return `${y}.${m}`;
}

export default function ExperienceTimeline() {
  const lineWrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = lineWrap.current?.querySelector("[data-line]");
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: lineWrap.current,
            start: "top 65%",
            end: "bottom 70%",
            scrub: 0.4,
          },
        }
      );
    },
    { scope: lineWrap }
  );

  return (
    <>
      <section className="scene-passthrough relative flex min-h-[62svh] flex-col justify-end px-5 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4">
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.experience}`}
            />
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            Event log
          </h1>
          <p className="mt-4 font-mono text-xs text-muted">
            {experience.length} entries · 2023 → HEAD · uptime 2+ years
          </p>
        </div>
      </section>

      <section aria-label="Career timeline" className="relative px-5 pb-28">
        <div ref={lineWrap} className="relative mx-auto max-w-4xl">
          {/* the commit stream */}
          <div
            aria-hidden="true"
            className="absolute left-2 top-0 h-full w-px md:left-1/2"
          >
            <div
              data-line
              className="h-full w-px origin-top bg-gradient-to-b from-[var(--accent)] via-[var(--accent3)] to-transparent"
            />
          </div>

          <ol className="space-y-14">
            {experience.map((e, i) => {
              const right = i % 2 === 0;
              return (
                <li key={`${e.company}-${e.start}`} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute left-2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full md:left-1/2 ${
                      e.end === "present" ? "bg-ok status-dot" : "bg-accent/70"
                    }`}
                  />
                  <Reveal
                    className={`ml-8 md:ml-0 md:w-[calc(50%-2.5rem)] ${
                      right ? "md:ml-[calc(50%+2.5rem)]" : ""
                    }`}
                  >
                    <div className="rounded-lg border hairline bg-elev/50 p-6">
                      <p className="font-mono text-xs text-muted">
                        {fmt(e.start)} → {fmt(e.end)}
                        {e.end === "present" && (
                          <span className="ml-2 text-ok">● active</span>
                        )}
                      </p>
                      <p className="mt-2 text-xl font-medium tracking-tight">
                        {e.role}
                      </p>
                      <p className="font-mono text-xs text-accent">
                        {e.company}
                      </p>
                      <p className="mt-3 text-sm text-muted">{e.summary}</p>
                      <ul className="mt-4 space-y-2">
                        {e.highlights.map((h, j) => (
                          <li
                            key={j}
                            className="flex gap-2 text-sm leading-relaxed text-text/85"
                          >
                            <span className="mt-1 shrink-0 font-mono text-[10px] text-accent">
                              ▸
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <Reveal className="ml-8 mt-14 md:ml-0">
            <p className="font-mono text-xs text-muted">
              HEAD → eprecisio/stack8s ·{" "}
              <span className="text-ok">{lexicon.statusHealthy}</span>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
