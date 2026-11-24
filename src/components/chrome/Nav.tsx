"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { useConsoleStore } from "@/stores/consoleStore";
import { useUiStore } from "@/stores/uiStore";
import { click as soundClick } from "@/lib/sound";

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
  /* no canvas on the "off" tier, so nothing to warm */
  if (useUiStore.getState().gpuTier === "off") return;
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* frosted bar once the page scrolls: without it, headings and cards
     scrolled straight under the logo and links (no background at all) */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close the mobile menu on navigation and on Escape */
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const solid = scrolled || menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[opacity,background-color,border-color] duration-500 motion-reduce:transition-none ${
        booted ? "opacity-100" : "opacity-0"
      } ${
        solid
          ? "border-[color:var(--line)] bg-bg/75 backdrop-blur-md"
          : "border-transparent"
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

        {/* desktop / tablet: inline links */}
        <div className="ml-auto hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onMouseEnter={() => prefetchScene(l.href)}
                onFocus={() => prefetchScene(l.href)}
                onClick={() => soundClick()}
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
            onClick={() => {
              soundClick();
              togglePalette();
            }}
            className="ml-2 hidden items-center gap-1.5 rounded border hairline px-2.5 py-1.5 text-muted transition-colors hover:border-accent/40 hover:text-text md:flex"
            aria-label="Open command palette (Cmd+K)"
          >
            <span className="text-accent">⌘K</span> command
          </button>
        </div>

        {/* phone: the six links did not fit ("experience" was cut in half
            and the rest hid behind a sideways scroll), so they fold into a
            menu */}
        <button
          type="button"
          onClick={() => {
            soundClick();
            setMenuOpen((o) => !o);
          }}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="ml-auto flex items-center gap-2 rounded border hairline px-3 py-1.5 text-muted transition-colors hover:text-text sm:hidden"
        >
          <span className="text-accent">
            {links.find((l) => isActive(l.href))?.label ?? "menu"}
          </span>
          <span aria-hidden="true">{menuOpen ? "×" : "≡"}</span>
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t hairline px-5 pb-5 pt-2 font-mono text-sm sm:hidden"
        >
          <ul className="flex flex-col">
            {links.map((l, i) => {
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => soundClick()}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-baseline gap-3 border-b hairline py-3 ${
                      active ? "text-accent" : "text-text/85"
                    }`}
                  >
                    <span className="text-[10px] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {active ? `[${l.label}]` : l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
