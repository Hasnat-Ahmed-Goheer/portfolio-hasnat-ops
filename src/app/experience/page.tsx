import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";

export const metadata: Metadata = metadataFor("experience");

export default function ExperiencePage() {
  return <ExperienceTimeline />;
}
