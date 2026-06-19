"use client";

/**
 * Work index: the deployment registry. Rows "deploy" on scroll; hovering
 * a row routes a highlighted packet through the pipeline scene.
 */
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { lexicon } from "@/config/console";
import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";
import { useSceneStore } from "@/stores/sceneStore";
import { useConsoleStore } from "@/stores/consoleStore";
import { projectSlugsForSkill } from "@/lib/skillMatch";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

export default function WorkIndex() {
  const setActiveProject = useSceneStore((s) => s.setActiveProject);
  useEffect(() => () => useSceneStore.getState().setActiveProject(-1), []);

  /* skills→projects link: a cluster locked on /about filters this registry */
  const skillFilter = useConsoleStore((s) => s.skillFilter);
  const setSkillFilter = useConsoleStore((s) => s.setSkillFilter);
  const matchSet = useMemo(
    () => (skillFilter ? projectSlugsForSkill(skillFilter) : null),
    [skillFilter]
  );
  const filterLabel = skillGroups.find((g) => g.id === skillFilter)?.label;

  return (
    <>
      <section className="scene-passthrough relative flex min-h-[62svh] flex-col justify-end px-5 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4">
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.work}`}
            />
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            <DecodeText text="Deployments" />
          </h1>
          <p className="mt-4 font-mono text-xs text-muted">
            {projects.length} services registered ·{" "}
            {projects.filter((p) => p.status === "running").length} running ·
            all healthy
          </p>
        </div>
      </section>

      <section aria-label="Project registry" className="relative px-5 pb-24">
        {/* active skills→projects filter (locked from /about) */}
        {matchSet && (
          <div className="mx-auto mb-6 flex max-w-6xl items-center gap-3 font-mono text-xs">
            <span className="text-muted">
              filtered by <span className="text-accent">cluster/{skillFilter}</span>
              {filterLabel ? ` · ${filterLabel}` : ""} ·{" "}
              <span className="text-text/70">{matchSet.size}</span> match
              {matchSet.size === 1 ? "" : "es"}
            </span>
            <button
              type="button"
              onClick={() => setSkillFilter("")}
              className="rounded border hairline px-2 py-0.5 text-muted transition-colors hover:border-accent/40 hover:text-text"
            >
              clear ✕
            </button>
          </div>
        )}
        <div className="mx-auto max-w-6xl border-t hairline">
          {projects.map((p, i) => {
            const dimmed = matchSet ? !matchSet.has(p.slug) : false;
            const matched = matchSet ? matchSet.has(p.slug) : false;
            return (
            <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/work/${p.slug}`}
                data-cursor="inspect →"
                onMouseEnter={() => setActiveProject(i)}
                onMouseLeave={() => setActiveProject(-1)}
                onFocus={() => setActiveProject(i)}
                onBlur={() => setActiveProject(-1)}
                className={`group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b hairline py-7 transition-all hover:bg-elev/40 sm:grid-cols-[3rem_1fr_auto] ${
                  dimmed ? "opacity-35 saturate-50 hover:opacity-100" : ""
                }`}
              >
                <span
                  className={`font-mono text-xs ${matched ? "text-accent" : "text-muted"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-mono text-xs text-muted">
                    {p.slug}
                  </span>
                  <span className="mt-1 block text-2xl font-medium tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                    {p.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted">
                    {p.tagline}
                  </span>
                  <span className="mt-3 flex flex-wrap gap-2">
                    {p.stack.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="rounded border hairline px-2 py-0.5 font-mono text-[10px] text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="hidden items-center gap-2 font-mono text-xs sm:flex">
                  <span
                    className={`status-dot h-2 w-2 rounded-full ${
                      p.status === "running" ? "bg-ok" : "bg-muted"
                    }`}
                  />
                  <span className="text-muted">{p.status}</span>
                  <span className="ml-4 text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    inspect →
                  </span>
                </span>
              </Link>
            </Reveal>
            );
          })}
        </div>
        <Reveal className="mx-auto mt-12 max-w-6xl">
          <p className="font-mono text-xs text-muted">
            tip: ⌘K → <span className="text-accent">open diy-gc-platform</span>
          </p>
        </Reveal>
      </section>
    </>
  );
}
