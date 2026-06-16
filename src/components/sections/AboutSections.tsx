"use client";

/**
 * About storyboard: operator hero → story with log annotations → pinned
 * skills set piece (scrub morphs the latent field into clusters; hovering
 * or focusing a group excites its particles) → values.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/motion";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { skillGroups } from "@/content/skills";
import { experience } from "@/content/experience";
import { useSceneStore } from "@/stores/sceneStore";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

/** scannable impact ledger — numbers a hiring manager skims (from the resume) */
const METRICS = [
  { value: "−60%", label: "auth code, after centralizing token validation" },
  { value: "<200ms", label: "p95 latency at 99.9% uptime" },
  { value: "15+", label: "cloud & on-prem environments self-served" },
  { value: "10+", label: "production Helm charts authored" },
];

const STACK = [
  "Kubernetes", "Helm", "Rancher", "Next.js",
  "NestJS", "FastAPI", "Pinecone", "Stripe",
];

const VALUES = [
  {
    title: "own the whole surface",
    body: "Helm chart to hover state. Systems behave when one person can hold the entire path in their head.",
  },
  {
    title: "measure or it didn't happen",
    body: "−60% auth code. Sub-200ms p95. 15 minutes to deploy. Impact is a number, not an adjective.",
  },
  {
    title: "build for the swap",
    body: "Auth providers change. Metaphors change. Good architecture makes replacement boring.",
  },
];

export default function AboutSections() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const setActiveSkillGroup = useSceneStore((s) => s.setActiveSkillGroup);

  useEffect(
    () => () => {
      const s = useSceneStore.getState();
      s.setProgress(0);
      s.setActiveSkillGroup("");
    },
    []
  );

  /* pinned skills scrub: drives the latent-field morph */
  useGSAP(
    () => {
      const el = skillsRef.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) =>
            useSceneStore.getState().setProgress(self.progress),
        },
      });
    },
    { scope: skillsRef }
  );

  return (
    <>
      {/* beat 1 — operator hero */}
      <section className="scene-passthrough relative flex min-h-[72svh] flex-col justify-end px-5 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4">
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.about}`}
            />
          </p>
          <h1 className="max-w-3xl text-4xl font-medium leading-[1.06] tracking-tight sm:text-6xl">
            The engineer behind the console.
          </h1>
        </div>
      </section>

      {/* beat 1.5 — at a glance: intro + impact ledger + now/stack (fills the
          open space below the hero so the page opens with substance) */}
      <section className="relative px-5 pb-12 pt-2" aria-label="At a glance">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal>
            <p className="max-w-2xl text-lg leading-relaxed text-text/80 sm:text-xl">
              {profile.shortBio}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((m, i) => (
              <Reveal key={m.value} delay={i * 0.06}>
                <div className="h-full rounded-lg border hairline bg-elev/50 p-6">
                  <p className="font-mono text-3xl font-medium text-accent">
                    {m.value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {m.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-col gap-4 font-mono text-xs sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted">
                <span className="text-accent">now:</span> owning the full surface
                at Stack8s
              </p>
              <ul className="flex flex-wrap gap-2">
                {STACK.map((s) => (
                  <li
                    key={s}
                    className="rounded border hairline px-2 py-1 text-text/70"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* beat 2 — story with margin annotations */}
      <section className="relative px-5 py-24" aria-label="Story">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_280px]">
          <div className="space-y-8">
            {profile.longBio.map((p, i) => (
              <Reveal key={i}>
                <p className="max-w-2xl text-lg leading-relaxed text-text/90 sm:text-xl">
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="hidden space-y-6 font-mono text-xs text-muted md:block">
            {[
              "# joined production in 2023",
              "# six teams, every layer",
              `# current: stack8s — full surface`,
              `# ${profile.location}`,
            ].map((a, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <p className="border-l hairline pl-4">{a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* beat 3 — skills set piece (DOM mirror of the particle field) */}
      <section ref={skillsRef} aria-label="Skills map">
        <div className="flex min-h-screen flex-col justify-center px-5 py-16">
          <div className="mx-auto w-full max-w-6xl">
            <p className="sys-label mb-2">latent space · skills index</p>
            <p className="mb-10 font-mono text-xs text-muted">
              scroll to organize the field — hover or focus a cluster to query it
            </p>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {skillGroups.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className="group w-full rounded-lg border hairline bg-elev/40 p-5 text-left transition-colors hover:border-accent/50 focus-visible:border-accent/50"
                    onMouseEnter={() => setActiveSkillGroup(g.id)}
                    onMouseLeave={() => setActiveSkillGroup("")}
                    onFocus={() => setActiveSkillGroup(g.id)}
                    onBlur={() => setActiveSkillGroup("")}
                  >
                    <p className="font-mono text-xs text-accent">
                      cluster/{g.id}
                    </p>
                    <p className="mt-1 text-lg font-medium">{g.label}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {g.skills.join(" · ")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* beat 4 — values */}
      <section className="relative border-t hairline px-5 py-28" aria-label="Values">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-10">operating principles</p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-lg border hairline bg-elev/50 p-8">
                  <p className="font-mono text-xs text-accent">0{i + 1}</p>
                  <p className="mt-3 text-xl font-medium tracking-tight">
                    {v.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* beat 5 — recent eventlog snapshot (links into /experience) */}
      <section className="relative border-t hairline px-5 py-24" aria-label="Recent experience">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <p className="sys-label">recent eventlog</p>
              <Link
                href="/experience"
                className="font-mono text-xs text-accent transition-opacity hover:opacity-70"
              >
                full eventlog →
              </Link>
            </div>
          </Reveal>
          <div className="border-t hairline">
            {experience.slice(0, 4).map((e, i) => (
              <Reveal key={e.company} delay={i * 0.05}>
                <div className="flex flex-col gap-1 border-b hairline py-5 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <p className="font-medium">{e.company}</p>
                    <p className="text-sm text-muted">{e.role}</p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-muted">
                    {e.start.slice(0, 4)} —{" "}
                    {e.end === "present" ? "present" : e.end.slice(0, 4)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* beat 6 — closing uplink CTA so the page ends deliberately */}
      <section className="relative border-t hairline px-5 py-28" aria-label="Get in touch">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <p className="sys-label mb-4">
              {lexicon.sectionPrefix}
              {lexicon.sections.contact}
            </p>
            <h2 className="mx-auto max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
              Ready to deploy something together?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              {profile.availability === "open_to_work"
                ? "Currently open to work — the fastest path is the uplink."
                : "Always open to a good systems conversation."}
            </p>
            <Link
              href="/contact"
              data-cursor="open →"
              className="mt-8 inline-flex items-center gap-2 rounded-lg border hairline bg-elev/60 px-6 py-3 font-mono text-sm text-accent transition-colors hover:border-accent/50"
            >
              open uplink →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
