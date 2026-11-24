/**
 * Prototype G, "Chapters". The portfolio read as a short book: one reading
 * column on warm charcoal, a literary serif for headings, and the work told in
 * chapters (Infrastructure, Product, AI, Record). Each chapter's header sticks
 * to the top while you read inside it, and a hairline at the very top fills as
 * you read (CSS scroll-driven, no JS; hidden where unsupported).
 * References: AI in Design Report 2026 (numbered chapter openers with an
 * "in this chapter" list), SSENSE (sans headline over a serif standfirst).
 */
import Image from "next/image";
import { profile } from "@/content/profile";
import { projects, getProject } from "@/content/projects";
import { experience } from "@/content/experience";
import type { Project } from "@/content/types";

const C = {
  bg: "#1a1816",
  raised: "#221f1c",
  text: "#efe8dc",
  muted: "#a39d93",
  line: "rgba(239,232,220,0.12)",
  accent: "#d29b6c",
};

const CHAPTERS: { num: string; title: string; intro: string; slugs: string[] }[] = [
  {
    num: "I",
    title: "Infrastructure",
    intro:
      "Production Helm charts, workload orchestration through Rancher, and self-serve worker-node scaling across 15+ cloud and on-prem environments.",
    slugs: ["stack8s-marketplace", "stack8s-workload-platform", "techvaganza"],
  },
  {
    num: "II",
    title: "Product",
    intro:
      "Interfaces that hold up under real data: a live map for 50+ rail operators, and a learning platform with Stripe payments and 45% faster page loads.",
    slugs: ["aris-rails", "intellogeek-lms"],
  },
  {
    num: "III",
    title: "AI",
    intro:
      "AI in production, not in demos: a RAG assistant on Gemini and Pinecone that cut estimation time by 20%, and a face-swap product used by 10,000+ people a month.",
    slugs: ["diy-gc-platform", "swapfans-ai"],
  },
];

const CSS = `
.g-progress { transform: scaleX(0); transform-origin: left; display: none; }
@supports (animation-timeline: scroll()) {
  .g-progress { display: block; animation: g-grow linear both; animation-timeline: scroll(root); }
  @keyframes g-grow { to { transform: scaleX(1); } }
}
@media (prefers-reduced-motion: reduce) { .g-progress { display: none; } }
`;

const ym = (s: string) => (s === "present" ? "now" : s.replace("-", "."));

function ChapterHeader({ num, title, count }: { num: string; title: string; count?: number }) {
  return (
    <div
      className="sticky top-0 z-20 -mx-5 flex items-baseline justify-between border-b px-5 py-4 backdrop-blur-md"
      style={{ borderColor: C.line, background: "rgba(26,24,22,0.88)" }}
    >
      <h2 className="flex items-baseline gap-4">
        <span className="font-[family-name:var(--font-serif)] text-lg italic" style={{ color: C.accent }}>
          {num}.
        </span>
        <span className="font-[family-name:var(--font-serif)] text-3xl tracking-tight sm:text-4xl">{title}</span>
      </h2>
      {count !== undefined && (
        <span className="text-xs uppercase tracking-[0.18em]" style={{ color: C.muted }}>
          {count} {count === 1 ? "piece" : "pieces"}
        </span>
      )}
    </div>
  );
}

function Entry({ p }: { p: Project }) {
  const shot = p.media?.[0];
  return (
    <article className="py-12">
      <a href={`/work/${p.slug}`} className="group block">
        {shot && (
          <div className="mb-7 overflow-hidden rounded-md border" style={{ borderColor: C.line }}>
            <Image
              src={shot.src}
              alt={shot.alt}
              width={1280}
              height={800}
              sizes="(min-width: 760px) 680px, 100vw"
              className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            />
          </div>
        )}
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: C.muted }}>
          {p.status === "running" ? "In production" : "Shipped"} · {p.stack.slice(0, 3).join(", ")}
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-serif)] text-[2.1rem] leading-[1.08] tracking-tight transition-colors group-hover:text-[#d29b6c]">
          {p.title}
        </h3>
      </a>
      <p className="mt-4 text-[17px] leading-[1.75]" style={{ color: C.muted }}>
        {p.problem}
      </p>
      <ul className="mt-5 space-y-2 text-[16px] leading-relaxed">
        {p.outcomes.slice(0, 2).map((o) => (
          <li key={o} className="flex gap-3">
            <span aria-hidden="true" style={{ color: C.accent }}>—</span>
            <span>{o}</span>
          </li>
        ))}
      </ul>
      <a
        href={`/work/${p.slug}`}
        className="mt-6 inline-block border-b pb-0.5 text-sm transition-colors hover:text-[#d29b6c]"
        style={{ borderColor: C.accent }}
      >
        Read the case study
      </a>
    </article>
  );
}

export default function ProtoG() {
  const placed = new Set(CHAPTERS.flatMap((c) => c.slugs));
  const extra = projects.filter((p) => !placed.has(p.slug)); // safety: nothing dropped

  return (
    <div className="min-h-screen font-sans antialiased" style={{ background: C.bg, color: C.text, colorScheme: "dark" }}>
      <style>{CSS}</style>
      <div aria-hidden="true" className="g-progress fixed inset-x-0 top-0 z-50 h-[2px]" style={{ background: C.accent }} />

      <main className="mx-auto max-w-[680px] px-5">
        {/* opening */}
        <header className="flex min-h-[92svh] flex-col justify-between pb-16 pt-8">
          <nav className="flex items-center justify-between text-sm" style={{ color: C.muted }}>
            <span style={{ color: C.text }}>Hasnat Goheer</span>
            <span className="flex gap-5">
              <a href="#record" className="hover:text-[#efe8dc]">Record</a>
              <a href={profile.resumeUrl} className="hover:text-[#efe8dc]">Résumé</a>
              <a href="#contact" className="hover:text-[#efe8dc]">Contact</a>
            </span>
          </nav>
          <div>
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: C.accent }}>
              A portfolio in four chapters
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-serif)] text-[clamp(3.2rem,11vw,5.6rem)] leading-[0.98] tracking-[-0.02em]">
              {profile.name}
            </h1>
            <p className="mt-8 font-[family-name:var(--font-serif)] text-2xl italic leading-snug sm:text-[1.7rem]" style={{ color: C.text }}>
              {profile.role}, {profile.location}.
            </p>
            <p className="mt-6 text-[17px] leading-[1.75]" style={{ color: C.muted }}>
              {profile.longBio[0]}
            </p>
          </div>
          <ol className="grid gap-1 border-t pt-6 text-sm sm:grid-cols-2" style={{ borderColor: C.line, color: C.muted }}>
            {[...CHAPTERS.map((c) => [c.num, c.title]), ["IV", "Record"]].map(([n, t]) => (
              <li key={n}>
                <a href={`#ch-${n}`} className="flex gap-3 py-1 hover:text-[#efe8dc]">
                  <span className="w-6 font-[family-name:var(--font-serif)] italic" style={{ color: C.accent }}>{n}.</span>
                  {t}
                </a>
              </li>
            ))}
          </ol>
        </header>

        {/* chapters I–III */}
        {CHAPTERS.map((c) => {
          const items = c.slugs.map((s) => getProject(s)).filter((p): p is Project => !!p);
          return (
            <section key={c.num} id={`ch-${c.num}`} aria-label={c.title} className="scroll-mt-0 pt-10">
              <ChapterHeader num={c.num} title={c.title} count={items.length} />
              <p className="mt-10 font-[family-name:var(--font-serif)] text-[1.65rem] leading-[1.35]">
                {c.intro}
              </p>
              <div className="divide-y" style={{ borderColor: C.line }}>
                {items.map((p) => (
                  <div key={p.slug} style={{ borderColor: C.line }}>
                    <Entry p={p} />
                  </div>
                ))}
                {c.num === "III" &&
                  extra.map((p) => (
                    <div key={p.slug} style={{ borderColor: C.line }}>
                      <Entry p={p} />
                    </div>
                  ))}
              </div>
            </section>
          );
        })}

        {/* IV. record */}
        <section id="ch-IV" aria-label="Record" className="pt-10">
          <span id="record" />
          <ChapterHeader num="IV" title="Record" />
          <ol className="mt-6">
            {experience.map((e) => (
              <li key={e.company + e.start} className="grid gap-1 border-b py-6 sm:grid-cols-[8.5rem_1fr]" style={{ borderColor: C.line }}>
                <span className="text-sm tabular-nums" style={{ color: C.muted }}>
                  {ym(e.start)} – {ym(e.end)}
                </span>
                <div>
                  <p className="font-[family-name:var(--font-serif)] text-2xl leading-tight">
                    {e.company.replace(" — deployed to Stack8s", ", at Stack8s")}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: C.accent }}>{e.role}</p>
                  <p className="mt-2 text-[16px] leading-relaxed" style={{ color: C.muted }}>{e.summary}</p>
                </div>
              </li>
            ))}
            <li className="grid gap-1 py-6 sm:grid-cols-[8.5rem_1fr]">
              <span className="text-sm" style={{ color: C.muted }}>{profile.education.period}</span>
              <div>
                <p className="font-[family-name:var(--font-serif)] text-2xl leading-tight">{profile.education.institution}</p>
                <p className="mt-1 text-sm" style={{ color: C.accent }}>{profile.education.degree}</p>
              </div>
            </li>
          </ol>
        </section>

        {/* closing */}
        <section id="contact" aria-label="Contact" className="pb-16 pt-32">
          <p className="font-[family-name:var(--font-serif)] text-lg italic" style={{ color: C.accent }}>Epilogue</p>
          <h2 className="mt-4 font-[family-name:var(--font-serif)] text-[clamp(2.6rem,8vw,4rem)] leading-[1.02] tracking-tight">
            The next chapter is yours to write.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.75]" style={{ color: C.muted }}>
            {profile.longBio[2]} I&rsquo;m open to full stack and platform roles.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <a href={`mailto:${profile.email}`} className="rounded-full px-6 py-3 font-medium" style={{ background: C.text, color: C.bg }}>
              Write to me
            </a>
            <a href={profile.resumeUrl} className="rounded-full border px-6 py-3 font-medium hover:bg-white/5" style={{ borderColor: C.line }}>
              Résumé
            </a>
          </div>
          <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t pt-6 text-sm" style={{ borderColor: C.line, color: C.muted }}>
            <span>© 2026 {profile.name}</span>
            <span className="flex gap-5">
              {profile.socials.map((s) => (
                <a key={s.label} href={s.href} className="hover:text-[#efe8dc]">{s.label}</a>
              ))}
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}
