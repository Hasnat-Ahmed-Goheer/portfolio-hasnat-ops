"use client";

/**
 * Route-transition boundary. The transition itself lives in <RouteCurtain/>
 * (a fixed command-panel overlay that covers, then slides up to reveal the
 * new route). This wrapper stays motion-free on purpose: it is an ancestor of
 * every pinned ScrollTrigger section, and any inline transform/filter here
 * becomes the containing block for position: fixed, silently breaking all
 * pins (CLAUDE.md pitfall #1). The curtain is a SIBLING of {children}, so its
 * transform never reaches the pins; it owns its own clearProps + refresh.
 */
import { type ReactNode } from "react";
import RouteCurtain from "@/components/chrome/RouteCurtain";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div>
      <RouteCurtain />
      {children}
    </div>
  );
}
