import type { Metadata } from "next";
import WorkIndex from "@/components/sections/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  alternates: { canonical: "/work" },
  description:
    "The deployment registry — production systems across cloud-native infrastructure, AI products, and FinTech.",
};

export default function WorkPage() {
  return <WorkIndex />;
}
