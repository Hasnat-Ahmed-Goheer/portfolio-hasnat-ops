import type { Metadata } from "next";
import LabSections from "@/components/sections/LabSections";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "The sandbox — experiments, shader sketches, and a terminal with secrets.",
};

export default function LabPage() {
  return <LabSections />;
}
