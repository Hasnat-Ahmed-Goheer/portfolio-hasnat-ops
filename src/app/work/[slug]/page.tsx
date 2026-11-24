import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import { profile } from "@/content/profile";
import CaseStudy from "@/components/sections/CaseStudy";
import { pageMetadata } from "@/lib/seo";

import { SITE_URL as SITE } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  /* share image: ./opengraph-image.tsx renders a branded card with the case
     study's own screenshot, so each project gets a distinct link preview */
  return pageMetadata({
    title: p.title,
    description: p.tagline,
    path: `/work/${slug}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  /* structured data: the case study as a CreativeWork by Hasnat, plus a
     breadcrumb trail — makes each deployment eligible for richer search
     results and ties authorship/stack/screenshots together for crawlers */
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.tagline,
    abstract: project.problem,
    keywords: project.stack.join(", "),
    url: `${SITE}/work/${project.slug}`,
    image: (project.media ?? []).map((m) => `${SITE}${m.src}`),
    author: { "@type": "Person", name: profile.name, url: SITE },
    ...(project.links.repo || project.links.live
      ? { sameAs: [project.links.live, project.links.repo].filter(Boolean) }
      : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE}/work` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${SITE}/work/${project.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CaseStudy project={project} />
    </>
  );
}
