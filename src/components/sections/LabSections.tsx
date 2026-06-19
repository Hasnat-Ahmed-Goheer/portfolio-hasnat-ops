"use client";

/**
 * Lab: the sandbox. Real, playable experiments IN PLACE — not a brochure.
 *   - Latent field: live sliders that retune the shader rendering behind the page
 *   - Cluster physics: kubectl buttons routed through the real command bus
 *   - Pod scheduler: a self-contained Canvas2D toy (no WebGL)
 *   - This terminal: the inline shell + easter-egg badge surface
 * Discovered eggs persist as unlocked badges.
 */
import { useEffect } from "react";
import { lexicon } from "@/config/console";
import { useTerminalStore } from "@/stores/terminalStore";
import { useLabStore } from "@/stores/labStore";
import Terminal from "@/components/terminal/Terminal";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";
import LatentControls from "@/components/sections/lab/LatentControls";
import ClusterControls from "@/components/sections/lab/ClusterControls";
import SchedulerToy from "@/components/sections/lab/SchedulerToy";

const EGGS: { id: string; label: string }[] = [
  { id: "dotfiles", label: "ls -a" },
  { id: "secrets", label: ".secrets" },
  { id: "sudo", label: "sudo" },
  { id: "matrix", label: "matrix" },
  { id: "hire", label: "hire" },
  { id: "sl", label: "sl" },
  { id: "top", label: "top" },
  { id: "ping", label: "ping" },
  { id: "neofetch", label: "neofetch" },
  { id: "kubectl", label: "kubectl" },
  { id: "whoami", label: "whoami" },
  { id: "uptime", label: "uptime" },
  { id: "coffee", label: "coffee" },
  { id: "cowsay", label: "cowsay" },
  { id: "vim", label: "vim" },
];

const EXPERIMENT_COUNT = 4;

export default function LabSections() {
  const unlocked = useTerminalStore((s) => s.unlocked);
  const reset = useLabStore((s) => s.reset);
  const found = EGGS.filter((e) => unlocked.includes(e.id)).length;

  /* leave the field as we found it when navigating away — so /about (the same
     shader) and a return visit start from the stock tuning, not the last
     slider position. */
  useEffect(() => () => reset(), [reset]);

  return (
    <>
      <section className="scene-passthrough relative flex min-h-[62svh] flex-col justify-end px-5 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4" style={{ color: "var(--accent2)" }}>
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.lab} · unstable channel`}
            />
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            <DecodeText text="Sandbox" />
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Live experiments you can actually drive. The field behind this page
            is one of them — retune it, schedule pods, operate the cluster.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
            <span>
              {EXPERIMENT_COUNT} experiments ·{" "}
              <span style={{ color: "var(--accent2)" }}>
                {found}/{EGGS.length}
              </span>{" "}
              eggs discovered
            </span>
            <span className="hidden sm:inline">
              the field behind this page is exp/latent-field, unsupervised — and
              now hands-on
            </span>
          </p>
        </div>
      </section>

      <section className="relative px-5 pb-10" aria-label="Experiments">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          <Reveal delay={0}>
            <LatentControls />
          </Reveal>
          <Reveal delay={0.07}>
            <ClusterControls />
          </Reveal>
          <Reveal delay={0.14}>
            <SchedulerToy />
          </Reveal>
          <Reveal delay={0.21}>
            <div className="group h-full rounded-lg border hairline bg-elev/50 p-7">
              <div className="flex items-baseline justify-between gap-4">
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--accent2)" }}
                >
                  exp/pipeline-streams
                </p>
                <p className="font-mono text-[10px] text-muted">
                  <span className="text-ok">●</span> live · on /work
                </p>
              </div>
              <p className="mt-2 text-xl font-medium tracking-tight">
                Pipeline streams
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Additive dash shader on tube geometry with packets riding the
                curves. It lives on the registry — hover any row to route a
                packet down its stream.
              </p>
              <a
                href="/work"
                data-cursor="inspect →"
                className="mt-4 inline-flex items-center gap-2 border-l-2 border-[color:var(--accent2)]/30 pl-3 font-mono text-[11px] text-muted transition-colors hover:text-[color:var(--accent2)]"
              >
                goto {lexicon.sectionPrefix}
                {lexicon.sections.work} · hover anything →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative px-5 py-16" aria-label="Inline terminal">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-2">live shell</p>
            <p className="mb-6 font-mono text-xs text-muted">
              hint: try <span className="text-accent">ls -a</span> — discoveries
              unlock below ({found}/{EGGS.length})
            </p>
          </Reveal>
          <Reveal>
            <div className="flex justify-start">
              <Terminal mode="inline" />
            </div>
          </Reveal>
          <Reveal className="mt-8">
            <div className="flex flex-wrap gap-2" aria-label="Discovered easter eggs">
              {EGGS.map((egg) => {
                const isFound = unlocked.includes(egg.id);
                return (
                  <span
                    key={egg.id}
                    className={`rounded border px-2.5 py-1 font-mono text-[11px] ${
                      isFound
                        ? "border-[color:var(--accent2)]/50 text-[color:var(--accent2)]"
                        : "hairline text-muted/60"
                    }`}
                  >
                    {isFound ? `★ ${egg.label}` : "???"}
                  </span>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
