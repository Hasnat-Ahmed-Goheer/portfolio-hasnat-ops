import type { MetadataRoute } from "next";
import { SITE_URL as SITE } from "@/lib/site";

/*
 * Everything public is crawlable, including AI search crawlers (GPTBot,
 * ClaudeBot, PerplexityBot...): for a portfolio, being cited in AI answers
 * is upside. Only the contact API is excluded; it has nothing to index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
