"use client";

/**
 * Home storyboard (PLAN §D): hero → pinned system-intro scrub (drives the
 * cluster camera via sceneStore.progress) → telemetry counters →
 * subsystem cards.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/motion";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";
import Magnetic from "@/components/ui/Magnetic";

const STATEMENTS = [
  { lead: "full-stack ownership", rest: "from Helm charts to the pixels on screen." },
  { lead: "cloud-native infrastructure", rest: "Kubernetes control planes spanning 15+ environments." },
  { lead: "AI that ships", rest: "RAG pipelines and vector search in production, not in demos." },
];

const STATS = [
  { value: 2, suffix: "+", label: "years in production" },
  { value: 15, suffix: "+", label: "environments, one control plane" },
  { value: 10, suffix: "+", label: "helm charts authored" },
  { value: 200, prefix: "sub-", suffix: "ms", label: "p95 message latency" },
];

const SUBSYSTEMS = [
  { href: "/work", label: "WORK", desc: "inspect the deployments" },
  { href: "/experience", label: "LOG", desc: "replay the event history" },
  { href: "/contact", label: "UPLINK", desc: "open a connection" },
];

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${prefix}${value}${suffix}`;
      return;
    }
    const obj = { v: 0 };
    gsap.to(obj, {
      v: value,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
      },
    });
  }, []);
  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}

export default function HomeSections() {
  const booted = useUiStore((s) => s.booted);
  const heroRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  /* release scene progress when leaving the page */
  useEffect(() => () => useSceneStore.getState().setProgress(0), []);

  /* hero entrance after boot */
  useGSAP(
    () => {
      if (!booted || !heroRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from(heroRef.current.querySelectorAll("[data-hero]"), {
        opacity: 0,
        y: 34,
        stagger: 0.09,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: heroRef, dependencies: [booted] }
  );

  /* pinned system-intro: statements crossfade while the camera pushes in */
  useGSAP(
    () => {
      const el = introRef.current;
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const items = el.querySelectorAll<HTMLElement>("[data-statement]");
      if (reduced) {
        items.forEach((s) => (s.style.opacity = "1"));
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => useSceneStore.getState().setProgress(self.progress),
        },
      });
      items.forEach((item, i) => {
        const words = item.querySelectorAll("[data-word]");
        tl.fromTo(
          words,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, stagger: 0.045, duration: 0.5 },
          i * 1.1
        );
        if (i < items.length - 1) {
          tl.to(item, { opacity: 0, y: -28, duration: 0.35 }, i * 1.1 + 0.75);
        }
      });
    },
    { scope: introRef }
  );

  return (
    <>
      {/* beat 2 — hero over the cluster */}
      <section
        ref={heroRef}
        className="scene-passthrough relative flex min-h-[100svh] flex-col justify-end px-5 pb-20"
        aria-label="Intro"
      >
        <div className="mx-auto w-full max-w-6xl">
          <p data-hero className="sys-label mb-4">
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.home} · status: ${lexicon.statusHealthy}`}
            />
          </p>
          <h1
            data-hero
            className="max-w-4xl text-5xl font-medium leading-[1.04] tracking-tight sm:text-7xl"
          >
            {profile.name}
          </h1>
          <p data-hero className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">
            {profile.role} — {profile.shortBio}
          </p>
          <div
            data-hero
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted"
          >
            <span>
              <span className="text-ok">●</span> {profile.availability}
            </span>
            <span>loc: {profile.location}</span>
            <span className="hidden sm:inline">drag the cluster · press ⌘K</span>
          </div>
        </div>
      </section>

      {/* beat 3 — pinned system intro */}
      <section ref={introRef} aria-label="What this system runs">
        <div className="relative flex h-screen items-center px-5">
          <div className="mx-auto w-full max-w-6xl">
            {STATEMENTS.map((s, i) => (
              <div
                key={i}
                data-statement
                className="absolute inset-x-5 top-1/2 mx-auto max-w-6xl -translate-y-1/2"
              >
                <p className="font-mono text-xs text-muted">
                  proc [{i + 1}/{STATEMENTS.length}]
                </p>
                <p className="mt-3 text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
                  {s.lead.split(" ").map((w, j) => (
                    <span key={j} data-word className="inline-block">
                      <span className="text-accent">{w}</span>&nbsp;
                    </span>
                  ))}
                  {s.rest.split(" ").map((w, j) => (
                    <span key={j} data-word className="inline-block">
                      {w}&nbsp;
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* beat 4 — telemetry */}
      {/* no backdrop-blur here: blurring a region over the always-animating
          canvas re-filters it every frame — near-opaque bg reads the same */}
      <section className="relative border-y hairline bg-bg/85" aria-label="Telemetry">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((s) => (
            <Reveal key={s.label} className="px-5 py-10">
              <p className="font-mono text-3xl text-accent sm:text-4xl">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-2 font-mono text-xs text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* beat 5 — subsystem hand-off */}
      <section className="relative px-5 py-28" aria-label="Subsystems">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="sys-label mb-10">select subsystem ▸</p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {SUBSYSTEMS.map((s, i) => (
              <Reveal key={s.href} delay={i * 0.08}>
                <Magnetic>
                  <Link
                    href={s.href}
                    className="group block rounded-lg border hairline bg-elev/50 p-8 transition-colors hover:border-accent/40"
                  >
                    <p className="text-3xl font-medium tracking-tight group-hover:text-accent">
                      {s.label}
                    </p>
                    <p className="mt-3 font-mono text-xs text-muted">{s.desc}</p>
                    <p className="mt-8 font-mono text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      → enter
                    </p>
                  </Link>
                </Magnetic>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
