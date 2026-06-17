import type { Metadata } from "next";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
  description: "Open a connection — contact Hasnat Ahmed.",
};

export default function ContactPage() {
  return <ContactForm />;
}
