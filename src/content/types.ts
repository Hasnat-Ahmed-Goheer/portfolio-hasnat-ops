/** Typed content layer — swap real content here without touching components. */

export interface Social {
  label: string;
  href: string;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  gpa: string;
}

export interface Profile {
  name: string;
  handle: string;
  role: string;
  location: string;
  email: string;
  availability: string;
  shortBio: string;
  longBio: string[];
  education: Education;
  socials: Social[];
  resumeUrl: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
  philosophy?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  start: string; // "YYYY-MM"
  end: string | "present";
  location?: string;
  summary: string;
  highlights: string[];
}

export type MotifKey = "orbit" | "helix" | "pulse" | "rail" | "grid";

export interface MediaItem {
  /** path under /public, e.g. "/media/placeholder-dashboard.svg" */
  src: string;
  alt: string;
  /** console-window title bar text, e.g. "console — workloads.tsx" */
  caption: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  status: "running" | "archived";
  problem: string;
  role: string;
  stack: string[];
  architecture: string[];
  outcomes: string[];
  links: { repo?: string; live?: string };
  /** screenshots / diagrams rendered as console windows on the case study */
  media?: MediaItem[];
  motif: MotifKey;
  /** scene accent override (hex) — keeps per-project motifs distinct */
  accent?: string;
}
