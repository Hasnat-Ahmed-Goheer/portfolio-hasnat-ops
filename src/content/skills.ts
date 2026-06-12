import type { SkillGroup } from "./types";

/** 5 groups = the 5 particle clusters in the About latent-space scene. */
export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    skills: ["TypeScript", "JavaScript (ES6+)", "Python", "C++", "SQL"],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      "Next.js",
      "React",
      "Redux Toolkit",
      "TanStack Query",
      "Tailwind CSS",
      "Material-UI",
      "shadcn/ui",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      "NestJS",
      "Node.js",
      "Express.js",
      "FastAPI",
      "RESTful APIs",
      "WebSockets",
      "JWT Auth",
      "OAuth 2.0",
      "Stripe Connect",
    ],
  },
  {
    id: "cloud",
    label: "Cloud & Infra",
    skills: [
      "Kubernetes",
      "Helm",
      "Rancher",
      "Docker",
      "AWS (S3 · EC2 · Lambda · ELB · API GW · VPC)",
      "GCP",
      "GitHub Actions",
      "NGINX",
      "Linux",
    ],
  },
  {
    id: "ai-data",
    label: "AI & Data",
    skills: [
      "RAG",
      "Multi-modal AI",
      "Gemini API",
      "Pinecone",
      "PostgreSQL",
      "MongoDB",
      "DynamoDB",
      "Prisma ORM",
      "Firebase",
    ],
  },
];
