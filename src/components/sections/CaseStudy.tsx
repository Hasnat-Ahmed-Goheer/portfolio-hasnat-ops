"use client";

/**
 * Deployment inspector (case study). Sets the per-project motif on the
 * shared deployment scene, then walks problem → architecture → outcome
 * as log-styled reveals.
 */
import { useEffect } from "react";
import Link from "next/link";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";
import { useSceneStore } from "@/stores/sceneStore";
import Reveal from "@/components/ui/Reveal";

export default function CaseStudy({ project }: { project: Project }) {
  const setMotif = useSceneStore((s) => s.setMotif);

  useEffect(() => {
    setMotif(project.motif, project.accent ?? "#22d3ee");
  }, [project, setMotif]);

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  const meta: [string, string][] = [
    ["service", project.slug],
    ["status", project.status],
    ["role", project.role],
    ["stack", project.stack.join(" · ")],
  ];

  return (
    <article>
      {/* beat 1 — inspector header over the motif scene */}
      <section className="scene-passthrough relative flex min-h-[92svh] flex-col justify-end px-5 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4">SYS://REGISTRY/{project.slug}</p>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{project.tagline}</p>
          <dl className="mt-10 grid max-w-3xl grid-cols-1 gap-x-10 gap-y-3 border-t hairline pt-6 font-mono text-xs sm:grid-cols-2">
            {meta.map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-3" data-interactive>
                <dt className="w-14 shrink-0 text-muted">{k}:</dt>
                <dd className={k === "status" ? "text-ok" : "text-text/85"}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          {(project.links.repo || project.links.live) && (
            <div className="mt-6 flex gap-4 font-mono text-xs">
              {project.links.repo && (
                <a
                  className="text-accent hover:underline"
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  repo ↗
                </a>
              )}
              {project.links.live && (
                <a
                  className="text-accent hover:underline"
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  live ↗
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* beat 2 — problem */}
      <section className="relative border-t hairline px-5 py-24" aria-label="Problem">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-6">problem</p>
            <p className="max-w-3xl text-2xl font-medium leading-snug tracking-tight sm:text-4xl">
              {project.problem}
            </p>
          </Reveal>
        </div>
      </section>

      {/* beat 3 — architecture as build log */}
      <section className="relative px-5 py-10" aria-label="Architecture">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-8">architecture · build log</p>
          </Reveal>
          <div className="max-w-3xl space-y-5">
            {project.architecture.map((a, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex items-baseline gap-4 border-l-2 border-accent/30 pl-5">
                  <span className="shrink-0 font-mono text-sm text-muted">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <p className="text-base leading-relaxed text-text/90">{a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* beat 4 — visuals as console windows */}
      {project.media && project.media.length > 0 && (
        <section className="relative px-5 py-24" aria-label="Visuals">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="sys-label mb-8">attached media</p>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              {project.media.map((m, i) => (
                <Reveal key={m.src + i} delay={i * 0.08}>
                  <figure className="group overflow-hidden rounded-lg border hairline bg-elev/60 transition-colors hover:border-accent/40">
                    <figcaption className="flex items-center gap-2 border-b hairline px-4 py-2.5 font-mono text-[11px] text-muted">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2 w-2 rounded-full bg-danger/70" />
                        <span className="h-2 w-2 rounded-full bg-accent2/70" />
                        <span className="h-2 w-2 rounded-full bg-ok/70" />
                      </span>
                      <span className="truncate">{m.caption}</span>
                    </figcaption>
                    {/* real product captures at varied native ratios — pin a
                        uniform 16:10 window and cover-crop so the grid stays
                        tidy and nothing distorts */}
                    <img
                      src={m.src}
                      alt={m.alt}
                      width={1280}
                      height={800}
                      loading="lazy"
                      className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* beat 5 — outcome */}
      <section className="relative px-5 py-24" aria-label="Outcome">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-8">outcome</p>
          </Reveal>
          <div className="max-w-3xl space-y-4">
            {project.outcomes.map((o, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="flex items-baseline gap-3 font-mono text-sm">
                  <span className="shrink-0 text-ok">[ ok ]</span>
                  <span className="text-text/90">{o}</span>
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* beat 6 — next deployment */}
      <section className="relative border-t hairline px-5 py-20" aria-label="Next project">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Link
              href={`/work/${next.slug}`}
              className="group block rounded-lg border hairline bg-elev/50 p-8 transition-colors hover:border-accent/40"
            >
              <p className="font-mono text-xs text-muted">next deployment ▸</p>
              <p className="mt-3 text-3xl font-medium tracking-tight group-hover:text-accent">
                {next.title}
              </p>
              <p className="mt-2 text-sm text-muted">{next.tagline}</p>
            </Link>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
