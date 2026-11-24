import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import LayoutShell from "@/components/chrome/LayoutShell";
import { profile } from "@/content/profile";
import { lexicon } from "@/config/console";
import { experience } from "@/content/experience";
import { skillGroups } from "@/content/skills";
import { SITE_URL } from "@/lib/site";

const SITE = SITE_URL;
const DEFAULT_TITLE = `${profile.name} — ${profile.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${profile.name}`,
  },
  description: profile.shortBio,
  applicationName: lexicon.systemName,
  authors: [{ name: profile.name, url: SITE }],
  creator: profile.name,
  publisher: profile.name,
  alternates: { canonical: "/" },
  keywords: [
    profile.name,
    "Hasnat Ahmed",
    "Full Stack Software Engineer",
    "Full Stack Developer Pakistan",
    "Software Engineer Islamabad",
    "Kubernetes",
    "Helm",
    "Rancher",
    "Next.js",
    "React",
    "NestJS",
    "FastAPI",
    "AI",
    "RAG",
    "FinTech",
    "Portfolio",
  ],
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    title: DEFAULT_TITLE,
    description: profile.shortBio,
    url: "/",
    siteName: lexicon.systemName,
    locale: "en_US",
    firstName: profile.name.split(" ")[0],
    lastName: profile.name.split(" ").slice(1).join(" "),
    username: profile.handle,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: profile.shortBio,
  },
  formatDetection: { telephone: false, address: false, email: false },
  /* Google Search Console: set GOOGLE_SITE_VERIFICATION to the meta-tag token */
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#0a0e14",
  colorScheme: "dark",
};

/* structured data — who this site is about, and the site itself. Lets Google
   build a rich result / knowledge panel for searches on the name. */
const sameAs = profile.socials
  .filter((s) => s.href.startsWith("http"))
  .map((s) => s.href);

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: profile.name,
      alternateName: "Hasnat Ahmed",
      jobTitle: profile.role,
      description: profile.shortBio,
      email: `mailto:${profile.email}`,
      url: SITE,
      image: `${SITE}/opengraph-image`,
      sameAs,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Islamabad",
        addressCountry: "PK",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: profile.education.institution,
      },
      worksFor: {
        "@type": "Organization",
        name: experience[0].company.split(" — ")[0],
      },
      knowsAbout: skillGroups.flatMap((g) => g.skills),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: lexicon.systemName,
      description: profile.shortBio,
      inLanguage: "en",
      author: { "@id": `${SITE}/#person` },
      publisher: { "@id": `${SITE}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}/#profilepage`,
      url: SITE,
      name: DEFAULT_TITLE,
      isPartOf: { "@id": `${SITE}/#website` },
      mainEntity: { "@id": `${SITE}/#person` },
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
        {/* the /_vercel/speed-insights script only exists on Vercel; elsewhere
            (Railway, Docker, local) it 404s and logs a console error */}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
