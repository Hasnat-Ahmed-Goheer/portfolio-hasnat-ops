/**
 * Prototype D, "Dev tool". Near-black with a fine 1px line structure, Geist
 * sans with mono accents, one violet accent. The hero is a working ⌘K command
 * menu over the projects; experience reads as a product changelog; projects
 * are clean screenshot cards. Feels like Linear / Vercel, not a terminal.
 * References: Linear "command line" hero (command menu as the centrepiece),
 * Notion developers changelog (mono dates in a ruled list).
 *   https://mobbin.com/sites/sections/038755ae-4b0f-4e25-a7df-dca35d71d6bc
 *   https://mobbin.com/sites/sections/a85703b4-636f-407a-8b4f-cade72d6f909
 */
import Image from "next/image";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import LocalTime from "@/components/proto/LocalTime";
import CommandBox from "@/components/proto/d-CommandBox";

const ACCENT = "#a194ff";
const MUTED = "text-[#a1a1aa]";
const FAINT = "text-[#8a8a93]";
const LINE = "border-white/10";

const ym = (s: string) => (s === "present" ? "now" : s.replace("-", "."));

export default function ProtoD() {
  const featured = projects.filter((p) => p.media && p.media.length > 0);
  const others = projects.filter((p) => !p.media || p.media.length === 0);

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] font-sans text-[#ededed] antialiased selection:bg-[#a194ff]/30"
      style={{ colorScheme: "dark" }}
    >
      {/* nav */}
      <header className={`sticky top-0 z-40 border-b ${LINE} bg-[#0a0a0b]/80 backdrop-blur-md`}>
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2 text-sm font-medium">
            <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded bg-[#ededed] font-mono text-[10px] font-bold text-[#0a0a0b]">
              H
            </span>
            Hasnat Goheer
          </a>
          <nav className={`hidden gap-6 text-sm sm:flex ${MUTED}`}>
            <a href="#work" className="hover:text-[#ededed]">Work</a>
            <a href="#changelog" className="hover:text-[#ededed]">Changelog</a>
            <a href="#stack" className="hover:text-[#ededed]">Stack</a>
          </nav>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-md bg-[#ededed] px-3 py-1.5 text-sm font-medium text-[#0a0a0b] transition-opacity hover:opacity-85"
          >
            Contact
          </a>
        </div>
      </header>

      <main id="top" className={`mx-auto max-w-[1120px] border-x ${LINE}`}>
        {/* hero */}
        <section
          className={`relative border-b ${LINE} px-5 pb-16 pt-20 sm:px-10`}
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, #000 40%, transparent 100%)",
          }}
        >
          <div className="relative mx-auto max-w-2xl text-center">
            <a
              href="#changelog"
              className={`inline-flex items-center gap-2 rounded-full border ${LINE} bg-[#111113] px-3 py-1 text-xs ${MUTED} hover:text-[#ededed]`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Open to work · Full Stack @ Stack8s
              <span style={{ color: ACCENT }}>→</span>
            </a>
            <h1 className="mt-7 text-[clamp(2.4rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              {profile.name}
            </h1>
            <p className={`mx-auto mt-5 max-w-xl text-[17px] leading-relaxed ${MUTED}`}>
              Full stack engineer. I own systems end to end: Kubernetes and Helm
              underneath, FastAPI and NestJS in the middle, Next.js on top.
            </p>
          </div>
          <div className="relative mx-auto mt-12 max-w-xl">
            <CommandBox
              items={projects.map((p) => ({
                slug: p.slug,
                title: p.title,
                hint: p.stack.slice(0, 2).join(" · "),
                status: p.status,
              }))}
            />
            <p className={`mt-3 text-center font-mono text-[11px] ${FAINT}`}>
              ↑↓ to move · ↵ to open · ⌘K from anywhere
            </p>
          </div>
        </section>

        {/* stats strip */}
        <dl className={`grid grid-cols-2 border-b ${LINE} md:grid-cols-4`}>
          {[
            ["2+", "years in production"],
            ["15+", "environments, one control plane"],
            ["10+", "Helm charts authored"],
            ["<200ms", "p95 realtime latency"],
          ].map(([v, l], i) => (
            <div key={l} className={`px-5 py-7 sm:px-8 ${i % 2 === 0 ? `border-r ${LINE}` : ""} ${i < 2 ? `border-b md:border-b-0 ${LINE}` : ""} ${i === 1 ? `md:border-r ${LINE}` : ""}`}>
              <dt className="text-3xl font-semibold tracking-[-0.03em]">{v}</dt>
              <dd className={`mt-1 text-sm ${FAINT}`}>{l}</dd>
            </div>
          ))}
        </dl>

        {/* work */}
        <section id="work" className={`scroll-mt-14 border-b ${LINE} px-5 py-20 sm:px-10`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: ACCENT }}>Work</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Shipped to production</h2>
            </div>
            <span className={`hidden font-mono text-xs sm:block ${FAINT}`}>{projects.length} projects</span>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {featured.map((p) => (
              <a
                key={p.slug}
                href={`/work/${p.slug}`}
                className={`group overflow-hidden rounded-xl border ${LINE} bg-[#111113] transition-colors hover:border-white/25`}
              >
                <div className={`relative aspect-[16/10] overflow-hidden border-b ${LINE} bg-[#18181b]`}>
                  <Image
                    src={p.media![0].src}
                    alt={p.media![0].alt}
                    fill
                    sizes="(min-width: 1120px) 520px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover object-top opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100 motion-reduce:transition-none"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium tracking-tight">{p.title}</h3>
                    <span className={`shrink-0 font-mono text-[11px] ${p.status === "running" ? "text-emerald-400" : FAINT}`}>
                      {p.status === "running" ? "● live" : "shipped"}
                    </span>
                  </div>
                  <p className={`mt-1.5 text-sm leading-relaxed ${MUTED}`}>{p.tagline}</p>
                  <p className={`mt-4 font-mono text-[11px] ${FAINT}`}>{p.stack.slice(0, 4).join(" · ")}</p>
                </div>
              </a>
            ))}
          </div>
          <ul className={`mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border ${LINE}`}>
            {others.map((p) => (
              <li key={p.slug}>
                <a href={`/work/${p.slug}`} className="group flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-6">
                  <span className="font-medium tracking-tight sm:w-72 sm:shrink-0">{p.title}</span>
                  <span className={`flex-1 text-sm ${MUTED}`}>{p.tagline}</span>
                  <span aria-hidden="true" className={`hidden transition-transform group-hover:translate-x-1 sm:block ${FAINT}`}>→</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* changelog */}
        <section id="changelog" className={`scroll-mt-14 border-b ${LINE} px-5 py-20 sm:px-10`}>
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: ACCENT }}>Changelog</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Career, in releases</h2>
          <ol className="mt-12">
            {experience.map((e, i) => (
              <li key={e.company + e.start} className={`grid gap-4 border-t ${LINE} py-8 md:grid-cols-[180px_1fr]`}>
                <div className="flex items-center gap-3 md:block">
                  <p className={`font-mono text-xs ${FAINT}`}>
                    {ym(e.start)} → {ym(e.end)}
                  </p>
                  <span
                    className={`inline-block rounded-md border px-1.5 py-0.5 font-mono text-[11px] md:mt-2 ${
                      i === 0 ? "border-[#a194ff]/40 text-[#a194ff]" : `${LINE} ${MUTED}`
                    }`}
                  >
                    v{experience.length - i}.0{i === 0 ? " · latest" : ""}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium tracking-tight">
                    {e.role} <span className={MUTED}>at {e.company.replace(" — deployed to Stack8s", " (Stack8s)")}</span>
                  </h3>
                  <p className={`mt-1.5 text-[15px] leading-relaxed ${MUTED}`}>{e.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {e.highlights.slice(0, 2).map((h) => (
                      <li key={h} className="flex gap-3 text-sm leading-relaxed text-[#d4d4d8]">
                        <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: ACCENT }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* stack */}
        <section id="stack" className={`scroll-mt-14 grid border-b ${LINE} sm:grid-cols-2 lg:grid-cols-5`}>
          {skillGroups.map((g, i) => (
            <div key={g.id} className={`border-b ${LINE} p-6 lg:border-b-0 ${i < skillGroups.length - 1 ? `lg:border-r ${LINE}` : ""} ${i % 2 === 0 ? `sm:border-r ${LINE} lg:border-r` : ""}`}>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: ACCENT }}>{g.label}</p>
              <p className={`mt-3 text-sm leading-relaxed ${MUTED}`}>{g.skills.slice(0, 6).join(", ")}</p>
            </div>
          ))}
        </section>

        {/* contact */}
        <section className="px-5 py-24 text-center sm:px-10">
          <h2 className="text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
            Need someone to own the whole system?
          </h2>
          <p className={`mx-auto mt-4 max-w-md ${MUTED}`}>
            Based in {profile.location}, it&rsquo;s <LocalTime /> here. Replies within a day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
            <a href={`mailto:${profile.email}`} className="rounded-md bg-[#ededed] px-4 py-2.5 font-medium text-[#0a0a0b] hover:opacity-85">
              Email me
            </a>
            <a href={profile.resumeUrl} className={`rounded-md border ${LINE} px-4 py-2.5 font-medium hover:bg-white/[0.05]`}>
              Résumé
            </a>
          </div>
        </section>
      </main>

      <footer className={`border-t ${LINE}`}>
        <div className={`mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-6 text-sm ${FAINT}`}>
          <span>© 2026 {profile.name}</span>
          <span className="flex gap-5">
            {profile.socials.map((s) => (
              <a key={s.label} href={s.href} className="hover:text-[#ededed]">{s.label}</a>
            ))}
          </span>
        </div>
      </footer>
    </div>
  );
}
