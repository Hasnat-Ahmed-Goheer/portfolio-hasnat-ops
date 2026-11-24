import { renderPageCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { pages } from "@/lib/seo";
import { profile } from "@/content/profile";

const page = pages.work;

export const alt = `${page.heading} — ${profile.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderPageCard({ path: page.path, title: page.heading, description: page.description });
}
