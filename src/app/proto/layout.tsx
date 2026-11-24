import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Archivo } from "next/font/google";

/*
 * Redesign prototypes. Three directions for the home page, each self-contained
 * and rendered outside the current design's shell (LayoutShell skips /proto).
 * Not for search engines: noindex here, and robots.ts disallows /proto.
 */
export const metadata: Metadata = {
  title: "Redesign prototypes",
  robots: { index: false, follow: false },
};

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

/* variable width axis: prototype C sets condensed/expanded type with it */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export default function ProtoLayout({ children }: { children: ReactNode }) {
  return <div className={`${serif.variable} ${archivo.variable}`}>{children}</div>;
}
