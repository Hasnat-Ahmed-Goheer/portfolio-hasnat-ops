/**
 * Prototype E, "Swiss grid". International Typographic Style: near-white
 * paper, a strict 12-column grid with its column lines drawn, black grotesque
 * type set flush-left ragged-right, one signal red, big numerals, and the work
 * and experience as precise data tables. Nothing floats: every block snaps to
 * the grid. The only motion is a row highlight on hover.
 * References: Sana (stat cells divided by drawn grid lines)
 *   https://mobbin.com/sites/sections/6ab74ca3-c6b1-4b6c-b10b-a7ee6050158c
 * Spade (tiny mono labels over very large numerals)
 *   https://mobbin.com/sites/sections/34a2151f-c9b2-4121-b790-8e85202fe9ca
 */
import { Inter_Tight } from "next/font/google";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import LocalTime from "@/components/proto/LocalTime";

const grotesk = Inter_Tight({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

const PAPER = "#fafaf8";
const INK = "#0a0a0a";
const MUTED = "#5c5c5c"; // 6.4:1 on paper
const RED = "#e10600"; // 4.9:1 on paper
const LINE = "rgba(10,10,10,0.12)";

/* the one number per project worth stating (all from the case studies) */
const FIGURE: Record<string, string> = {
  "stack8s-marketplace": "10+ charts",
  "stack8s-workload-platform": "15+ envs",
  "diy-gc-platform": "300+ payouts/mo",
  "swapfans-ai": "10k+ MAU",
  techvaganza: "99.9% uptime",
  "aris-rails": "10k pts/min",
  "intellogeek-lms": "45% faster",
};

const STATS: [string, string][] = [
  ["15+", "Cloud and on-prem environments self-served from one control plane"],
  ["10+", "Production Helm charts authored from scratch"],
  ["<200", "Milliseconds p95 on realtime messaging, 99.9% uptime"],
  ["−60%", "Auth code after centralising token validation"],
];

const ym = (s: string) => (s === "present" ? "Now" : s.replace("-", "."));

/** the drawn 12-column grid behind every section */
function Columns() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 mx-auto grid max-w-[1320px] grid-cols-4 gap-x-5 px-5 md:grid-cols-12 md:px-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={`border-x ${i >= 4 ? "hidden md:block" : ""}`} style={{ borderColor: LINE }} />
      ))}
    </div>
  );
}

const wrap = "relative mx-auto grid max-w-[1320px] grid-cols-4 gap-x-5 px-5 md:grid-cols-12 md:px-8";
const label = "font-mono text-[11px] uppercase tracking-[0.14em]";

export default function ProtoE() {
  const toolCount = skillGroups.reduce((n, g) => n + g.skills.length, 0);
  return (
    <div
      className={`${grotesk.variable} relative min-h-screen font-[family-name:var(--font-grotesk)] antialiased selection:bg-[#e10600] selection:text-white`}
      style={{ background: PAPER, color: INK, colorScheme: "light" }}
    >
      <Columns />

      {/* header: four fields on the grid */}
      <header className={`${wrap} border-b py-4 text-[13px]`} style={{ borderColor: INK }}>
        <a href="#top" className="col-span-2 font-semibold md:col-span-3">Hasnat Ahmed Goheer</a>
        <span className="hidden md:col-span-3 md:block" style={{ color: MUTED }}>Full Stack Software Engineer</span>
        <nav className="hidden gap-5 md:col-span-3 md:flex">
          <a href="#work" className="hover:text-[#e10600]">Work</a>
          <a href="#experience" className="hover:text-[#e10600]">Experience</a>
          <a href="#contact" className="hover:text-[#e10600]">Contact</a>
        </nav>
        <span className="col-span-2 text-right md:col-span-3">
          Islamabad <LocalTime />
        </span>
      </header>

      <main id="top">
        {/* hero */}
        <section className={`${wrap} pb-16 pt-14 md:pt-24`}>
          <p className={`${label} col-span-4 mb-10 md:col-span-12`} style={{ color: RED }}>
            ■ Index 2026 — Portfolio
          </p>
          <h1 className="col-span-4 text-[clamp(3.4rem,10.4vw,10.5rem)] font-semibold leading-[0.88] tracking-[-0.055em] md:col-span-11">
            Systems, owned
            <br />
            end to end<span style={{ color: RED }}>.</span>
          </h1>
          <p className="col-span-4 mt-12 text-xl leading-snug md:col-span-5 md:col-start-1 md:text-2xl">
            {profile.shortBio}
          </p>
          <div className="col-span-4 mt-12 space-y-3 text-[15px] md:col-span-3 md:col-start-7" style={{ color: MUTED }}>
            <p className={label} style={{ color: INK }}>Now</p>
            <p>Owning the full engineering surface at Stack8s: Helm, Rancher, auth, Next.js + FastAPI.</p>
          </div>
          <div className="col-span-4 mt-12 space-y-3 text-[15px] md:col-span-3" style={{ color: MUTED }}>
            <p className={label} style={{ color: INK }}>Status</p>
            <p>
              <span style={{ color: RED }}>●</span> Open to work. {profile.location}.
            </p>
            <p className="flex gap-4 pt-1" style={{ color: INK }}>
              <a href={`mailto:${profile.email}`} className="underline decoration-1 underline-offset-4 hover:text-[#e10600]">Email</a>
              <a href={profile.resumeUrl} className="underline decoration-1 underline-offset-4 hover:text-[#e10600]">Résumé</a>
            </p>
          </div>
        </section>

        {/* figures */}
        <section aria-label="Figures" className="relative border-y" style={{ borderColor: INK }}>
          <dl className={`${wrap}`}>
            {STATS.map(([n, l], i) => (
              <div key={n} className={`col-span-2 py-8 md:col-span-3 ${i > 1 ? "border-t md:border-t-0" : ""}`} style={{ borderColor: LINE }}>
                <dt className={label} style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</dt>
                <dd className="mt-6 text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.05em] tabular-nums">{n}</dd>
                <dd className="mt-4 max-w-[16rem] text-sm leading-snug" style={{ color: MUTED }}>{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* work table */}
        <section id="work" className="relative scroll-mt-4 pb-8 pt-24">
          <div className={wrap}>
            <h2 className="col-span-4 text-5xl font-semibold tracking-[-0.045em] md:col-span-6 md:text-7xl">Work</h2>
            <p className={`${label} col-span-4 mt-4 self-end md:col-span-3 md:col-start-10 md:mt-0 md:text-right`} style={{ color: MUTED }}>
              {projects.length} entries · {projects.filter((p) => p.status === "running").length} in production
            </p>
            {/* column heads (desktop) */}
            <div className={`${label} col-span-12 mt-10 hidden grid-cols-12 gap-x-5 border-b pb-3 md:grid`} style={{ borderColor: INK, color: MUTED }}>
              <span className="col-span-1">No.</span>
              <span className="col-span-4">Project</span>
              <span className="col-span-3">Stack</span>
              <span className="col-span-2">Figure</span>
              <span className="col-span-2 text-right">Status</span>
            </div>
            <ol className="col-span-4 mt-8 border-t md:col-span-12 md:mt-0 md:border-t-0" style={{ borderColor: INK }}>
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <a
                    href={`/work/${p.slug}`}
                    className="group grid grid-cols-4 gap-x-5 border-b py-5 transition-colors duration-150 hover:bg-[#0a0a0a] hover:text-[#fafaf8] motion-reduce:transition-none md:grid-cols-12"
                    style={{ borderColor: LINE }}
                  >
                    <span className="col-span-1 font-mono text-sm tabular-nums group-hover:text-[#ff6b5e]" style={{ color: RED }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="col-span-3 md:col-span-4">
                      <span className="block text-xl font-semibold tracking-[-0.02em] md:text-2xl">{p.title}</span>
                      <span className="mt-1 block text-sm opacity-75">{p.tagline}</span>
                    </span>
                    <span className="col-span-3 col-start-2 mt-3 font-mono text-xs leading-relaxed opacity-75 md:col-span-3 md:col-start-auto md:mt-1">
                      {p.stack.slice(0, 4).join(" / ")}
                    </span>
                    <span className="col-span-2 col-start-2 mt-2 text-sm font-semibold tabular-nums md:col-span-2 md:col-start-auto md:mt-1">
                      {FIGURE[p.slug]}
                    </span>
                    <span className={`${label} col-span-1 mt-2 text-right md:col-span-2 md:mt-1.5`}>
                      {p.status === "running" ? "● Live" : "Shipped"} <span className="inline-block transition-transform duration-150 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* experience table */}
        <section id="experience" className="relative scroll-mt-4 py-24">
          <div className={wrap}>
            <h2 className="col-span-4 text-5xl font-semibold tracking-[-0.045em] md:col-span-3 md:text-7xl">Record</h2>
            <ol className="col-span-4 mt-10 border-t md:col-span-9 md:mt-3" style={{ borderColor: INK }}>
              {experience.map((e) => (
                <li key={e.company + e.start} className="grid grid-cols-4 gap-x-5 border-b py-5 md:grid-cols-9" style={{ borderColor: LINE }}>
                  <span className="col-span-4 font-mono text-xs tabular-nums md:col-span-2 md:mt-1" style={{ color: MUTED }}>
                    {ym(e.start)}–{ym(e.end)}
                  </span>
                  <span className="col-span-4 mt-1 text-lg font-semibold tracking-[-0.015em] md:col-span-3 md:mt-0">
                    {e.company.replace(" — deployed to Stack8s", "")}
                    {e.end === "present" && <span className="ml-2 align-middle text-xs font-normal" style={{ color: RED }}>● current</span>}
                  </span>
                  <span className="col-span-4 text-[15px] md:col-span-4" style={{ color: MUTED }}>
                    <span style={{ color: INK }}>{e.role}.</span> {e.summary}
                  </span>
                </li>
              ))}
            </ol>
            <p className={`${label} col-span-4 mt-6 md:col-span-9 md:col-start-4`} style={{ color: MUTED }}>
              {profile.education.degree}, {profile.education.institution} ({profile.education.period}) · {toolCount} tools across {skillGroups.length} disciplines
            </p>
          </div>
        </section>

        {/* contact block */}
        <section id="contact" className="relative" style={{ background: RED, color: "#fff" }}>
          <div className={`${wrap} py-20 md:py-28`}>
            <p className={`${label} col-span-4 md:col-span-3`}>■ Contact</p>
            <div className="col-span-4 mt-8 md:col-span-9 md:mt-0">
              <p className="text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                Have a system that needs an owner?
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="mt-10 inline-block break-all border-b-2 border-white pb-1 text-xl font-medium transition-opacity hover:opacity-80 md:text-3xl"
              >
                {profile.email} →
              </a>
            </div>
          </div>
          <footer className={`${wrap} border-t py-5 text-[13px]`} style={{ borderColor: "rgba(255,255,255,0.4)" }}>
            <span className="col-span-4 md:col-span-6">© 2026 {profile.name}</span>
            <span className="col-span-4 mt-2 flex gap-5 md:col-span-6 md:mt-0 md:justify-end">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:underline">{s.label}</a>
              ))}
              <a href={profile.resumeUrl} className="hover:underline">Résumé</a>
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}
