"use client";

/**
 * About storyboard: operator hero → story with log annotations → pinned
 * skills set piece (scrub morphs the latent field into clusters; hovering
 * or focusing a group excites its particles) → values.
 */
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { skillGroups } from "@/content/skills";
import { useSceneStore } from "@/stores/sceneStore";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";

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
    </>
  );
}
