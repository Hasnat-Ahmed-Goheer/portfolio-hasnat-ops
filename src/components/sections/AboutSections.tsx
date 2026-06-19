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
import { themes } from "@/config/theme";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { useConsoleStore } from "@/stores/consoleStore";
import { clusterAccent } from "@/lib/color";
import { projectsForSkill } from "@/lib/skillMatch";
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
  const progressRef = useRef<HTMLSpanElement>(null);
  /* center-viewport live readouts, written from the scrub (no re-render) */
  const morphBarRef = useRef<HTMLSpanElement>(null);
  const scanBeamRef = useRef<HTMLSpanElement>(null);
  /* which cluster the scroll playhead is currently on; hover restores to it */
  const scanIdx = useRef(0);
  const hovering = useRef(false);
  /* true only while the pinned set piece is on-screen — gates whether the 3D
     field stays "queried" (a cluster tint) or relaxes back to the base hue */
  const inView = useRef(false);
  const setActiveSkillGroup = useSceneStore((s) => s.setActiveSkillGroup);
  const setSkillFilter = useConsoleStore((s) => s.setSkillFilter);
  /* re-renders only when the active cluster changes (~5×), never per-frame —
     the playhead writes via getState(), and progress goes through a ref */
  const activeId = useSceneStore((s) => s.activeSkillGroup);
  const currentId = activeId || skillGroups[0].id;
  const currentIdx = Math.max(
    0,
    skillGroups.findIndex((g) => g.id === currentId)
  );
  const activeGroup = skillGroups[currentIdx];
  /* per-cluster hue band (theme-derived) — matches the 3D field's uActiveColor
     so the rail dot, panel, and excited particle cluster all glow the same tint */
  const theme = useUiStore((s) => s.theme);
  const accentBase = themes[theme].accent3;
  const hueOf = (i: number) => clusterAccent(accentBase, i, skillGroups.length);

  const excite = (id: string) => {
    hovering.current = true;
    setActiveSkillGroup(id);
  };
  const release = () => {
    hovering.current = false;
    /* restore to the scroll playhead's cluster — but only if the set piece is
       still on-screen; off-screen it stays relaxed (no stuck tint) */
    setActiveSkillGroup(inView.current ? skillGroups[scanIdx.current].id : "");
  };

  useEffect(
    () => () => {
      const s = useSceneStore.getState();
      s.setProgress(0);
      s.setActiveSkillGroup("");
    },
    []
  );

  /* pinned skills scan: scroll drives the latent-field morph AND a playhead
     that excites each cluster 1→5 in turn (rail + 3D in sync). No per-group
     opacity timeline — every card is rendered at rest, so a failed trigger
     can't strand content at opacity:0 (CLAUDE.md pitfall #5). */
  useGSAP(
    () => {
      const el = skillsRef.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;

      const n = skillGroups.length;
      /* leaving the set piece (either edge) relaxes the field: clear the active
         tint AND release the morph so the cloud loosens behind the rest of the
         page — otherwise it stays frozen in cluster 5's colour (bad UX). */
      const relax = () => {
        inView.current = false;
        const store = useSceneStore.getState();
        store.setActiveSkillGroup("");
        store.setProgress(0);
      };
      /* re-entering restores the cluster the playhead last rested on; onUpdate
         takes over the morph from here */
      const restore = () => {
        inView.current = true;
        if (!hovering.current)
          useSceneStore.getState().setActiveSkillGroup(skillGroups[scanIdx.current].id);
      };
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 0.5,
          onEnter: restore,
          onEnterBack: restore,
          onLeave: relax,
          onLeaveBack: relax,
          onUpdate: (self) => {
            inView.current = true;
            const store = useSceneStore.getState();
            store.setProgress(self.progress);
            const idx = Math.min(n - 1, Math.floor(self.progress * n));
            if (idx !== scanIdx.current) {
              scanIdx.current = idx;
              if (!hovering.current) store.setActiveSkillGroup(skillGroups[idx].id);
            }
            const pct = Math.round(self.progress * 100);
            if (progressRef.current) {
              progressRef.current.textContent = `scanning ${idx + 1}/${n} · morph ${pct}%`;
            }
            /* live center-viewport instruments — ref writes, never re-render */
            if (morphBarRef.current) morphBarRef.current.style.width = `${pct}%`;
            if (scanBeamRef.current)
              scanBeamRef.current.style.top = `${8 + self.progress * 84}%`;
          },
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
            <DecodeText text="The engineer behind the console." />
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

      {/* beat 3 — skills set piece: latent-space cluster inspector. Left rail =
          the full cluster index (legend); center = passthrough window so the
          live 3D ring is the hero; right = detail readout for the active
          cluster. Scroll scans clusters 1→5; hover/focus overrides. */}
      <section
        ref={skillsRef}
        aria-label="Skills map"
        className="scene-passthrough"
      >
        <div className="flex min-h-screen items-center px-5 py-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-10">
              <p className="sys-label mb-2">latent space · skills index</p>
              <p className="font-mono text-xs text-muted">
                scroll to scan the field — hover a cluster to excite it ·{" "}
                <span ref={progressRef} className="text-accent">
                  scanning 1/{skillGroups.length} · morph 0%
                </span>
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr_minmax(0,360px)]">
              {/* left rail — every cluster, always reachable (no overlap stack) */}
              <ul className="space-y-1">
                {skillGroups.map((g, i) => {
                  const isActive = currentId === g.id;
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        data-interactive
                        aria-pressed={isActive}
                        onMouseEnter={() => excite(g.id)}
                        onMouseLeave={release}
                        onFocus={() => excite(g.id)}
                        onBlur={release}
                        style={
                          isActive
                            ? {
                                borderColor: hueOf(i),
                                backgroundColor: `${hueOf(i)}14`,
                              }
                            : undefined
                        }
                        className={`group flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline-none ${
                          isActive
                            ? ""
                            : "border-transparent hover:border-accent/20"
                        }`}
                      >
                        <span
                          style={{ backgroundColor: hueOf(i), opacity: isActive ? 1 : 0.45 }}
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-opacity ${
                            isActive ? "status-dot" : ""
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-mono text-[0.7rem] text-muted">
                            cluster/{g.id}
                          </span>
                          <span
                            className={`block text-sm font-medium transition-colors ${
                              isActive ? "text-text" : "text-text/70"
                            }`}
                          >
                            {g.label}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[0.7rem] text-muted">
                          {g.skills.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* center — framed console viewport: the live 3D cluster ring
                  shows through, bracketed so it reads as an intentional readout
                  rather than a blank gap. The big index tracks the active
                  cluster (glowing in its hue so it lifts off the field instead
                  of dissolving into it), tying rail → viewport → 3D field. */}
              {(() => {
                const hue = hueOf(currentIdx);
                return (
                  <div
                    className="relative hidden overflow-hidden md:block"
                    aria-hidden="true"
                    style={{ ["--hue" as string]: hue }}
                  >
                    {/* corner brackets pick up the active hue and pulse */}
                    <span
                      style={{ borderColor: hue }}
                      className="status-dot pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t"
                    />
                    <span
                      style={{ borderColor: hue }}
                      className="status-dot pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t"
                    />
                    <span
                      style={{ borderColor: hue }}
                      className="status-dot pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l"
                    />
                    <span
                      style={{ borderColor: hue }}
                      className="status-dot pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r"
                    />
                    {/* scan beam: a faint hue line sweeping top→bottom as the
                        morph advances (position written from the scrub) */}
                    <span
                      ref={scanBeamRef}
                      style={{
                        background: `linear-gradient(90deg, transparent, ${hue}, transparent)`,
                        top: "8%",
                      }}
                      className="pointer-events-none absolute inset-x-6 h-px opacity-40"
                    />
                    <div className="flex h-full min-h-[340px] flex-col items-center justify-center gap-1.5">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.32em] text-muted/60">
                        latent field · inspector
                      </span>
                      <span
                        style={{
                          color: hue,
                          textShadow: `0 0 28px ${hue}, 0 0 64px ${hue}66`,
                        }}
                        className="font-mono text-8xl font-medium leading-none tabular-nums transition-colors duration-500 motion-reduce:transition-none"
                      >
                        {String(currentIdx + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{ color: hue }}
                        className="mt-1 font-mono text-xs uppercase tracking-[0.24em] transition-colors duration-500 motion-reduce:transition-none"
                      >
                        {activeGroup.label}
                      </span>
                      <span className="font-mono text-[0.65rem] tracking-[0.2em] text-muted/40">
                        / {String(skillGroups.length).padStart(2, "0")} clusters
                      </span>
                      {/* morph progress bar — width written from the scrub */}
                      <span className="mt-4 block h-px w-40 overflow-hidden bg-text/10">
                        <span
                          ref={morphBarRef}
                          style={{ background: hue, width: "0%" }}
                          className="block h-full transition-colors duration-500 motion-reduce:transition-none"
                        />
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* right — detail readout for the active cluster (fills the dead
                  column with real content; reads the store, never writes it) */}
              {/* read-only readout; rail buttons own the aria state (aria-pressed),
                  so no aria-live here — a scroll-scanned region would spam SRs */}
              <div
                key={currentId}
                className="skill-panel-in rounded-lg border hairline bg-elev/40 p-6"
              >
                <p className="font-mono text-xs">
                  <span style={{ color: hueOf(currentIdx) }}>
                    cluster/{activeGroup.id}
                  </span>
                  <span className="text-muted">
                    {" · "}
                    {activeGroup.skills.length} tools online
                  </span>
                </p>
                <h3 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
                  <DecodeText text={activeGroup.label} />
                </h3>
                {activeGroup.philosophy && (
                  <p className="mt-3 border-l-2 border-accent/30 pl-3 font-mono text-sm italic text-muted/80">
                    &ldquo;{activeGroup.philosophy}&rdquo;
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeGroup.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded border hairline px-2.5 py-1 font-mono text-xs text-text/75"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {/* link cluster → deployments: lock this skill as a /work filter */}
                {(() => {
                  const n = projectsForSkill(currentId).length;
                  if (n === 0) return null;
                  return (
                    <Link
                      href="/work"
                      data-interactive
                      onClick={() => setSkillFilter(currentId)}
                      style={{ color: hueOf(currentIdx) }}
                      className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs transition-opacity hover:opacity-70"
                    >
                      inspect {n} deployment{n === 1 ? "" : "s"} using this stack →
                    </Link>
                  );
                })()}
              </div>
            </div>
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

      {/* beat 5.5 — education */}
      <section className="relative border-t hairline px-5 py-16" aria-label="Education">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-6">education</p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-lg font-medium">{profile.education.institution}</p>
                <p className="text-sm text-muted">{profile.education.degree} · CGPA: {profile.education.gpa}</p>
              </div>
              <p className="shrink-0 font-mono text-xs text-muted">{profile.education.period}</p>
            </div>
          </Reveal>
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
