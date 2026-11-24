/**
 * Prototype H, "Hand-made". The 2026 anti-polish direction: paper grain,
 * handwritten notes in the margins, sketched arrows and circles, sticker
 * tags, and project screenshots pinned up as polaroids. Underneath, the real
 * content is set in a plain sans so a recruiter still gets the facts fast.
 * References: PamPam (stickers scattered around a calm hero)
 * https://mobbin.com/sites/sections/d3a56f6d-f5bb-4d27-9278-c10c0388d8bc
 * Figma / FigJam (handwritten annotations and arrows over real UI)
 * https://mobbin.com/sites/sections/8753aae6-ad9d-44a9-a3a3-5bc0cb204193
 */
import Image from "next/image";
import { Caveat } from "next/font/google";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { Underline, Circle, Arrow, Star } from "@/components/proto/h-scribbles";

const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], display: "swap" });

const PAPER = "#f7f3ea";
const INK = "#1d1b17";
const PENCIL = "#57524a"; // ~7:1 on paper
const BLUE = "#1f4fd1"; // ~6:1 on paper
const RED = "#b52d1a"; // ~5.6:1 on paper
const HIGHLIGHT = "#ffe45c";

/* subtle paper grain: SVG fractal noise as a data URI, no image file */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const CSS = `
.h-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: h-draw 0.9s ease-out forwards; }
@keyframes h-draw { to { stroke-dashoffset: 0; } }
.h-pin { transition: transform .35s cubic-bezier(.2,.8,.2,1.2), box-shadow .35s; }
.h-pin:hover { transform: rotate(0deg) translateY(-6px) scale(1.02) !important; box-shadow: 0 22px 40px -18px rgba(29,27,23,.45); }
@media (prefers-reduced-motion: reduce) {
  .h-draw { animation: none; stroke-dashoffset: 0; }
  .h-pin { transition: none; }
  .h-pin:hover { transform: none !important; }
}
`;

/* one honest fact per sticker, straight from the content */
const STICKERS = [
  { text: "2+ yrs in production", bg: HIGHLIGHT, rot: -4 },
  { text: "15+ environments", bg: "#cfe0ff", rot: 3 },
  { text: "10+ Helm charts", bg: "#ffd7cc", rot: -2 },
  { text: "<200ms p95", bg: "#d8f5d0", rot: 5 },
];

const ROT = [-2.5, 1.8, -1.2, 2.6];

function Tape({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] ${className ?? ""}`}
      style={{ background: "rgba(255,240,180,0.75)", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
    />
  );
}

const yr = (ym: string) => (ym === "present" ? "now" : `${ym.slice(5, 7)}/${ym.slice(2, 4)}`);

export default function ProtoH() {
  const pinned = projects.filter((p) => p.media && p.media.length > 0);
  const notes = projects.filter((p) => !p.media || p.media.length === 0);
  const now = experience[0];

  return (
    <div
      className="relative min-h-screen overflow-x-clip font-sans antialiased"
      style={{ background: PAPER, color: INK, colorScheme: "light", backgroundImage: GRAIN }}
    >
      <style>{CSS}</style>

      {/* header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="#top" className={`${hand.className} text-3xl font-bold`}>hasnat.</a>
        <nav className="hidden gap-7 text-sm font-medium sm:flex" style={{ color: PENCIL }}>
          <a href="#work" className="hover:text-[#1d1b17]">Work</a>
          <a href="#notebook" className="hover:text-[#1d1b17]">Experience</a>
          <a href={profile.resumeUrl} className="hover:text-[#1d1b17]">Résumé</a>
        </nav>
        <a
          href={`mailto:${profile.email}`}
          className="rotate-2 rounded-md border-2 px-3 py-1.5 text-sm font-semibold shadow-[3px_3px_0_#1d1b17] transition-transform hover:rotate-0"
          style={{ borderColor: INK, background: HIGHLIGHT }}
        >
          open to work ✦
        </a>
      </header>

      <main id="top">
        {/* hero */}
        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
          <p className={`${hand.className} flex items-center gap-2 text-2xl`} style={{ color: BLUE }}>
            hi, I&rsquo;m
            <Arrow className="h-8 w-12 translate-y-3" color={BLUE} delay={0.2} />
          </p>
          <h1 className="mt-2 text-[clamp(2.9rem,8.5vw,7rem)] font-bold leading-[0.95] tracking-[-0.035em]">
            Hasnat Ahmed{" "}
            <span className="relative inline-block">
              Goheer
              <Circle className="pointer-events-none absolute -inset-x-[8%] -inset-y-[18%] h-[136%] w-[116%]" delay={0.5} />
            </span>
          </h1>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-start">
            <p className="max-w-2xl text-xl leading-relaxed sm:text-2xl">
              I build software across the whole stack, from{" "}
              <mark className="rounded-sm px-1" style={{ background: HIGHLIGHT, color: INK }}>Kubernetes control planes</mark>{" "}
              to{" "}
              <span className="relative inline-block">
                the React screens customers actually touch
                <Underline className="absolute -bottom-2 left-0 h-3 w-full" delay={0.9} />
              </span>
              .
            </p>

            {/* margin note */}
            <aside className="relative rotate-[-1.5deg] md:mt-2">
              <p className={`${hand.className} text-[1.7rem] leading-tight`} style={{ color: RED }}>
                currently owning everything at <b className="font-bold">Stack8s</b>: Helm charts, auth, the FastAPI backend and the Next.js app
              </p>
              <p className="mt-3 text-sm" style={{ color: PENCIL }}>{now.summary}</p>
            </aside>
          </div>

          {/* stickers */}
          <ul className="mt-14 flex flex-wrap gap-4">
            {STICKERS.map((s) => (
              <li
                key={s.text}
                className="rounded-full border-2 px-4 py-2 text-sm font-semibold shadow-[2px_2px_0_#1d1b17]"
                style={{ background: s.bg, borderColor: INK, transform: `rotate(${s.rot}deg)` }}
              >
                {s.text}
              </li>
            ))}
          </ul>
        </section>

        {/* pinned board */}
        <section id="work" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20 sm:px-8">
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Things I&rsquo;ve shipped</h2>
            <Star className="mb-2 h-8 w-8" delay={0.3} />
          </div>
          <p className={`${hand.className} mt-2 text-2xl`} style={{ color: PENCIL }}>
            (the ones with screenshots got pinned up)
          </p>

          <div className="mt-14 grid gap-14 md:grid-cols-2 md:gap-x-12 md:gap-y-20">
            {pinned.map((p, i) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className={`h-pin relative block bg-white p-3 pb-5 shadow-[0_14px_30px_-16px_rgba(29,27,23,0.4)] ${i % 2 ? "md:mt-16" : ""}`}
                style={{ transform: `rotate(${ROT[i % ROT.length]}deg)` }}
              >
                <Tape />
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                  <Image
                    src={p.media![0].src}
                    alt={p.media![0].alt}
                    fill
                    sizes="(min-width: 768px) 520px, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <p className={`${hand.className} mt-4 text-[1.9rem] font-bold leading-none`}>{p.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: PENCIL }}>{p.tagline}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider" style={{ color: BLUE }}>
                  {p.stack.slice(0, 4).join(" · ")}
                </p>
              </a>
            ))}
          </div>

          {/* index cards for the rest */}
          <div className="mt-20 grid gap-5 sm:grid-cols-3">
            {notes.map((p, i) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className="h-pin block border p-5"
                style={{
                  transform: `rotate(${[1.5, -1, 2][i % 3]}deg)`,
                  borderColor: "rgba(29,27,23,0.15)",
                  background: "#fffdf6 repeating-linear-gradient(transparent 0 27px, rgba(31,79,209,0.14) 27px 28px)",
                }}
              >
                <p className={`${hand.className} text-2xl font-bold leading-none`}>{p.title}</p>
                <p className="mt-3 text-sm leading-[28px]" style={{ color: PENCIL }}>{p.tagline}</p>
              </a>
            ))}
          </div>
        </section>

        {/* notebook */}
        <section id="notebook" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-20 sm:px-8">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Where I&rsquo;ve worked</h2>
          <div
            className="relative mt-10 border shadow-[0_10px_30px_-20px_rgba(29,27,23,0.5)]"
            style={{
              borderColor: "rgba(29,27,23,0.12)",
              background: "#fffdf6 repeating-linear-gradient(transparent 0 39px, rgba(31,79,209,0.13) 39px 40px)",
            }}
          >
            {/* red margin rule */}
            <span aria-hidden="true" className="absolute inset-y-0 left-[5.5rem] w-px sm:left-[8.5rem]" style={{ background: "rgba(181,45,26,0.45)" }} />
            <ol className="py-4">
              {experience.map((e) => (
                <li key={e.company + e.start} className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[8.5rem_1fr]">
                  <span className={`${hand.className} px-3 pt-1 text-xl leading-[40px] sm:px-5 sm:text-2xl`} style={{ color: RED }}>
                    {yr(e.start)}–{yr(e.end)}
                  </span>
                  <div className="px-5 pb-[40px] leading-[40px]">
                    <p className="text-lg font-semibold">
                      {e.company.replace(" — deployed to Stack8s", " → Stack8s")}{" "}
                      <span className="font-normal" style={{ color: PENCIL }}>· {e.role}</span>
                    </p>
                    <p className="text-[15px] leading-[40px]" style={{ color: PENCIL }}>{e.summary}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className={`${hand.className} mt-4 text-right text-2xl`} style={{ color: PENCIL }}>
            + {profile.education.degree}, {profile.education.institution.replace(" University", "")} ({profile.education.period})
          </p>
        </section>

        {/* contact */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-24 sm:px-8">
          <div className="relative">
            <p className={`${hand.className} text-[clamp(3rem,9vw,6.5rem)] font-bold leading-none`}>
              got something to build?
            </p>
            <Arrow className="mt-4 h-16 w-28 rotate-12" color={RED} delay={0.3} />
            <a
              href={`mailto:${profile.email}`}
              className="mt-2 inline-block break-all text-2xl font-semibold underline decoration-2 underline-offset-4 sm:text-4xl"
              style={{ background: `linear-gradient(transparent 55%, ${HIGHLIGHT} 55%)` }}
            >
              {profile.email}
            </a>
          </div>
          <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed pt-6 text-sm" style={{ borderColor: "rgba(29,27,23,0.25)", color: PENCIL }}>
            <span className={`${hand.className} text-xl`}>made by hand in {profile.location.split(",")[0]} ✎</span>
            <span className="flex gap-6 font-medium">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-[#1d1b17]">{s.label}</a>
              ))}
              <a href={profile.resumeUrl} className="hover:text-[#1d1b17]">Résumé</a>
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}
