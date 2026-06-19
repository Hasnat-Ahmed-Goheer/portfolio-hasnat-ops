import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import LayoutShell from "@/components/chrome/LayoutShell";
import { profile } from "@/content/profile";
import { lexicon } from "@/config/console";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hasnat.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${lexicon.systemName} — ${profile.name}, ${profile.role}`,
    template: `%s — ${lexicon.systemName}`,
  },
  description: profile.shortBio,
  alternates: { canonical: "/" },
  keywords: [
    "Full Stack Engineer",
    "Kubernetes",
    "Helm",
    "Next.js",
    "NestJS",
    "AI",
    "RAG",
    "FinTech",
  ],
  openGraph: {
    title: `${lexicon.systemName} — ${profile.name}`,
    description: profile.shortBio,
    url: SITE,
    siteName: lexicon.systemName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${lexicon.systemName} — ${profile.name}`,
    description: profile.shortBio,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: profile.email,
  url: SITE,
  sameAs: profile.socials
    .filter((s) => s.href.startsWith("http"))
    .map((s) => s.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="ops"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* first-paint shield (see #boot-cover in globals.css): present in the
            SSR HTML so frame 0 is dark, never the bare page */}
        {/* suppressHydrationWarning: the inline script below hides this node
            pre-hydration for returning/reduced-motion visitors. Hiding (not
            removing) keeps the DOM structure identical to the SSR HTML so React
            hydrates cleanly; this flag tolerates the added style attribute. */}
        <div id="boot-cover" aria-hidden="true" suppressHydrationWarning />
        {/* runs before paint: returning-in-session or reduced-motion visitors
            skip the boot, so hide the shield immediately for instant content.
            display:none rather than remove() — removing the node before React
            hydrates desynced the server/client tree (recoverable hydration
            error); BootSequence removes it for real post-hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('ops-booted')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches){var c=document.getElementById('boot-cover');if(c)c.style.display='none';}}catch(e){}",
          }}
        />
        <LayoutShell>{children}</LayoutShell>
        <SpeedInsights />
      </body>
    </html>
  );
}
