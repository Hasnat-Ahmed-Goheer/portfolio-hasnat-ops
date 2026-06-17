"use client";

/**
 * Client shell mounted from the root layout: smooth scroll (Lenis driven
 * by the GSAP ticker), global terminal hotkeys, capability detection,
 * the persistent canvas, and site chrome.
 */
import { useEffect, useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { useCapabilities } from "@/lib/a11y";
import { useUiStore } from "@/stores/uiStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useConsoleStore } from "@/stores/consoleStore";
import Nav from "./Nav";
import Footer from "./Footer";
import Cursor from "./Cursor";
import ScrollProgress from "./ScrollProgress";
import HoverTip from "./HoverTip";
import Toasts from "./Toasts";
import TelemetryHud from "./TelemetryHud";
import CommandPalette from "./CommandPalette";
import BootSequence from "../terminal/BootSequence";
import Terminal from "../terminal/Terminal";

const CanvasRoot = dynamic(() => import("@/scenes/CanvasRoot"), { ssr: false });

export default function LayoutShell({ children }: { children: ReactNode }) {
  useCapabilities();
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const setOpen = useTerminalStore((s) => s.setOpen);
  const pathname = usePathname();
  const lenisRef = useRef<LenisRef>(null);

  /* GSAP ticker drives Lenis; Lenis updates ScrollTrigger */
  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);
    return () => gsap.ticker.remove(update);
  }, [reducedMotion]);

  /* global console hotkeys: ⌘K / Ctrl+K → command palette; ~ / ` → power-shell */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el?.closest("input, textarea, [contenteditable='true']");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        /* palette and shell are mutually exclusive — never stack two modals */
        useTerminalStore.getState().setOpen(false);
        useConsoleStore.getState().togglePalette();
      } else if ((e.key === "~" || e.key === "`") && !typing) {
        e.preventDefault();
        useConsoleStore.getState().setPaletteOpen(false);
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  /* route change: scroll to top, re-measure triggers */
  useEffect(() => {
    lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  const content = (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded focus:border focus:hairline focus:bg-elev focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-accent"
      >
        skip to content
      </a>
      <BootSequence />
      <CanvasRoot />
      <Nav />
      <ScrollProgress />
      <HoverTip />
      <main id="main" className="relative z-10">{children}</main>
      <Footer />
      <Terminal mode="palette" />
      <CommandPalette />
      <TelemetryHud />
      <Toasts />
      <Cursor />
      {/* mobile terminal launcher (keybinds need a keyboard) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open terminal"
        data-cursor="$_"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border hairline bg-elev/90 font-mono text-sm text-accent shadow-lg shadow-black/40 backdrop-blur md:hidden"
      >
        {">_"}
      </button>
    </>
  );

  if (reducedMotion) return content;
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.11, syncTouch: true, syncTouchLerp: 0.1, touchMultiplier: 1.5 }} ref={lenisRef}>
      {content}
    </ReactLenis>
  );
}
