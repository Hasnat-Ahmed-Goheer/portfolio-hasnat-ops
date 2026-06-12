/**
 * fakeFs.ts — POSIX-ish in-memory filesystem for the terminal.
 * Content is generated from the typed content layer, so `cat` output
 * stays in sync with the site automatically.
 */
import { profile } from "@/content/profile";
import { skillGroups } from "@/content/skills";
import { projects } from "@/content/projects";

export type Dir = { [name: string]: Dir | string };

export const HOME = ["home", "hasnat"];

const skillsDir: Dir = Object.fromEntries(
  skillGroups.map((g) => [
    `${g.id}.txt`,
    `# ${g.label}\n${g.skills.map((s) => `- ${s}`).join("\n")}`,
  ])
);

const workDir: Dir = Object.fromEntries(
  projects.map((p) => [
    `${p.slug}.txt`,
    `${p.title} [${p.status}]\n${p.tagline}\n→ inspect: open ${p.slug}`,
  ])
);

export const fsTree: Dir = {
  home: {
    hasnat: {
      "about.txt": `${profile.name} — ${profile.role}\n${profile.location}\n\n${profile.shortBio}`,
      "contact.txt": [
        `email: ${profile.email}`,
        ...profile.socials.map((s) => `${s.label.toLowerCase()}: ${s.href}`),
        `→ or just run: contact`,
      ].join("\n"),
      "resume.pdf": "[binary stream] — run: resume",
      ".secrets":
        "you weren't supposed to find this.\nflag{curiosity_rewarded}\nhint: sudo hire hasnat",
      skills: skillsDir,
      work: workDir,
      lab: {
        "notes.txt": "unstable experiments live at /lab — run: goto lab",
      },
    },
  },
};

/** Resolve a path string against cwd. Returns segments or null if invalid syntax. */
export function resolvePath(cwd: string[], raw: string): string[] {
  let parts: string[];
  if (raw.startsWith("~")) {
    parts = [...HOME, ...raw.slice(1).split("/")];
  } else if (raw.startsWith("/")) {
    parts = raw.split("/");
  } else {
    parts = [...cwd, ...raw.split("/")];
  }
  const out: string[] = [];
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return out;
}

export function getNode(path: string[]): Dir | string | undefined {
  let node: Dir | string = fsTree;
  for (const seg of path) {
    if (typeof node === "string") return undefined;
    node = node[seg];
    if (node === undefined) return undefined;
  }
  return node;
}

export function isDir(node: Dir | string | undefined): node is Dir {
  return typeof node === "object" && node !== null;
}

export function formatPath(path: string[]): string {
  const joined = "/" + path.join("/");
  const home = "/" + HOME.join("/");
  return joined === home
    ? "~"
    : joined.startsWith(home + "/")
      ? "~" + joined.slice(home.length)
      : joined;
}

export function listDir(node: Dir, all = false): string[] {
  return Object.keys(node)
    .filter((n) => all || !n.startsWith("."))
    .sort()
    .map((n) => (isDir(node[n]) ? `${n}/` : n));
}
