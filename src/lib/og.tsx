import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { lexicon } from "@/config/console";
import { SITE_HOST } from "@/lib/site";

/**
 * Share-card renderer for every route's `opengraph-image.tsx` / `twitter-image.tsx`.
 * This is what X, LinkedIn, Slack, Discord and WhatsApp show when a link is
 * pasted. All cards are prerendered at build time (static routes +
 * generateStaticParams), so reading fonts/images from disk is safe.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const C = {
  bg: "#0a0e14",
  text: "#e6edf3",
  muted: "#8b98a9",
  dim: "#4b5563",
  accent: "#22d3ee",
  ok: "#34d399",
  line: "rgba(34, 211, 238, 0.14)",
};

const FONT_DIR = join(process.cwd(), "node_modules", "geist", "dist", "fonts");

async function loadFonts() {
  const [regular, medium, semibold, mono] = await Promise.all([
    readFile(join(FONT_DIR, "geist-sans", "Geist-Regular.ttf")),
    readFile(join(FONT_DIR, "geist-sans", "Geist-Medium.ttf")),
    readFile(join(FONT_DIR, "geist-sans", "Geist-SemiBold.ttf")),
    readFile(join(FONT_DIR, "geist-mono", "GeistMono-Regular.ttf")),
  ]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const },
    { name: "GeistMono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

/** /media/foo.jpg → data URL (satori can't fetch relative URLs) */
async function publicImage(src: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", src.replace(/^\/+/, "")));
    const mime = src.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/* ── shared chrome: grid, horizon glow, status line, footer ─────────────── */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        background: C.bg,
        color: C.text,
        fontFamily: "Geist",
        overflow: "hidden",
      }}
    >
      {/* console grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.35,
        }}
      />
      {/* horizon — a planet limb glowing along the bottom edge */}
      <div
        style={{
          position: "absolute",
          left: -300,
          right: -300,
          top: 470,
          height: 1400,
          display: "flex",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 0%, #0e2a3a 0%, #0a1620 30%, #070b11 60%)",
          borderTop: "2px solid rgba(103, 232, 249, 0.85)",
          boxShadow:
            "0 -12px 60px rgba(34, 211, 238, 0.45), 0 -40px 140px rgba(34, 211, 238, 0.25)",
        }}
      />

      {/* status line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "44px 64px 0",
          fontFamily: "GeistMono",
          fontSize: 20,
          letterSpacing: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: C.ok, boxShadow: `0 0 12px ${C.ok}` }} />
          <div style={{ color: C.accent }}>{`${lexicon.systemName} · status: operational`}</div>
        </div>
        <div style={{ color: C.muted }}>{label}</div>
      </div>

      <div style={{ display: "flex", flex: 1, padding: "0 64px", position: "relative" }}>
        {children}
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 64px 40px",
          fontFamily: "GeistMono",
          fontSize: 18,
          color: C.muted,
          position: "relative",
        }}
      >
        <div>{SITE_HOST}</div>
        <div>{profile.location}</div>
      </div>
    </div>
  );
}

/* ── home card: name + pitch left, contact + experience right ───────────── */

export async function renderHomeCard() {
  const roles = experience.slice(0, 4);
  return new ImageResponse(
    (
      <Frame label="~/home">
        <div style={{ display: "flex", flex: 1, justifyContent: "space-between", paddingTop: 52 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 590 }}>
            <div style={{ fontSize: 26, color: C.muted }}>Hi, my name is</div>
            <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05, marginTop: 6 }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 30, fontWeight: 500, color: C.accent, marginTop: 14 }}>
              {profile.role}
            </div>
            <div style={{ fontSize: 21, color: C.muted, lineHeight: 1.45, marginTop: 18, maxWidth: 580 }}>
              {profile.shortBio}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right", width: 480 }}>
            <div style={{ fontSize: 22, fontWeight: 600 }}>Contact</div>
            <div style={{ fontSize: 17, color: C.muted, marginTop: 6, fontFamily: "GeistMono" }}>{profile.email}</div>
            <div style={{ fontSize: 22, fontWeight: 600, marginTop: 28 }}>Experience</div>
            {roles.map((r) => (
              <div key={r.company} style={{ fontSize: 17, color: C.muted, marginTop: 8, whiteSpace: "nowrap" }}>
                {`${r.role.split(" & ")[0]} @${r.company.split(" — ")[0]}`}
              </div>
            ))}
          </div>
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts() }
  );
}

/* ── page card: section path + heading + description (+ screenshot) ─────── */

export async function renderPageCard({
  path,
  title,
  description,
  image,
}: {
  path: string;
  title: string;
  description: string;
  /** public path of a screenshot to show on the right, e.g. /media/x.jpg */
  image?: string;
}) {
  const shot = image ? await publicImage(image) : null;
  return new ImageResponse(
    (
      <Frame label={`~${path}`}>
        <div style={{ display: "flex", flex: 1, gap: 48, paddingTop: 52 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 24, color: C.muted }}>{profile.name}</div>
            <div
              style={{
                fontSize: shot ? 58 : 76,
                fontWeight: 600,
                letterSpacing: -2,
                lineHeight: 1.05,
                marginTop: 10,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: shot ? 22 : 26, color: C.muted, lineHeight: 1.45, marginTop: 20, maxWidth: 820 }}>
              {description}
            </div>
          </div>
          {shot && (
            <div
              style={{
                display: "flex",
                width: 460,
                height: 300,
                borderRadius: 14,
                overflow: "hidden",
                border: "1px solid rgba(34, 211, 238, 0.4)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot} alt="" width={460} height={300} style={{ objectFit: "cover", objectPosition: "top" }} />
            </div>
          )}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await loadFonts() }
  );
}
