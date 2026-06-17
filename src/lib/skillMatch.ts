/**
 * Links the /about skills clusters to /work deployments: which projects use a
 * given skill group's stack. Matches by normalized token (case/punctuation-
 * insensitive); substrings only count at length ≥ 4 so short tokens like "c"
 * or "ai" can't false-match. Plain data — no three/React imports.
 */
import { skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";
import type { Project } from "@/content/types";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, "");

function tokenHit(stackItem: string, skillTokens: string[]): boolean {
  const n = norm(stackItem);
  return skillTokens.some(
    (tk) =>
      tk === n ||
      (tk.length >= 4 && n.includes(tk)) ||
      (n.length >= 4 && tk.includes(n))
  );
}

/** projects whose stack intersects a skill group's tools */
export function projectsForSkill(groupId: string): Project[] {
  const g = skillGroups.find((x) => x.id === groupId);
  if (!g) return [];
  const tokens = g.skills.map(norm).filter(Boolean);
  return projects.filter((p) => p.stack.some((s) => tokenHit(s, tokens)));
}

/** slugs only — handy for membership checks on the work index */
export function projectSlugsForSkill(groupId: string): Set<string> {
  return new Set(projectsForSkill(groupId).map((p) => p.slug));
}
