import { renderPageCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getProject, projects } from "@/content/projects";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Case study — Hasnat Ahmed Goheer";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  return renderPageCard({
    path: `/work/${slug}`,
    title: p?.title ?? "Case study",
    description: p?.tagline ?? "",
    image: p?.media?.[0]?.src,
  });
}
