/**
 * Prototype A, "Editorial". Warm paper, a heavy sans name set against a thin
 * serif, mixed type scale, and a text index of work with a cursor-following
 * screenshot. Calm and confident: the content carries it, not effects.
 * References: Freshman (sans over serif name), Locomotive (text index).
 */
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import LocalTime from "@/components/proto/LocalTime";
import HoverPreview from "@/components/proto/HoverPreview";

const C = {
  paper: "#f2efe8",
  ink: "#141412",
  muted: "#5f5b54",
  line: "rgba(20,20,18,0.14)",
  accent: "#c2391f",
};

const yr = (ym: string) => (ym === "present" ? "Now" : ym.slice(0, 4));

const STATS = [
  ["15+", "environments provisioned from one control plane"],
  ["10+", "production Helm charts, written from scratch"],
  ["<200ms", "p95 latency on realtime messaging at 99.9% uptime"],
];

export default function ProtoA() {
  const [first, ...rest] = profile.name.split(" ");
  return (
    <div
      className="min-h-screen font-sans antialiased selection:bg-[#c2391f] selection:text-white"
      style={{ background: C.paper, color: C.ink, colorScheme: "light" }}
    >
      {/* header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ borderColor: C.line, background: "rgba(242,239,232,0.82)" }}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 text-[13px] sm:px-8">
          <a href="#top" className="font-medium tracking-tight">
            Hasnat Goheer
          </a>
          <nav className="hidden gap-7 sm:flex" style={{ color: C.muted }}>
            {["Work", "About", "Experience", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="transition-colors hover:text-[#141412]">
                {l}
              </a>
            ))}
          </nav>
          <span className="flex items-center gap-2" style={{ color: C.muted }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Open to work · <LocalTime />
          </span>
        </div>
      </header>

      <main id="top">
        {/* hero */}
        <section className="mx-auto max-w-[1400px] px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <p className="mb-8 font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            {profile.role} — {profile.location}
          </p>
          <h1 className="leading-[0.86] tracking-[-0.045em]">
            <span className="block text-[clamp(3.6rem,13vw,12.5rem)] font-semibold">{first}</span>
            <span className="block font-[family-name:var(--font-serif)] text-[clamp(3.6rem,13vw,12.5rem)] font-normal italic tracking-[-0.02em]">
              {rest.join(" ")}
            </span>
          </h1>
          <div className="mt-14 grid gap-10 border-t pt-8 md:grid-cols-12" style={{ borderColor: C.line }}>
            <p className="font-[family-name:var(--font-serif)] text-3xl leading-[1.15] md:col-span-7 md:text-[2.6rem]">
              I build software across the whole stack: from{" "}
              <em style={{ color: C.accent }}>Kubernetes control planes</em> to the
              React surfaces customers actually touch.
            </p>
            <div className="space-y-5 text-[15px] leading-relaxed md:col-span-4 md:col-start-9" style={{ color: C.muted }}>
              <p>{profile.shortBio}</p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm">
                <a href={`mailto:${profile.email}`} className="rounded-full px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-85" style={{ background: C.ink }}>
                  Get in touch
                </a>
                <a href={profile.resumeUrl} className="rounded-full border px-5 py-2.5 font-medium transition-colors hover:bg-[#141412] hover:text-white" style={{ borderColor: C.ink, color: C.ink }}>
                  Résumé ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* work index */}
        <section id="work" className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-[family-name:var(--font-serif)] text-5xl tracking-tight sm:text-6xl">Selected work</h2>
            <span className="font-mono text-xs" style={{ color: C.muted }}>
              ({String(projects.length).padStart(2, "0")})
            </span>
          </div>
          <div className="border-t" style={{ borderColor: C.line }}>
            <HoverPreview
              rowClassName="group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b py-6 transition-opacity duration-300 data-[dim]:opacity-35 sm:grid-cols-[3rem_1.3fr_1fr_auto] border-[rgba(20,20,18,0.14)]"
              rows={projects.map((p, i) => ({
                key: p.slug,
                href: `/work/${p.slug}`,
                image: p.media?.[0]?.src,
                content: (
                  <>
                    <span className="font-mono text-xs" style={{ color: C.muted }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-2xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-2 sm:text-[2rem]">
                      {p.title}
                    </span>
                    <span className="col-start-2 mt-1 text-sm sm:col-start-auto sm:mt-0" style={{ color: C.muted }}>
                      {p.tagline}
                    </span>
                    <span className="hidden font-mono text-xs sm:block" style={{ color: C.muted }}>
                      {p.stack.slice(0, 2).join(" / ")}
                    </span>
                  </>
                ),
              }))}
            />
          </div>
        </section>

        {/* about */}
        <section id="about" className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] md:col-span-3" style={{ color: C.muted }}>
              About
            </h2>
            <div className="space-y-6 text-xl leading-relaxed md:col-span-8">
              {profile.longBio.map((p, i) => (
                <p key={i} className={i === 0 ? "" : ""} style={i === 0 ? undefined : { color: C.muted }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
          <dl className="mt-20 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
            {STATS.map(([v, l]) => (
              <div key={v} className="p-8" style={{ background: C.paper }}>
                <dt className="font-[family-name:var(--font-serif)] text-6xl tracking-tight">{v}</dt>
                <dd className="mt-3 text-sm" style={{ color: C.muted }}>{l}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* experience */}
        <section id="experience" className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <div className="grid gap-12 md:grid-cols-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] md:col-span-3" style={{ color: C.muted }}>
              Experience
            </h2>
            <ol className="border-t md:col-span-9" style={{ borderColor: C.line }}>
              {experience.map((e) => (
                <li key={e.company + e.start} className="grid gap-2 border-b py-6 sm:grid-cols-[7rem_1fr_1fr]" style={{ borderColor: C.line }}>
                  <span className="font-mono text-xs tabular-nums" style={{ color: C.muted }}>
                    {yr(e.start)} — {yr(e.end)}
                  </span>
                  <span className="text-lg font-medium tracking-tight">{e.company.replace(" — deployed to Stack8s", "")}</span>
                  <span style={{ color: C.muted }}>{e.role}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="mx-auto max-w-[1400px] px-5 pb-12 pt-28 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: C.muted }}>
            Have a system that needs owning?
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="group mt-6 block font-[family-name:var(--font-serif)] text-[clamp(3.2rem,11vw,10rem)] leading-[0.95] tracking-[-0.03em]"
          >
            Let&rsquo;s <em className="transition-colors duration-300 group-hover:text-[#c2391f]">talk</em>
            <span className="ml-4 inline-block transition-transform duration-300 group-hover:-translate-y-2 group-hover:translate-x-2">↗</span>
          </a>
          <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-sm" style={{ borderColor: C.line, color: C.muted }}>
            <span>© 2026 {profile.name}</span>
            <span className="flex gap-6">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-[#141412]">
                  {s.label}
                </a>
              ))}
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}
