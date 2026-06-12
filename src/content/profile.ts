import type { Profile } from "./types";

export const profile: Profile = {
  name: "Hasnat Ahmed",
  handle: "hasnat",
  role: "Full Stack Software Engineer",
  location: "Islamabad, Pakistan",
  email: "ch.hsyahmedgoheer@gmail.com",
  availability: "open_to_work",
  shortBio:
    "Full-stack engineer with end-to-end ownership across cloud-native infrastructure, AI-integrated products, and FinTech platforms.",
  longBio: [
    "I build systems across every layer of the stack — from Helm charts and Kubernetes control planes to the React surfaces enterprise customers actually touch. At Stack8s I own the full engineering surface: production Helm charts, workload orchestration via Rancher, authentication architecture, and the Next.js + FastAPI product on top.",
    "Before that I architected a multi-tenant contractor platform in NestJS with Clean Architecture, built a RAG assistant on Gemini and Pinecone, and shipped realtime messaging that holds sub-200ms latency at 99.9% uptime.",
    "I bring a builder's mindset to ambiguous problems — and a track record of measurable impact to back it up.",
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/Hasnat-Ahmed-Goheer" },
    // TODO: replace with your exact LinkedIn slug
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hasnat-ahmed-goheer" },
    { label: "Email", href: "mailto:ch.hsyahmedgoheer@gmail.com" },
  ],
  resumeUrl: "/resume.pdf",
};
