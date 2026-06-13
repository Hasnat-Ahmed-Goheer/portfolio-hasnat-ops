"use client";

/**
 * Lab: the sandbox. Experiment cards + the inline terminal — the
 * easter-egg surface. Discovered eggs persist as unlocked badges.
 */
import { lexicon } from "@/config/console";
import { useTerminalStore } from "@/stores/terminalStore";
import Terminal from "@/components/terminal/Terminal";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

const EXPERIMENTS = [
  {
    id: "cluster-physics",
    title: "Cluster physics",
    desc: "The home graph runs live spring dynamics — grab a node and fling it. The terminal operates it for real: scale, evict, drain.",
    hint: "goto home, then: kubectl scale deployment cluster --replicas=200",
  },
  {
    id: "latent-field",
    title: "Latent field",
    desc: "42k instanced particles in a custom GLSL shader. On /about, scroll organizes the noise into skill clusters.",
    hint: "the field behind this page is the same shader, unsupervised",
  },
  {
    id: "pipeline-shader",
    title: "Pipeline streams",
    desc: "Additive dash shader on tube geometry with packets riding the curves. Hover rows on /work to route one.",
    hint: "goto work, hover anything",
  },
  {
    id: "this-terminal",
    title: "This terminal",
    desc: "Simulated POSIX-ish shell with a fake filesystem, history, and tab completion. It admits to 13 commands. It has more.",
    hint: "ls -a is a classic for a reason",
  },
];

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
];

export default function LabSections() {
  const unlocked = useTerminalStore((s) => s.unlocked);
  const found = EGGS.filter((e) => unlocked.includes(e.id)).length;

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
            Sandbox
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Experiments, shader sketches, and the parts of this site that
            exist purely because they were fun to build.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
            <span>
              {EXPERIMENTS.length} experiments ·{" "}
              <span style={{ color: "var(--accent2)" }}>
                {found}/{EGGS.length}
              </span>{" "}
              eggs discovered
            </span>
            <span className="hidden sm:inline">
              the field behind this page is exp/latent-field, unsupervised
            </span>
          </p>
        </div>
      </section>

      <section className="relative px-5 pb-10" aria-label="Experiments">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {EXPERIMENTS.map((x, i) => (
            <Reveal key={x.id} delay={i * 0.07}>
              <div className="group h-full rounded-lg border hairline bg-elev/50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--accent2)]/50 hover:bg-elev/80">
                <div className="flex items-baseline justify-between gap-4">
                  <p
                    className="font-mono text-xs"
                    style={{ color: "var(--accent2)" }}
                  >
                    exp/{x.id}
                  </p>
                  <p className="font-mono text-[10px] text-muted">
                    <span className="text-ok">●</span> live
                  </p>
                </div>
                <p className="mt-2 text-xl font-medium tracking-tight transition-colors group-hover:text-[color:var(--accent2)]">
                  {x.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {x.desc}
                </p>
                <p className="mt-4 border-l-2 border-[color:var(--accent2)]/30 pl-3 font-mono text-[11px] text-muted">
                  {x.hint}
                </p>
              </div>
            </Reveal>
          ))}
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
                const found = unlocked.includes(egg.id);
                return (
                  <span
                    key={egg.id}
                    className={`rounded border px-2.5 py-1 font-mono text-[11px] ${
                      found
                        ? "border-[color:var(--accent2)]/50 text-[color:var(--accent2)]"
                        : "hairline text-muted/60"
                    }`}
                  >
                    {found ? `★ ${egg.label}` : "???"}
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
