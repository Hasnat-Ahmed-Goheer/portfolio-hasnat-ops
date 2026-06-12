import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint runs in CI/editor; builds shouldn't block on style rules.
  eslint: { ignoreDuringBuilds: true },
  // Self-contained server bundle for the Docker image (Vercel ignores this).
  output: "standalone",
};

export default nextConfig;
