import type { Metadata } from "next";
import AboutSections from "@/components/sections/AboutSections";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineer behind the console — story, skills map, and operating principles of Hasnat Ahmed.",
};

export default function AboutPage() {
  return <AboutSections />;
}
