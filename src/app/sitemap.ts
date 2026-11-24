import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL as SITE } from "@/lib/site";

/*
 * No lastModified: the old `new Date()` stamped every URL with the build time
 * on each deploy. Google only trusts lastmod when it is consistently accurate,
 * and a date that changes on every build teaches it to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/work", "/experience", "/contact", "/lab"].map(
    (p) => ({
      url: `${SITE}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : p === "/lab" ? 0.5 : 0.8,
    })
  );
  const work = projects.map((p) => ({
    url: `${SITE}/work/${p.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.7,
    images: (p.media ?? []).map((m) => `${SITE}${m.src}`),
  }));
  return [...pages, ...work];
}
