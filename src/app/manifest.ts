import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { lexicon } from "@/config/console";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${lexicon.systemName} — ${profile.name}`,
    short_name: lexicon.systemName,
    description: profile.shortBio,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e14",
    theme_color: "#0a0e14",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
