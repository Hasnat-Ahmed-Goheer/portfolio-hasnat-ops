/**
 * Shared email styling tokens — the hasnat.ops console palette and font
 * stacks, used by every transactional template. Kept separate so the two
 * emails (uplink notification + auto-reply) read as one system. Email clients
 * strip <style>/external CSS, so everything is applied inline by the templates.
 */
export const emailColors = {
  bg: "#0a0e14",
  elev: "#0e141d",
  text: "#e6edf3",
  muted: "#8b98a9",
  line: "rgba(230,237,243,0.08)",
  accent: "#22d3ee",
  ok: "#34d399",
} as const;

export const emailMono =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

export const emailSans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** the deployed site — used in email signatures/CTAs */
export const SITE_URL = "https://portfolio-hasnat-ops.vercel.app";
