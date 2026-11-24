import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = metadataFor("contact");

export default function ContactPage() {
  return <ContactForm />;
}
