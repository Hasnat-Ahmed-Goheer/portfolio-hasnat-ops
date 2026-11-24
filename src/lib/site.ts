/**
 * Canonical site origin, used for metadataBase, canonical URLs, sitemap,
 * robots and JSON-LD. Crawlers (X, LinkedIn, Slack, Google) need ABSOLUTE
 * URLs for og:image, so this must resolve to the real public domain.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL                — set this in prod (custom domain)
 *   2. VERCEL_PROJECT_PRODUCTION_URL       — Vercel's stable prod domain
 *   3. RAILWAY_PUBLIC_DOMAIN               — Railway's public domain
 *   4. http://localhost:3000               — local dev
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${railway}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** bare host for display on share cards, e.g. "portfolio-hasnat-ops.vercel.app" */
export const SITE_HOST = new URL(SITE_URL).host;
