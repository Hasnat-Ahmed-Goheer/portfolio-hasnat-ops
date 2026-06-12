import type { Metadata } from "next";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Open a connection — contact Hasnat Ahmed.",
};

export default function ContactPage() {
  return <ContactForm />;
}
