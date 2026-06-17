import type { Project } from "./types";

/**
 * Deployments (projects). Grouped by product, not by feature.
 * Metrics sourced from resume — keep them honest.
 */
export const projects: Project[] = [
  {
    slug: "stack8s-marketplace",
    title: "Stack8s Application Marketplace",
    tagline:
      "10+ production Helm charts powering an enterprise app marketplace used by Imperial College London.",
    status: "running",
    problem:
      "Enterprise customers needed one-click deployment of services that simply didn't exist as maintained charts — Bitnami coverage ran out exactly where customers needed it most.",
    role: "Sole owner of chart authoring, image packaging, and marketplace integration.",
    stack: ["Helm", "Kubernetes", "GHCR", "Docker", "Rancher", "Next.js"],
    architecture: [
      "Custom container images built and versioned in GitHub Container Registry for services without upstream charts.",
      "Charts authored from scratch with values-driven configuration, sane defaults, and upgrade-safe templates.",
      "Marketplace integration surfaces each chart as an installable application inside the Stack8s console.",
    ],
    outcomes: [
      "10+ production Helm charts shipped from scratch.",
      "Marketplace in production use by enterprise customers including Imperial College London.",
    ],
    links: { live: "https://stack8s.com" },
    media: [
      { src: "/media/stack8s-appmarket.jpg", alt: "Stack8s console application marketplace — installable Helm charts with one-click deploy", caption: "stack8s console — application marketplace · one-click Helm installs" },
      { src: "/media/stack8s-marketplace.jpg", alt: "Stack8s marketplace managed-service cost comparison page", caption: "marketplace — managed-service cost comparison" },
    ],
    motif: "helix",
    accent: "#22d3ee",
  },
  {
    slug: "stack8s-workload-platform",
    title: "Stack8s Workload & Infrastructure Platform",
    tagline:
      "Full-stack Kubernetes workload console + self-serve node provisioning across 15+ environments.",
    status: "running",
    problem:
      "Operators needed to configure heterogeneous Kubernetes workloads and scale infrastructure without writing YAML — across 15+ cloud and on-prem environments.",
    role: "End-to-end owner: Next.js configuration UI, FastAPI provisioning backend, and auth architecture overhaul.",
    stack: ["Next.js", "FastAPI", "Kubernetes", "Rancher", "Python", "TypeScript"],
    architecture: [
      "Typed configuration UI generating validated workload specs for Deployments, CronJobs, Jobs, StatefulSets and DaemonSets.",
      "FastAPI provisioning pipeline applying specs through Rancher across the unified control plane.",
      "Centralized all access_token validation to the backend — cutting auth-related code by ~60% and decoupling the system from Auth0.",
      "Rancher-based worker node provisioning/decommissioning pipeline enabling self-serve infrastructure scaling.",
    ],
    outcomes: [
      "5 workload types supported end-to-end through a single UI.",
      "Auth surface cut by ~60%; provider lock-in eliminated.",
      "Self-serve node scaling across 15+ cloud and on-prem environments.",
    ],
    links: { live: "https://dev.stack8s.com" },
    media: [
      { src: "/media/stack8s-console.jpg", alt: "Stack8s workload console — projects table with live cluster CPU/RAM/disk/GPU meters", caption: "workload console — projects & live cluster resource meters" },
      { src: "/media/stack8s-hero.jpg", alt: "Stack8s sovereign cloud platform control-plane landing", caption: "stack8s — sovereign cloud control plane" },
    ],
    motif: "orbit",
    accent: "#22d3ee",
  },
  {
    slug: "diy-gc-platform",
    title: "DIY General Contractor Platform",
    tagline:
      "Multi-tenant construction platform with AI scoping, realtime messaging, and automated payments.",
    status: "running",
    problem:
      "Contractors, consultants and homeowners needed one platform with strictly separated capabilities, AI-assisted project scoping, real-time communication, and automated vendor payouts — without forking the product per audience.",
    role: "Architected the platform from scratch in NestJS + Next.js; owned every subsystem.",
    stack: ["NestJS", "Next.js", "MongoDB", "Gemini API", "Pinecone", "Stripe Connect", "AWS S3", "GCP", "WebSockets"],
    architecture: [
      "Clean Architecture with Repository Pattern and domain-driven design; multi-tenant RBAC on MongoDB gating every capability per audience.",
      "RAG-based AI Assistant on Gemini API + Pinecone vector databases enabling multi-modal project scoping — cut manual estimation time by 20%.",
      "WebSocket messaging with S3 file uploads sustaining 500+ daily conversations at sub-200ms latency; P95 TTFB cut from 800ms to <300ms via index tuning + CloudFront CDN.",
      "Stripe Connect payment infrastructure processing 300+ automated vendor payouts monthly, integrated with Google Calendar and Meet APIs for consultation scheduling.",
    ],
    outcomes: [
      "Three audiences (contractors, consultants, homeowners) served on a single codebase.",
      "Manual estimation time cut by 20% with RAG assistant.",
      "500+ daily conversations at sub-200ms, 99.9% uptime on GCP.",
      "300+ automated vendor payouts processed monthly.",
    ],
    links: { live: "https://diy.wanile.dev" },
    media: [
      { src: "/media/diy-dashboard.jpg", alt: "DIY general-contractor dashboard — budget tracking, savings, and AI visual suggestions", caption: "contractor dashboard — budget tracking & AI visual suggestions" },
      { src: "/media/diy-projects.jpg", alt: "DIY projects view — renovation timeline, budget vs general-contractor cost", caption: "projects — renovation timeline, budget vs GC cost" },
    ],
    motif: "grid",
    accent: "#f59e0b",
  },
  {
    slug: "swapfans-ai",
    title: "SwapFans.ai",
    tagline: "AI face-swap platform serving 10,000+ monthly active users.",
    status: "archived",
    problem:
      "An AI face-swap product needed a production-grade frontend that could handle consumer-scale traffic with a seamless upload experience on mobile.",
    role: "Full stack developer owning the responsive UI and upload infrastructure.",
    stack: ["React", "Next.js", "Tailwind CSS", "Headless UI"],
    architecture: [
      "Mobile-first responsive UI in React/Next.js/Tailwind serving 10,000+ MAU.",
      "Real-time file upload system with progress tracking — reduced user abandonment by 15%.",
      "Reusable component library with Headless UI and custom React hooks — accelerated feature delivery by 10% and reduced UI duplication by 35%.",
    ],
    outcomes: [
      "10,000+ monthly active users served with mobile-first design.",
      "User abandonment during upload reduced by 15%.",
      "UI code duplication cut by 35%.",
    ],
    links: { repo: "https://github.com/Hasnat-Ahmed-Goheer/swapfans-Inverted" },
    media: [
      { src: "/media/swapfans.png", alt: "SwapFans.ai — AI image creativity suite: face swap, video face swap, background changer, AI text-to-image", caption: "swapfans.ai — AI image creativity suite" },
    ],
    motif: "pulse",
    accent: "#8b5cf6",
  },
  {
    slug: "techvaganza",
    title: "Techvaganza Corporate Platform",
    tagline: "Containerized Next.js platform with 99.9% uptime, delivered as team lead.",
    status: "archived",
    problem:
      "A corporate platform needed to be shipped fast and operated reliably — with a small team and no existing CI/CD.",
    role: "Full Stack Engineer & Team Lead, leading a 3-person team.",
    stack: ["Next.js", "Docker", "NGINX", "AWS EC2", "GitHub Actions"],
    architecture: [
      "Next.js platform containerized with Docker, served via Nginx reverse proxy on auto-scaling AWS EC2.",
      "GitHub Actions CI/CD pipeline — deployment time from 1 hour to 15 minutes, zero manual errors.",
      "Agile sprints with optimized task distribution delivering 30% faster feature releases.",
    ],
    outcomes: [
      "99.9% uptime at sub-2s load times.",
      "Deploy time reduced from 1 hour to 15 minutes.",
      "30% faster feature releases through better sprint planning.",
    ],
    links: { repo: "https://github.com/Hasnat-Ahmed-Goheer/TechVaganza-web" },
    media: [],
    motif: "orbit",
    accent: "#34d399",
  },
  {
    slug: "aris-rails",
    title: "ARIS Rails — Live Train Tracking",
    tagline: "10,000+ GPS coordinates a minute, visualized in realtime for 50+ operators.",
    status: "archived",
    problem:
      "50+ railway operators needed live visibility of train movements across 500+ routes — at GPS firehose ingest rates.",
    role: "Built the tracking frontend and optimized the ingest pipeline.",
    stack: ["Next.js", "Pocketbase", "Map clustering", "Tile caching"],
    architecture: [
      "Real-time train tracking visualization in Next.js + Pocketbase across 500+ routes.",
      "Map clustering + tile caching keep render cost flat as coordinate volume grows.",
      "GPS processing pipeline optimized to handle 10,000+ coordinates/min at sub-100ms latency.",
    ],
    outcomes: [
      "500+ routes visualized live for 50+ railway operators.",
      "10,000+ GPS coordinates processed per minute at sub-100ms latency.",
    ],
    links: { repo: "https://github.com/OmerAwan445/ARIIS_UPDATE" },
    media: [],
    motif: "rail",
    accent: "#f59e0b",
  },
  {
    slug: "intellogeek-lms",
    title: "Intellogeek LMS",
    tagline: "Full learning management system with Stripe payments and 45% faster page loads.",
    status: "archived",
    problem:
      "An edtech startup needed a complete LMS — course creation, instructor dashboards, and payment processing — shipped fast on the frontend.",
    role: "Frontend developer owning the entire client application.",
    stack: ["React", "Next.js", "Stripe", "REST APIs"],
    architecture: [
      "Full LMS with course creation tools, instructor dashboards, and integrated Stripe gateway processing 300+ monthly transactions.",
      "Frontend caching and code-splitting cutting initial page load by 45%.",
      "Collaborated with backend to design and integrate RESTful APIs.",
    ],
    outcomes: [
      "300+ monthly transactions processed through Stripe gateway.",
      "Initial page load cut by 45%.",
    ],
    links: {},
    media: [],
    motif: "pulse",
    accent: "#22d3ee",
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);
