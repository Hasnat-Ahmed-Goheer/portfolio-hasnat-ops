import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { lexicon } from "@/config/console";

export const alt = `${lexicon.systemName} — ${profile.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#0a0e14",
          color: "#e6edf3",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              background: "#34d399",
            }}
          />
          <div style={{ fontSize: 28, color: "#22d3ee", letterSpacing: 4 }}>
            {`${lexicon.systemName} · status: operational`}
          </div>
        </div>
        <div style={{ fontSize: 84, fontWeight: 600, marginTop: 24 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 36, color: "#8b98a9", marginTop: 12 }}>
          {`${profile.role} — cloud-native infra · AI products · FinTech`}
        </div>
      </div>
    ),
    size
  );
}
