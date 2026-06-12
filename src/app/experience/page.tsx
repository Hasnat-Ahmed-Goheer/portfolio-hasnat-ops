import type { Metadata } from "next";
import ExperienceTimeline from "@/components/sections/ExperienceTimeline";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Career event log — six roles across every layer of the stack, 2023 to present.",
};

export default function ExperiencePage() {
  return <ExperienceTimeline />;
}
