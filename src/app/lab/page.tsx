import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import LabSections from "@/components/sections/LabSections";

export const metadata: Metadata = metadataFor("lab");

export default function LabPage() {
  return <LabSections />;
}
