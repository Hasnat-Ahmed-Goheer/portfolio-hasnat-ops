import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";
import { SITE_URL as SITE } from "@/lib/site";

/*
 * /llms.txt: a plain-markdown summary of the site for AI assistants and
 * answer engines (llmstxt.org). Adoption by the big engines is unproven,
 * but it costs nothing: it is generated from the same content layer as the
 * site, prerendered at build time, and the animated UI hides a lot of text
 * behind interaction that this file states plainly.
 */
export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.role} based in ${profile.location}. ${profile.shortBio}`,
    "",
    ...profile.longBio,
    "",
    `Contact: ${profile.email} · Résumé: ${SITE}${profile.resumeUrl}`,
    "",
    "## Pages",
    "",
    `- [Home](${SITE}/): overview and current focus`,
    `- [About](${SITE}/about): story, skills, operating principles`,
    `- [Work](${SITE}/work): case studies of production systems`,
    `- [Experience](${SITE}/experience): full career history`,
    `- [Contact](${SITE}/contact): how to reach me`,
    "",
    "## Case studies",
    "",
    ...projects.map(
      (p) => `- [${p.title}](${SITE}/work/${p.slug}): ${p.tagline} Stack: ${p.stack.join(", ")}.`
    ),
    "",
    "## Experience",
    "",
    ...experience.map(
      (e) => `- ${e.role}, ${e.company} (${e.start} to ${e.end}): ${e.summary}`
    ),
    "",
    "## Skills",
    "",
    ...skillGroups.map((g) => `- ${g.label}: ${g.skills.join(", ")}`),
    "",
    "## Education",
    "",
    `- ${profile.education.degree}, ${profile.education.institution} (${profile.education.period})`,
    "",
    "## Profiles",
    "",
    ...profile.socials
      .filter((s) => s.href.startsWith("http"))
      .map((s) => `- [${s.label}](${s.href})`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
