"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { useConsoleStore } from "@/stores/consoleStore";
import { useUiStore } from "@/stores/uiStore";

const links = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/work", label: "work" },
  { href: "/experience", label: "experience" },
  { href: "/lab", label: "lab" },
  { href: "/contact", label: "contact" },
];

/* warm the lazy 3D chunk for the page the user is about to visit */
function prefetchScene(href: string) {
  if (href === "/about" || href === "/lab")
    void import("@/scenes/latent/LatentScene");
  else if (href === "/work" || href === "/experience")
    void import("@/scenes/pipeline/PipelineScene");
  else void import("@/scenes/cluster/ClusterScene");
}

export default function Nav() {
  const pathname = usePathname();
  const togglePalette = useConsoleStore((s) => s.togglePalette);
  const booted = useUiStore((s) => s.booted);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-opacity duration-700 motion-reduce:transition-none ${
        booted ? "opacity-100" : "opacity-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4 font-mono text-xs"
      >
        <Link href="/" className="flex items-center gap-2 text-text">
          <span className="status-dot inline-block h-2 w-2 rounded-full bg-ok" />
          <span className="tracking-wider">{lexicon.systemName}</span>
          <span className="hidden text-muted sm:inline">
            · {profile.availability}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1 overflow-x-auto">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => prefetchScene(l.href)}
                onFocus={() => prefetchScene(l.href)}
                aria-current={active ? "page" : undefined}
                className={`rounded px-2.5 py-1.5 transition-colors ${
                  active
                    ? "text-accent"
                    : "text-muted hover:text-text"
                }`}
              >
                {active ? `[${l.label}]` : l.label}
              </Link>
            );
          })}
          <button
            onClick={togglePalette}
            className="ml-2 hidden items-center gap-1.5 rounded border hairline px-2.5 py-1.5 text-muted transition-colors hover:border-accent/40 hover:text-text md:flex"
            aria-label="Open command palette (Cmd+K)"
          >
            <span className="text-accent">⌘K</span> command
          </button>
        </div>
      </nav>
    </header>
  );
}
