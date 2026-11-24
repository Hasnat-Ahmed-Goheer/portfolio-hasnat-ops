/**
 * Prototype B, "Product". Reads like a well-made product page: a bento grid
 * that answers who / what / where / now in one screen, then case studies as
 * split cards (story left, real screenshot right). Light, crisp, one blue.
 * A pointer-following light on the cards is the only effect.
 * References: metic. (split project cards), Cloudstudio (headline numbers).
 */
import Image from "next/image";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import LocalTime from "@/components/proto/LocalTime";
import Spotlight from "@/components/proto/Spotlight";

const BLUE = "#2f54eb";

/* the one fact per project worth a big number */
const HEADLINE: Record<string, [string, string]> = {
  "stack8s-marketplace": ["10+", "Helm charts shipped"],
  "stack8s-workload-platform": ["15+", "environments"],
  "diy-gc-platform": ["300+", "payouts / month"],
  "swapfans-ai": ["10k+", "monthly users"],
  techvaganza: ["99.9%", "uptime"],
  "aris-rails": ["10k", "GPS points / min"],
  "intellogeek-lms": ["45%", "faster loads"],
};

const card =
  "relative overflow-hidden rounded-[22px] border border-black/[0.07] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100 " +
  "before:bg-[radial-gradient(420px_circle_at_var(--mx)_var(--my),rgba(47,84,235,0.07),transparent_60%)]";

export default function ProtoB() {
  const featured = projects.filter((p) => p.media && p.media.length > 0);
  const others = projects.filter((p) => !p.media || p.media.length === 0);
  const now = experience[0];
  const stack = ["Kubernetes", "Helm", "Rancher", "Next.js", "React", "NestJS", "FastAPI", "MongoDB", "Pinecone", "Stripe"];

  return (
    <div className="min-h-screen bg-[#f4f4f2] font-sans text-[#0d0d0f] antialiased" style={{ colorScheme: "light" }}>
      {/* floating pill nav */}
      <header className="sticky top-4 z-40 mx-auto flex w-[min(100%-2rem,720px)] items-center justify-between rounded-full border border-black/[0.07] bg-white/80 py-2 pl-5 pr-2 text-sm shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <a href="#top" className="font-semibold tracking-tight">hasnat</a>
        <nav className="hidden gap-6 text-black/60 sm:flex">
          <a href="#work" className="hover:text-black">Work</a>
          <a href="#experience" className="hover:text-black">Experience</a>
          <a href={profile.resumeUrl} className="hover:text-black">Résumé</a>
        </nav>
        <a href={`mailto:${profile.email}`} className="rounded-full px-4 py-2 font-medium text-white" style={{ background: BLUE }}>
          Contact
        </a>
      </header>

      <main id="top" className="mx-auto max-w-[1200px] px-4 pb-24 pt-12 sm:px-6">
        {/* bento */}
        <Spotlight className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div data-spot className={`${card} flex min-h-[420px] flex-col justify-between p-8 sm:col-span-2 lg:row-span-2`}>
            <div className="flex items-center gap-2 text-sm text-black/55">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available for new roles
            </div>
            <div>
              <h1 className="mt-10 text-[clamp(2.6rem,5.4vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                {profile.name}
              </h1>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-black/60">
                Full stack engineer who owns systems end to end, from{" "}
                <span className="text-black">Kubernetes and Helm</span> to{" "}
                <span className="text-black">the product UI</span>.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5 text-sm">
                <a href="#work" className="rounded-full px-5 py-2.5 font-medium text-white" style={{ background: "#0d0d0f" }}>
                  See the work
                </a>
                <a href={profile.resumeUrl} className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-medium hover:bg-black/[0.03]">
                  Download résumé
                </a>
              </div>
            </div>
          </div>

          <div data-spot className={`${card} min-h-[170px] sm:col-span-2`}>
            <p className="text-sm text-black/50">Currently</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">Stack8s</p>
            <p className="mt-1 text-[15px] leading-relaxed text-black/60">{now.summary}</p>
          </div>

          <div data-spot className={`${card} min-h-[190px]`}>
            <p className="text-sm text-black/50">Based in</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">Islamabad</p>
            <p className="mt-6 text-3xl font-medium tracking-tight"><LocalTime /></p>
          </div>

          <div data-spot className={`${card} text-white`} style={{ background: BLUE }}>
            <p className="text-sm text-white/70">p95 latency</p>
            <p className="mt-2 text-5xl font-semibold tracking-[-0.04em]">&lt;200ms</p>
            <p className="mt-3 text-sm text-white/75">realtime messaging, 99.9% uptime</p>
          </div>

          <div data-spot className={`${card} sm:col-span-2 lg:col-span-4`}>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <p className="text-sm text-black/50">Works with</p>
              <ul className="flex flex-wrap gap-2">
                {stack.map((s) => (
                  <li key={s} className="rounded-full border border-black/[0.08] bg-[#f4f4f2] px-3 py-1.5 text-sm">
                    {s}
                  </li>
                ))}
                <li className="px-2 py-1.5 text-sm text-black/45">
                  +{skillGroups.reduce((n, g) => n + g.skills.length, 0) - stack.length} more
                </li>
              </ul>
            </div>
          </div>
        </Spotlight>

        {/* featured work: split cards */}
        <section id="work" className="mt-28 scroll-mt-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Selected work</h2>
            <span className="text-sm text-black/50">{projects.length} projects</span>
          </div>
          <Spotlight className="space-y-3">
            {featured.map((p) => {
              const [num, label] = HEADLINE[p.slug] ?? ["", ""];
              return (
                <a key={p.slug} href={`/work/${p.slug}`} data-spot className={`${card} group grid items-stretch gap-6 p-3 md:grid-cols-[1fr_1.35fr]`}>
                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <p className="text-sm text-black/50">{p.status === "running" ? "In production" : "Shipped"}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{p.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-black/60">{p.tagline}</p>
                    </div>
                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-4xl font-semibold tracking-[-0.04em]" style={{ color: BLUE }}>{num}</p>
                        <p className="text-sm text-black/50">{label}</p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:-rotate-45">→</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-[16px] bg-[#eceef3]">
                    <Image
                      src={p.media![0].src}
                      alt={p.media![0].alt}
                      width={1280}
                      height={800}
                      sizes="(min-width: 1200px) 660px, (min-width: 768px) 55vw, 100vw"
                      className="aspect-[16/10] h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </a>
              );
            })}
          </Spotlight>
          <Spotlight className="mt-3 grid gap-3 md:grid-cols-3">
            {others.map((p) => {
              const [num, label] = HEADLINE[p.slug] ?? ["", ""];
              return (
                <a key={p.slug} href={`/work/${p.slug}`} data-spot className={`${card} group flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/60">{p.tagline}</p>
                  </div>
                  <p className="mt-8 text-3xl font-semibold tracking-[-0.04em]">
                    {num} <span className="text-sm font-normal tracking-normal text-black/50">{label}</span>
                  </p>
                </a>
              );
            })}
          </Spotlight>
        </section>

        {/* experience */}
        <section id="experience" className="mt-28 grid scroll-mt-24 gap-10 md:grid-cols-[280px_1fr]">
          <h2 className="text-4xl font-semibold tracking-[-0.03em]">Experience</h2>
          <ol className="space-y-3">
            {experience.map((e) => (
              <li key={e.company + e.start} className="rounded-[22px] border border-black/[0.07] bg-white p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-semibold tracking-tight">{e.company.replace(" — deployed to Stack8s", " · Stack8s")}</p>
                  <p className="text-sm tabular-nums text-black/50">
                    {e.start.replace("-", ".")} – {e.end === "present" ? "Now" : e.end.replace("-", ".")}
                  </p>
                </div>
                <p className="text-[15px] text-black/60">{e.role}</p>
                <p className="mt-3 text-[15px] leading-relaxed">{e.summary}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* contact */}
        <section className="mt-28 overflow-hidden rounded-[28px] p-10 text-white sm:p-16" style={{ background: "#0d0d0f" }}>
          <p className="text-white/55">Open to full stack and platform roles</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1] tracking-[-0.04em]">
            Got a system that needs an owner?
          </h2>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="rounded-full px-6 py-3 font-medium" style={{ background: BLUE }}>
              {profile.email}
            </a>
            {profile.socials.filter((s) => s.label !== "Email").map((s) => (
              <a key={s.label} href={s.href} className="rounded-full border border-white/20 px-6 py-3 font-medium hover:bg-white/10">
                {s.label} ↗
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
