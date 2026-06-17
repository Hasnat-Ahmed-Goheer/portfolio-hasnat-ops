import Link from "next/link";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import TelemetryStrip from "./TelemetryStrip";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t hairline">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-8 font-mono text-xs text-muted">
        <span className="text-text/70">{lexicon.footerEnd}</span>
        <TelemetryStrip />
        <span className="hidden sm:inline">⌘K to jump · ` for the shell</span>
        <div className="ml-auto flex gap-4">
          {profile.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              {s.label}
            </a>
          ))}
          <Link href={profile.resumeUrl} className="hover:text-accent">
            Resume
          </Link>
        </div>
      </div>
    </footer>
  );
}
