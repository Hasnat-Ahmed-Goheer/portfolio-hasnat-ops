import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/content/projects";
import { profile } from "@/content/profile";
import CaseStudy from "@/components/sections/CaseStudy";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hasnat.dev";

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
  const url = `/work/${slug}`;
  /* lead the case study's own screenshot as the share image so each project
     gets a distinct, on-brand link preview (falls back to the site OG image) */
  const images = p.media?.length ? p.media.map((m) => m.src) : undefined;
  return {
    title: p.title,
    description: p.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.tagline,
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.tagline,
      images,
    },
  };
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
