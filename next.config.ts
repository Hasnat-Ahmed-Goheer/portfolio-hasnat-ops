import type { NextConfig } from "next";

/**
 * Security headers on every response. Search engines and link-preview bots
 * don't rank on these directly, but Vercel's conformance checks, Lighthouse
 * "Best Practices" and securityheaders.com all flag their absence.
 *
 * CSP is deliberately "structural" (no script-src allow-list): the root layout
 * ships an inline pre-paint boot script and JSON-LD, and a nonce-based
 * script-src would force every page to render dynamically, losing static
 * prerendering. These directives still block clickjacking, <base> hijacking,
 * plugin embeds and cross-origin form posts.
 */
const csp = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Lint runs in CI/editor; builds shouldn't block on style rules.
  eslint: { ignoreDuringBuilds: true },
  // Self-contained server bundle for the Docker image (Vercel ignores this).
  output: "standalone",
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  // AVIF first (smallest), WebP fallback, for next/image.
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
