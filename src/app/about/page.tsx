import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import AboutSections from "@/components/sections/AboutSections";

export const metadata: Metadata = metadataFor("about", "profile");

export default function AboutPage() {
  return <AboutSections />;
}
