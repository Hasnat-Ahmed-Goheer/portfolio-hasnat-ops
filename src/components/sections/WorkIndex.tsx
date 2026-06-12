"use client";

/**
 * Work index: the deployment registry. Rows "deploy" on scroll; hovering
 * a row routes a highlighted packet through the pipeline scene.
 */
import { useEffect } from "react";
import Link from "next/link";
import { lexicon } from "@/config/console";
import { projects } from "@/content/projects";
import { useSceneStore } from "@/stores/sceneStore";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

export default function WorkIndex() {
  const setActiveProject = useSceneStore((s) => s.setActiveProject);
  useEffect(() => () => useSceneStore.getState().setActiveProject(-1), []);

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
            Deployments
          </h1>
          <p className="mt-4 font-mono text-xs text-muted">
            {projects.length} services registered ·{" "}
            {projects.filter((p) => p.status === "running").length} running ·
            all healthy
          </p>
        </div>
      </section>

      <section aria-label="Project registry" className="relative px-5 pb-24">
        <div className="mx-auto max-w-6xl border-t hairline">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/work/${p.slug}`}
                onMouseEnter={() => setActiveProject(i)}
                onMouseLeave={() => setActiveProject(-1)}
                onFocus={() => setActiveProject(i)}
                onBlur={() => setActiveProject(-1)}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 border-b hairline py-7 transition-colors hover:bg-elev/40 sm:grid-cols-[3rem_1fr_auto]"
              >
                <span className="font-mono text-xs text-muted">
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
          ))}
        </div>
        <Reveal className="mx-auto mt-12 max-w-6xl">
          <p className="font-mono text-xs text-muted">
            tip: ⌘K → <span className="text-accent">open rag-assistant</span>
          </p>
        </Reveal>
      </section>
    </>
  );
}
