import type { ExperienceEntry } from "./types";

/** Newest first. Sourced from resume — keep metrics honest. */
export const experience: ExperienceEntry[] = [
  {
    company: "Eprecisio Technologies — deployed to Stack8s",
    role: "Full Stack Software Engineer",
    start: "2026-01",
    end: "present",
    location: "Islamabad, PK",
    summary:
      "Owning the full engineering surface of a Kubernetes application platform used by enterprise customers including Imperial College London.",
    highlights: [
      "Centralized all access_token validation to the backend — cutting auth-related code by ~60% and decoupling the system from Auth0 so a provider swap needs minimal effort.",
      "Authored 10+ production Helm charts from scratch, packaging custom GHCR images for services unavailable on Bitnami — extending the Stack8s marketplace.",
      "Delivered full-stack support for 5 Kubernetes workload types (Deployments, CronJobs, Jobs, StatefulSets, DaemonSets) via Rancher — owning the Next.js config UI and FastAPI provisioning pipeline end-to-end.",
      "Engineered a Rancher-based worker-node provisioning/decommissioning pipeline enabling self-serve scaling across 15+ cloud and on-prem environments.",
    ],
  },
  {
    company: "Wanile Technologies",
    role: "Full Stack Software Engineer",
    start: "2025-08",
    end: "2026-01",
    summary:
      "Architected a multi-tenant contractor platform and its AI assistant from scratch.",
    highlights: [
      "Built the DIY General Contractor platform in NestJS + Next.js using Clean Architecture, Repository Pattern and DDD; multi-tenant RBAC on MongoDB serving contractors, consultants and homeowners.",
      "Built a RAG AI assistant on Gemini API + Pinecone enabling multi-modal project scoping — cutting manual estimation time by 20%.",
      "Engineered WebSocket messaging with S3 uploads sustaining 500+ daily conversations at sub-200ms latency, 99.9% uptime; cut P95 TTFB from 800ms to <300ms via index tuning + CloudFront.",
      "Built Stripe Connect payments processing 300+ automated vendor payouts monthly, integrated with Google Calendar and Meet APIs.",
    ],
  },
  {
    company: "SwapFans.ai",
    role: "Full Stack Developer",
    start: "2025-04",
    end: "2025-06",
    summary: "Frontend platform work for an AI face-swap product at consumer scale.",
    highlights: [
      "Built responsive UI in React/Next.js/Tailwind serving 10,000+ monthly active users, mobile-first.",
      "Architected realtime upload with progress tracking — reducing abandonment by 15%.",
      "Built a reusable component library (Headless UI + hooks) — 10% faster delivery, −35% UI duplication.",
    ],
  },
  {
    company: "Techvaganza",
    role: "Full Stack Engineer & Team Lead",
    start: "2024-04",
    end: "2024-09",
    summary: "Led a 3-person team shipping and operating a corporate platform.",
    highlights: [
      "Deployed a Next.js platform in Docker behind Nginx on auto-scaling EC2 — 99.9% uptime, sub-2s loads.",
      "Led agile sprints delivering 30% faster releases through better task distribution and refinement.",
      "Established GitHub Actions CI/CD — deploy time from 1 hour to 15 minutes, zero manual errors.",
    ],
  },
  {
    company: "ARIS Rails",
    role: "Full Stack Developer",
    start: "2024-01",
    end: "2024-05",
    summary: "Realtime railway tracking at national scale.",
    highlights: [
      "Built live train tracking in Next.js + Pocketbase visualizing 500+ routes for 50+ operators.",
      "Optimized GPS pipeline to 10,000+ coordinates/min at sub-100ms latency via clustering + tile caching.",
    ],
  },
  {
    company: "Intellogeek",
    role: "Frontend Developer",
    start: "2023-06",
    end: "2024-01",
    summary: "Shipped a full LMS platform end-to-end on the frontend.",
    highlights: [
      "Delivered an LMS with course tools, instructor dashboards and a Stripe gateway processing 300+ monthly transactions.",
      "Cut initial page load 45% via caching and code-splitting; co-designed the REST API surface.",
    ],
  },
];
