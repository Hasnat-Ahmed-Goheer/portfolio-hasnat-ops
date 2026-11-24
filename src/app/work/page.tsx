import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import WorkIndex from "@/components/sections/WorkIndex";

export const metadata: Metadata = metadataFor("work");

export default function WorkPage() {
  return <WorkIndex />;
}
