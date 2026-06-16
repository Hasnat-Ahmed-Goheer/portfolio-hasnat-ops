import type { SkillGroup } from "./types";

/** 5 groups = the 5 particle clusters in the About latent-space scene. */
export const skillGroups: SkillGroup[] = [
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
      "Node.js",
      "NestJS",
      "Express.js",
      "FastAPI",
      "RESTful APIs",
      "JWT Auth",
      "OAuth 2.0",
      "Stripe Connect",
      "Google Calendar API",
      "Google Meet API",
    ],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    skills: [
      "AWS (S3 · EC2 · Lambda · ELB · API GW · VPC)",
      "GCP",
      "Docker",
      "Kubernetes",
      "Helm",
      "Rancher",
      "GitHub Actions",
      "NGINX",
      "Linux",
    ],
  },
  {
    id: "ai-data",
    label: "AI & Databases",
    skills: [
      "RAG",
      "Multi-modal AI Systems",
      "Gemini API",
      "Pinecone",
      "PostgreSQL",
      "DynamoDB",
      "MongoDB",
      "Prisma ORM",
      "Firebase",
    ],
  },
  {
    id: "architecture",
    label: "Architecture & Design",
    skills: [
      "Microservices Architecture",
      "Clean Architecture",
      "Event-Driven Design",
      "TypeScript",
      "JavaScript (ES6+)",
      "Python",
      "C++",
      "SQL",
    ],
  },
];
