import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hasnat.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/work", "/experience", "/lab", "/contact"].map(
    (p) => ({
      url: `${SITE}${p}`,
      lastModified: new Date(),
      priority: p === "" ? 1 : 0.8,
    })
  );
  const work = projects.map((p) => ({
    url: `${SITE}/work/${p.slug}`,
    lastModified: new Date(),
    priority: 0.6,
  }));
  return [...pages, ...work];
}
