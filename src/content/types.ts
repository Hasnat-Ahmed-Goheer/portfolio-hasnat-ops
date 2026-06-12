/** Typed content layer — swap real content here without touching components. */

export interface Social {
  label: string;
  href: string;
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
  socials: Social[];
  resumeUrl: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  skills: string[];
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
  motif: MotifKey;
  /** scene accent override (hex) — keeps per-project motifs distinct */
  accent?: string;
}
