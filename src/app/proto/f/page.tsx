/**
 * Prototype F, "Soft glass". Light and calm: a slowly drifting pastel mesh
 * behind frosted, very rounded glass cards, a floating glass pill nav and a
 * friendly rounded sans. Dark ink text on near-white glass keeps contrast
 * high however the pastel underneath shifts.
 * References: Air (glass panel over a pastel sky gradient)
 *   https://mobbin.com/sites/sections/23410744-59d9-46b3-8c06-14a32d2bc833
 * Apollo (pastel stat cards that overlap)
 *   https://mobbin.com/sites/sections/7a9f0090-829f-4ac2-bdcc-1dbd515c82ab
 */
import Image from "next/image";
import { Manrope } from "next/font/google";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import LocalTime from "@/components/proto/LocalTime";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

const INK = "#15171f";
const MUTED = "#474c5c"; // ~7:1 on the near-white glass

const CSS = `
.fg-mesh {
  background:
    radial-gradient(40% 50% at 15% 20%, #ffd6e8 0%, transparent 70%),
    radial-gradient(45% 55% at 85% 15%, #cfe3ff 0%, transparent 70%),
    radial-gradient(50% 50% at 70% 80%, #e2d9ff 0%, transparent 70%),
    radial-gradient(40% 45% at 20% 85%, #d4f5ea 0%, transparent 70%),
    #f6f5fb;
  background-size: 140% 140%;
  animation: fg-drift 28s ease-in-out infinite alternate;
}
@keyframes fg-drift {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 40%; }
  100% { background-position: 30% 100%; }
}
@media (prefers-reduced-motion: reduce) { .fg-mesh { animation: none; } }
`;

const glass =
  "rounded-[32px] border border-white/70 bg-white/60 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_50px_-20px_rgba(60,60,110,0.25)] backdrop-blur-2xl";

const STATS: [string, string, string][] = [
  ["15+", "environments, one control plane", "#ffe3ef"],
  ["10+", "production Helm charts", "#e0ecff"],
  ["<200ms", "p95 realtime latency", "#ebe4ff"],
];

const fmt = (ym: string) => {
  if (ym === "present") return "Now";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
};

export default function ProtoF() {
  const featured = projects.filter((p) => p.media && p.media.length > 0);
  const others = projects.filter((p) => !p.media || p.media.length === 0);

  return (
    <div className={`${manrope.className} relative isolate min-h-screen overflow-x-clip antialiased`} style={{ color: INK, colorScheme: "light" }}>
      <style>{CSS}</style>
      <div aria-hidden="true" className="fg-mesh fixed inset-0 -z-10" />

      {/* floating glass pill nav */}
      <header className={`sticky top-4 z-40 mx-auto flex w-[min(100%-2rem,760px)] items-center justify-between !rounded-full py-2 pl-5 pr-2 text-sm ${glass}`}>
        <a href="#top" className="font-bold tracking-tight">Hasnat</a>
        <nav className="hidden gap-6 font-medium sm:flex" style={{ color: MUTED }}>
          <a href="#work" className="hover:text-[#15171f]">Work</a>
          <a href="#journey" className="hover:text-[#15171f]">Journey</a>
          <a href={profile.resumeUrl} className="hover:text-[#15171f]">Résumé</a>
        </nav>
        <a href="#contact" className="rounded-full bg-[#15171f] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-85">
          Say hi
        </a>
      </header>

      <main id="top" className="mx-auto max-w-[1160px] px-4 pb-16 sm:px-6">
        {/* hero */}
        <section className="pt-20 text-center sm:pt-28">
          <span className={`inline-flex items-center gap-2 !rounded-full px-4 py-2 text-sm font-medium ${glass}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Open to new roles · Islamabad · <LocalTime />
          </span>
          <h1 className="mx-auto mt-8 max-w-4xl text-[clamp(2.8rem,7.5vw,6rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
            Hi, I&rsquo;m Hasnat.
            <span className="block bg-gradient-to-r from-[#5b4bdb] via-[#b4458f] to-[#d25a3c] bg-clip-text text-transparent">
              I build whole systems.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: MUTED }}>
            {profile.shortBio}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3 text-[15px] font-semibold">
            <a href="#work" className="rounded-full bg-[#15171f] px-6 py-3 text-white transition-transform hover:-translate-y-0.5">
              See my work
            </a>
            <a href={profile.resumeUrl} className={`!rounded-full px-6 py-3 transition-transform hover:-translate-y-0.5 ${glass}`}>
              Download résumé
            </a>
          </div>

          {/* overlapping pastel stat cards */}
          <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-0">
            {STATS.map(([v, l, tint], i) => (
              <div
                key={v}
                className={`p-7 text-left sm:-mx-2 ${glass} ${i === 1 ? "sm:z-10 sm:-translate-y-6" : ""}`}
                style={{ background: `color-mix(in srgb, ${tint} 70%, transparent)` }}
              >
                <p className="text-5xl font-extrabold tracking-[-0.04em]">{v}</p>
                <p className="mt-6 font-medium" style={{ color: MUTED }}>{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* work */}
        <section id="work" className="mt-32 scroll-mt-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>Selected work</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">Things I&rsquo;ve shipped</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {featured.map((p, i) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className={`group flex flex-col overflow-hidden p-3 transition-transform duration-500 hover:-translate-y-1 ${glass} ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <div className="relative overflow-hidden rounded-[24px] bg-white/50">
                  <Image
                    src={p.media![0].src}
                    alt={p.media![0].alt}
                    width={1280}
                    height={800}
                    sizes={i === 0 ? "(min-width: 1160px) 1120px, 100vw" : "(min-width: 768px) 560px, 100vw"}
                    className={`w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03] ${i === 0 ? "aspect-[16/7]" : "aspect-[16/10]"}`}
                  />
                </div>
                <div className="flex flex-1 items-end justify-between gap-4 px-4 pb-3 pt-5">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{p.title}</h3>
                    <p className="mt-1.5 leading-relaxed" style={{ color: MUTED }}>{p.tagline}</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#15171f] text-white transition-transform duration-300 group-hover:-rotate-45">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <a key={p.slug} href={`/work/${p.slug}`} className={`group p-7 transition-transform duration-500 hover:-translate-y-1 ${glass}`}>
                <h3 className="text-lg font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2 leading-relaxed" style={{ color: MUTED }}>{p.tagline}</p>
                <p className="mt-6 flex flex-wrap gap-2">
                  {p.stack.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* journey: soft vertical timeline */}
        <section id="journey" className="mt-32 scroll-mt-24">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>Journey</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl">Where I&rsquo;ve been</h2>
          </div>
          <ol className="relative mx-auto max-w-3xl space-y-5 pl-8 sm:pl-10">
            <span aria-hidden="true" className="absolute bottom-4 left-[11px] top-4 w-[3px] rounded-full bg-gradient-to-b from-[#a99bff] via-[#f3a6c8] to-[#9fd9c4] sm:left-[15px]" />
            {experience.map((e) => (
              <li key={e.company + e.start} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-8 top-7 h-[25px] w-[25px] rounded-full border-4 border-white shadow-md sm:-left-10 sm:h-[33px] sm:w-[33px] ${e.end === "present" ? "bg-emerald-400" : "bg-[#c9c0ff]"}`}
                />
                <div className={`p-6 sm:p-7 ${glass}`}>
                  <p className="text-sm font-semibold" style={{ color: MUTED }}>
                    {fmt(e.start)} – {fmt(e.end)}
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight">{e.company.replace(" — deployed to Stack8s", " · Stack8s")}</h3>
                  <p className="font-medium" style={{ color: MUTED }}>{e.role}</p>
                  <p className="mt-3 leading-relaxed">{e.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* contact glass panel */}
        <section id="contact" className={`mt-32 scroll-mt-24 px-6 py-16 text-center sm:px-16 sm:py-20 ${glass}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>Contact</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
            Have something that needs building?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: MUTED }}>
            I&rsquo;m open to full stack and platform roles. The fastest way to reach me is email.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-9 inline-block max-w-full break-all rounded-full bg-[#15171f] px-7 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 sm:text-lg"
          >
            {profile.email}
          </a>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            {profile.socials.filter((s) => s.label !== "Email").map((s) => (
              <a key={s.label} href={s.href} className="rounded-full border border-white/80 bg-white/70 px-5 py-2.5 hover:bg-white">
                {s.label} ↗
              </a>
            ))}
            <a href={profile.resumeUrl} className="rounded-full border border-white/80 bg-white/70 px-5 py-2.5 hover:bg-white">
              Résumé ↗
            </a>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap justify-between gap-3 px-2 text-sm font-medium" style={{ color: MUTED }}>
          <span>© 2026 {profile.name}</span>
          <span>{profile.role} · {profile.location}</span>
        </footer>
      </main>
    </div>
  );
}
