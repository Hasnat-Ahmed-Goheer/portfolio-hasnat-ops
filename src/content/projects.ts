import type { Project } from "./types";

/**
 * Deployments (projects). Metrics come from the resume.
 * Architecture prose extrapolates from resume bullets — review before
 * publishing and replace anything marked TODO.
 */
export const projects: Project[] = [
  {
    slug: "stack8s-marketplace",
    title: "Stack8s Application Marketplace",
    tagline: "10+ production Helm charts powering an enterprise app marketplace.",
    status: "running",
    problem:
      "Enterprise customers needed one-click deployment of services that simply didn't exist as maintained charts — Bitnami coverage ran out exactly where customers needed it most.",
    role: "Sole owner of chart authoring, image packaging, and marketplace integration.",
    stack: ["Helm", "Kubernetes", "GHCR", "Docker", "Rancher", "Next.js"],
    architecture: [
      "Custom container images built and versioned in GitHub Container Registry for services without upstream charts.",
      "Charts authored from scratch with values-driven configuration, sane defaults, and upgrade-safe templates.",
      "Marketplace integration surfaces each chart as an installable application inside the Stack8s console.", // TODO: review wording
    ],
    outcomes: [
      "10+ production Helm charts shipped from scratch.",
      "Marketplace in production use by enterprise customers including Imperial College London.",
    ],
    links: {},
    motif: "helix",
    accent: "#22d3ee",
  },
  {
    slug: "k8s-workload-platform",
    title: "Kubernetes Workload Console",
    tagline: "Full-stack support for 5 workload types across a unified control plane.",
    status: "running",
    problem:
      "Operators needed to configure and provision heterogeneous Kubernetes workloads — without writing YAML or touching kubectl.",
    role: "End-to-end owner: Next.js configuration UI and FastAPI provisioning backend.",
    stack: ["Next.js", "FastAPI", "Kubernetes", "Rancher", "Python", "TypeScript"],
    architecture: [
      "Typed configuration UI generating validated workload specs for Deployments, CronJobs, Jobs, StatefulSets and DaemonSets.",
      "FastAPI provisioning pipeline applying specs through Rancher across the unified control plane.",
      "Centralized backend token validation (~60% less auth code, Auth0-swappable).",
    ],
    outcomes: [
      "5 workload types supported end-to-end.",
      "Auth surface cut by ~60%; provider lock-in eliminated.",
    ],
    links: {},
    motif: "orbit",
    accent: "#22d3ee",
  },
  {
    slug: "node-provisioning-pipeline",
    title: "Worker Node Provisioning Pipeline",
    tagline: "Self-serve infrastructure scaling across 15+ environments.",
    status: "running",
    problem:
      "Scaling a fleet that spans cloud and on-prem meant manual node lifecycle work — slow, error-prone, and unscalable.",
    role: "Designed and built the provisioning/decommissioning pipeline.",
    stack: ["Rancher", "Kubernetes", "Python", "FastAPI"],
    architecture: [
      "Rancher-driven node lifecycle automation: request → provision → join → drain → decommission.",
      "One control plane spanning 15+ cloud and on-prem environments.",
    ],
    outcomes: ["Self-serve scaling across 15+ environments with zero manual node ops."],
    links: {},
    motif: "grid",
    accent: "#34d399",
  },
  {
    slug: "diy-gc-platform",
    title: "DIY General Contractor Platform",
    tagline: "Multi-tenant construction platform built on Clean Architecture.",
    status: "running",
    problem:
      "Contractors, consultants and homeowners needed one platform with strictly separated capabilities — without forking the product per audience.",
    role: "Architected the platform from scratch in NestJS + Next.js.",
    stack: ["NestJS", "Next.js", "MongoDB", "Stripe Connect", "AWS S3", "GCP"],
    architecture: [
      "Clean Architecture with Repository Pattern and domain-driven design.",
      "Multi-tenant RBAC on MongoDB gating every capability per audience.",
      "Stripe Connect payouts + Google Calendar/Meet scheduling integrations.",
    ],
    outcomes: [
      "300+ automated vendor payouts processed monthly.",
      "Three audiences served on a single codebase.",
    ],
    links: {},
    motif: "grid",
    accent: "#f59e0b",
  },
  {
    slug: "rag-assistant",
    title: "RAG Project-Scoping Assistant",
    tagline: "Multi-modal AI scoping on Gemini + Pinecone.",
    status: "running",
    problem:
      "Manual project estimation was slow and inconsistent — scoping required reading plans, photos and descriptions a human had to synthesize.",
    role: "Built the retrieval pipeline and assistant end-to-end.",
    stack: ["Gemini API", "Pinecone", "NestJS", "RAG", "TypeScript"],
    architecture: [
      "Domain documents embedded into Pinecone; retrieval grounds every generation.",
      "Multi-modal inputs (text + imagery) feed Gemini for scoped, costed estimates.",
    ],
    outcomes: ["Manual estimation time cut by 20%."],
    links: {},
    motif: "pulse",
    accent: "#8b5cf6",
  },
  {
    slug: "realtime-messaging",
    title: "Realtime Messaging Infrastructure",
    tagline: "500+ daily conversations at sub-200ms, 99.9% uptime.",
    status: "running",
    problem:
      "Project collaboration needed chat with file exchange that felt instant — on a budget that ruled out managed messaging vendors.",
    role: "Engineered the messaging system and its delivery infrastructure.",
    stack: ["WebSockets", "NestJS", "AWS S3", "MongoDB", "GCP", "CloudFront"],
    architecture: [
      "WebSocket gateway with room-scoped delivery and S3 presigned-URL uploads.",
      "P95 TTFB cut from 800ms to <300ms via MongoDB index tuning + CloudFront CDN.",
    ],
    outcomes: [
      "500+ daily conversations at sub-200ms latency.",
      "99.9% uptime SLA held on GCP.",
    ],
    links: {},
    motif: "pulse",
    accent: "#22d3ee",
  },
  {
    slug: "aris-rails",
    title: "ARIS Rails — Live Train Tracking",
    tagline: "10,000+ GPS coordinates a minute, visualized in realtime.",
    status: "archived",
    problem:
      "50+ railway operators needed live visibility of train movements across 500+ routes — at GPS firehose ingest rates.",
    role: "Built the tracking frontend and optimized the ingest pipeline.",
    stack: ["Next.js", "Pocketbase", "Map clustering", "Tile caching"],
    architecture: [
      "Map clustering + tile caching keep render cost flat as coordinate volume grows.",
      "Pipeline sustains 10,000+ coordinates/min at sub-100ms latency.",
    ],
    outcomes: ["500+ routes live for 50+ operators."],
    links: {},
    motif: "rail",
    accent: "#f59e0b",
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
