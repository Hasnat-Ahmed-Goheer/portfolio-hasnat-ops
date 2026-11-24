import type { Metadata } from "next";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";

/**
 * Per-page metadata. Next.js merges metadata SHALLOWLY: a page that sets only
 * `title` + `description` inherits the root `openGraph` / `twitter` objects
 * wholesale — so a shared /about link would show the homepage's title and
 * URL. Every page therefore sets its own openGraph + twitter here.
 *
 * Share images come from each route's `opengraph-image.tsx` (file-based
 * metadata always wins over config), so they're not set here.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  const shareTitle = `${title} — ${profile.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: shareTitle,
      description,
      url: path,
      siteName: lexicon.systemName,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
    },
  };
}

/** Per-route share copy — one source for both <meta> tags and OG cards. */
export const pages = {
  about: {
    path: "/about",
    title: "About",
    heading: "The engineer behind the console",
    description:
      "Story, skills map, and operating principles of Hasnat Ahmed Goheer — full stack engineer across Kubernetes, AI products, and FinTech.",
  },
  work: {
    path: "/work",
    title: "Work",
    heading: "Deployment registry",
    description:
      "Production systems across cloud-native infrastructure, AI products, and FinTech — Helm, Kubernetes, Next.js, NestJS, RAG.",
  },
  experience: {
    path: "/experience",
    title: "Experience",
    heading: "Career event log",
    description:
      "Six roles across every layer of the stack, 2023 to present — from Helm charts and Rancher pipelines to realtime product UIs.",
  },
  lab: {
    path: "/lab",
    title: "Lab",
    heading: "The sandbox",
    description:
      "Experiments, shader sketches, and a terminal with secrets — the playground side of hasnat.ops.",
  },
  contact: {
    path: "/contact",
    title: "Contact",
    heading: "Open a connection",
    description:
      "Hiring, collaborating, or just saying hi — reach Hasnat Ahmed Goheer directly.",
  },
} as const;

export type PageKey = keyof typeof pages;

export const metadataFor = (key: PageKey, type?: "website" | "profile") =>
  pageMetadata({ ...pages[key], type });
