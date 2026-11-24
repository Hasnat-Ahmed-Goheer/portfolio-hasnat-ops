/**
 * Prototype C, "Signal". A saturated ultramarine field, a full-width variable
 * wordmark, a ticker, and case studies as cards that stack on top of each
 * other as you scroll (position: sticky, normal scrolling, no hijack).
 * Motion is CSS only: the ticker, and scroll-driven reveals in browsers that
 * support animation-timeline (others just show the content).
 * References: Readymag (colour field + giant type), KOBU (full-width mark).
 */
import Image from "next/image";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import LocalTime from "@/components/proto/LocalTime";
import FitText from "@/components/proto/FitText";

const BLUE = "#2323ff";
const CREAM = "#f3f0e6";
const LIME = "#d6ff3d";
const INK = "#0b0b14";

const CARD_THEMES = [
  { bg: LIME, fg: INK, sub: "rgba(11,11,20,0.68)" },
  { bg: CREAM, fg: INK, sub: "rgba(11,11,20,0.62)" },
  { bg: INK, fg: CREAM, sub: "rgba(243,240,230,0.62)" },
];

const TICKER = ["Kubernetes", "Helm", "Rancher", "Next.js", "NestJS", "FastAPI", "RAG", "Stripe Connect", "WebSockets"];

const CSS = `
.sig-ticker { animation: sig-marquee 28s linear infinite; }
@keyframes sig-marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .sig-ticker { animation: none; } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .sig-rise {
      animation: sig-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 70%;
    }
    @keyframes sig-rise { from { opacity: 0; transform: translateY(60px); } }
    .sig-card-inner {
      animation: sig-shrink linear both;
      animation-timeline: view();
      animation-range: exit -20% exit 60%;
    }
    @keyframes sig-shrink { to { transform: scale(0.92); filter: brightness(0.75); } }
  }
}
`;

const wide = { fontVariationSettings: "'wdth' 125" } as const;
const narrow = { fontVariationSettings: "'wdth' 62" } as const;

export default function ProtoC() {
  const [first, ...rest] = profile.name.split(" ");
  const featured = projects.filter((p) => p.media && p.media.length > 0);

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-archivo)] antialiased"
      style={{ background: BLUE, color: CREAM, colorScheme: "dark" }}
    >
      <style>{CSS}</style>

      <header className="flex items-start justify-between px-5 pt-5 text-[13px] font-medium uppercase tracking-wide sm:px-8">
        <span>Hasnat — Full stack</span>
        <nav className="hidden gap-6 sm:flex">
          <a href="#work" className="hover:underline">Work</a>
          <a href="#log" className="hover:underline">Log</a>
          <a href="#contact" className="hover:underline">Contact</a>
        </nav>
        <span className="text-right">
          Islamabad <LocalTime />
        </span>
      </header>

      {/* hero wordmark */}
      <section className="px-3 pt-[12vh] sm:px-5">
        <h1 className="select-none font-black uppercase leading-[0.8] tracking-[-0.02em]">
          <FitText guess="17.5vw" style={wide}>{first}</FitText>
          <FitText guess="15vw" style={narrow}>{rest.join(" ")}</FitText>
        </h1>
        <p className="mt-8 max-w-md px-2 text-lg font-medium leading-snug md:ml-auto md:text-xl">
          Full stack engineer. I own systems end to end: Kubernetes, Helm and FastAPI underneath, Next.js on top.
        </p>
      </section>

      {/* ticker */}
      <div className="mt-16 overflow-hidden border-y py-4" style={{ borderColor: "rgba(243,240,230,0.25)", background: LIME, color: INK }}>
        <div className="sig-ticker flex w-max whitespace-nowrap text-3xl font-extrabold uppercase sm:text-4xl" style={wide}>
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1 || undefined} className="flex">
              {TICKER.map((t) => (
                <span key={t} className="flex items-center">
                  <span className="px-6">{t}</span>
                  <span>✺</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* statement */}
      <section className="px-5 py-32 sm:px-8">
        <p className="sig-rise max-w-5xl text-[clamp(2rem,5vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.02em]">
          10+ Helm charts. 15+ environments. One control plane. Realtime under{" "}
          <span style={{ color: LIME }}>200ms</span>. Two years of shipping to production.
        </p>
      </section>

      {/* stacking cards */}
      <section id="work" className="px-3 pb-24 sm:px-5">
        <h2 className="sig-rise mb-10 px-2 text-sm font-semibold uppercase tracking-[0.2em]">Selected work ({featured.length})</h2>
        <div className="space-y-6">
          {featured.map((p, i) => {
            const t = CARD_THEMES[i % CARD_THEMES.length];
            return (
              <div key={p.slug} className="sticky" style={{ top: `${5 + i * 1.6}rem` }}>
                <a
                  href={`/work/${p.slug}`}
                  className="sig-card-inner group grid min-h-[78vh] origin-top gap-6 rounded-[28px] p-5 sm:p-8 md:grid-cols-[1fr_1.3fr]"
                  style={{ background: t.bg, color: t.fg }}
                >
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: t.sub }}>
                        {String(i + 1).padStart(2, "0")} / {p.status === "running" ? "Live" : "Shipped"}
                      </p>
                      <h3 className="mt-4 text-[clamp(2.2rem,4.6vw,4.5rem)] font-black uppercase leading-[0.92]" style={narrow}>
                        {p.title}
                      </h3>
                      <p className="mt-5 max-w-md text-lg leading-snug" style={{ color: t.sub }}>{p.tagline}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {p.stack.slice(0, 4).map((s) => (
                        <span key={s} className="rounded-full border px-3 py-1 text-sm font-medium" style={{ borderColor: t.sub }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative min-h-[260px] overflow-hidden rounded-[18px]">
                    <Image
                      src={p.media![0].src}
                      alt={p.media![0].alt}
                      fill
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
        <p className="mt-10 px-2 text-lg">
          + {projects.length - featured.length} more:{" "}
          {projects
            .filter((p) => !featured.includes(p))
            .map((p) => p.title.split(" — ")[0])
            .join(", ")}
        </p>
      </section>

      {/* log */}
      <section id="log" className="px-5 py-24 sm:px-8" style={{ background: CREAM, color: INK }}>
        <h2 className="sig-rise text-sm font-semibold uppercase tracking-[0.2em]">Log</h2>
        <ol className="mt-10">
          {experience.map((e) => (
            <li key={e.company + e.start} className="sig-rise grid items-baseline gap-2 border-t border-black/20 py-7 md:grid-cols-[14rem_1fr_1fr]">
              <span className="text-5xl font-black tabular-nums" style={narrow}>
                {e.start.slice(0, 4)}
              </span>
              <span className="text-2xl font-bold tracking-tight">{e.company.replace(" — deployed to Stack8s", " / Stack8s")}</span>
              <span className="text-black/65">{e.role}. {e.summary}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* contact */}
      <section id="contact" className="px-3 pb-8 pt-28 sm:px-5" style={{ background: INK, color: CREAM }}>
        <p className="px-2 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: LIME }}>
          Open to work — say hello
        </p>
        <a href={`mailto:${profile.email}`} className="mt-4 block font-black uppercase leading-[0.85] transition-colors hover:text-[#d6ff3d]">
          <FitText guess="12vw" style={narrow}>{"Let’s build it"}</FitText>
        </a>
        <div className="mt-16 flex flex-wrap justify-between gap-4 border-t border-white/15 px-2 pt-6 text-sm">
          <span>{profile.email}</span>
          <span className="flex gap-6">
            {profile.socials.map((s) => (
              <a key={s.label} href={s.href} className="hover:underline">{s.label}</a>
            ))}
            <a href={profile.resumeUrl} className="hover:underline">Résumé</a>
          </span>
        </div>
      </section>
    </div>
  );
}
