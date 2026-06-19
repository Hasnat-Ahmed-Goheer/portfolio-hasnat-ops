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
import ClusterTouchControl from "@/scenes/cluster/ClusterTouchControl";
import HeroTerminal from "@/components/sections/HeroTerminal";

const STATEMENTS = [
  {
    id: "ownership",
    lead: "full-stack ownership",
    rest: "from Helm charts to the pixels on screen.",
    detail: "helm → rancher → fastapi → next.js → pixels",
  },
  {
    id: "infra",
    lead: "cloud-native infrastructure",
    rest: "Kubernetes control planes spanning 15+ environments.",
    detail: "k8s · 15+ environments · one control plane",
  },
  {
    id: "ai",
    lead: "AI that ships",
    rest: "RAG pipelines and vector search in production, not in demos.",
    detail: "gemini · pinecone · rag · sub-200ms p95",
  },
];

const STATS = [
  { value: 2, suffix: "+", label: "years in production" },
  { value: 15, suffix: "+", label: "environments, one control plane" },
  { value: 10, suffix: "+", label: "helm charts authored" },
  { value: 200, prefix: "sub-", suffix: "ms", label: "p95 message latency" },
];

const SUBSYSTEMS = [
  { href: "/work", label: "WORK", desc: "inspect the deployments", sysId: "sys.registry" },
  { href: "/experience", label: "LOG", desc: "replay the event history", sysId: "sys.eventlog" },
  { href: "/contact", label: "UPLINK", desc: "open a connection", sysId: "sys.uplink" },
];

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  /* The resting text is the REAL value (SSR + no-JS + reduced-motion all show
     "2+ years" / "sub-200ms", never the old "0+ years" / "sub-0ms" that read
     as broken data in the fetched DOM — a credibility-killer an Awwwards judge
     spots instantly). The count-up is a pure enhancement: on first scroll-into-
     view we briefly seed 0 and tween up to the real value, then settle exactly.
     Driven by IntersectionObserver, NOT ScrollTrigger — this band sits below a
     pinned scrub whose pin-spacer shifts its Y by 220vh, so a ScrollTrigger
     start computed against stale layout could be missed on refresh; IO fires on
     real intersection regardless of layout math. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const final = `${prefix}${value}${suffix}`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = final;
      return;
    }
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const obj = { v: 0 };
        tween = gsap.to(obj, {
          v: value,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = final;
          },
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [value, prefix, suffix]);
  return <span ref={ref}>{`${prefix}${value}${suffix}`}</span>;
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

  /* pinned system-intro: statements crossfade while the camera pushes in.
     Everything starts visible in the DOM (SSR/reduced-motion safe) and is
     hidden via gsap.set only once the timeline is guaranteed to exist. */
  useGSAP(
    () => {
      const el = introRef.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = el.querySelectorAll<HTMLElement>("[data-statement]");
      const railItems = el.querySelectorAll<HTMLElement>("[data-rail-item]");
      const railFill = el.querySelector<HTMLElement>("[data-rail-fill]");
      const railCount = el.querySelector<HTMLElement>("[data-rail-count]");

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
        const at = i * 1.1;
        const label = item.querySelector("[data-stmt-label]");
        const words = item.querySelectorAll("[data-word]");
        const detail = item.querySelector("[data-stmt-detail]");
        tl.fromTo(
          label,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.3 },
          at
        );
        tl.fromTo(
          words,
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, stagger: 0.045, duration: 0.5 },
          at + 0.06
        );
        tl.fromTo(
          detail,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35 },
          at + 0.42
        );
        if (i < items.length - 1) {
          tl.to(item, { opacity: 0, y: -28, duration: 0.35 }, at + 0.75);
        }
      });

      /* rail follows the playhead — correct in both scroll directions */
      let lastIdx = -1;
      tl.eventCallback("onUpdate", () => {
        const idx = Math.min(items.length - 1, Math.floor(tl.time() / 1.1));
        if (idx === lastIdx) return;
        lastIdx = idx;
        if (railCount) railCount.textContent = String(idx + 1);
        railItems.forEach((r, j) =>
          r.style.setProperty("color", j === idx ? "var(--accent)" : "var(--muted)")
        );
      });
      if (railFill) {
        tl.fromTo(
          railFill,
          { scaleY: 0 },
          { scaleY: 1, ease: "none", duration: tl.duration() },
          0
        );
      }
    },
    { scope: introRef }
  );

  return (
    <>
      {/* touch: long-press-to-grab driver for dragging the cluster (home only,
          coarse pointers) — desktop uses cursor magnetism instead */}
      <ClusterTouchControl />
      {/* beat 2 — hero over the cluster */}
      <section
        ref={heroRef}
        className="scene-passthrough relative flex min-h-[100svh] flex-col justify-end px-5 pb-20"
        aria-label="Intro"
      >
        {/* live system HUD — floats over the hive's upper-right empty space on
            desktop so the landing reads as a running console, not just copy */}
        <div
          data-hero
          className="pointer-events-none absolute right-8 top-32 hidden xl:block"
        >
          <HeroTerminal />
        </div>
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
          {/* shortBio already opens with the role, so don't prepend it again
              (it read "Full Stack Software Engineer — Full Stack Software
              Engineer with 2+ years…"). The role-prefixed form is reserved for
              places that show the bio without the H1 name above it. */}
          <p data-hero className="mt-4 max-w-2xl text-lg text-muted sm:text-xl">
            {profile.shortBio}
          </p>
          <div
            data-hero
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted"
          >
            <span>
              <span className="text-ok">●</span> {profile.availability}
            </span>
            <span>loc: {profile.location}</span>
            {/* interaction affordance — the pulsing dot draws the eye to the
                hint so the magnetism/drag don't go undiscovered (a reviewer
                flagged the cluster interaction as intriguing-but-hidden) */}
            <span className="hidden items-center gap-1.5 text-accent/90 sm:inline-flex">
              <span className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              move to gather · drag a node · ⌘K
            </span>
          </div>
        </div>
      </section>

      {/* beat 3 — pinned system intro: progress rail + scrubbed statements */}
      <section ref={introRef} aria-label="What this system runs">
        <div className="relative flex min-h-screen items-center px-5 py-20 motion-reduce:h-auto">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[210px_1fr]">
            {/* progress rail (decorative; desktop + motion only) */}
            <div
              aria-hidden="true"
              className="hidden flex-col gap-5 self-center md:flex motion-reduce:md:hidden"
            >
              <p className="font-mono text-xs text-muted">
                proc [<span data-rail-count className="text-accent">1</span>/
                {STATEMENTS.length}]
              </p>
              <div className="relative ml-1 h-36 w-px bg-text/10">
                <div
                  data-rail-fill
                  className="absolute inset-0 origin-top scale-y-0 bg-accent"
                />
              </div>
              {STATEMENTS.map((s, i) => (
                <p
                  key={s.id}
                  data-rail-item
                  className="font-mono text-[11px] tracking-wide text-muted transition-colors duration-300"
                  style={i === 0 ? { color: "var(--accent)" } : undefined}
                >
                  0{i + 1} ▸ {s.id}
                </p>
              ))}
            </div>

            {/* statements: stacked + scrubbed normally, flow layout when
                motion is reduced (no overlap) */}
            <div className="relative motion-reduce:space-y-16">
              {STATEMENTS.map((s, i) => (
                <div
                  key={s.id}
                  data-statement
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 motion-reduce:relative motion-reduce:inset-auto motion-reduce:top-auto motion-reduce:translate-y-0"
                >
                  <p data-stmt-label className="font-mono text-xs text-muted">
                    <span className="text-accent">proc/{s.id}</span> · pid{" "}
                    {1024 + i} · running
                  </p>
                  <p className="mt-4 text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
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
                  <p
                    data-stmt-detail
                    className="mt-6 border-l-2 border-accent/40 pl-4 font-mono text-xs text-muted"
                  >
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>
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
                    data-cursor="enter →"
                    className="subsystem-card group block overflow-hidden rounded-lg border hairline bg-elev/50 p-10 transition-colors duration-300 hover:border-accent/40 focus-visible:border-accent/50"
                  >
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full bg-ok status-dot"
                        aria-hidden="true"
                      />
                      <span>{s.sysId}</span>
                    </div>
                    <p className="mt-4 text-4xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent">
                      {s.label}
                    </p>
                    <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
                      {s.desc}
                    </p>
                    <p className="mt-10 font-mono text-xs text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-focus-visible:opacity-100 group-focus-visible:translate-x-1">
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
