"use client";

/** Single registration point for GSAP plugins — import gsap from here. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
}

export { gsap, ScrollTrigger, useGSAP };

/** Split a string into word <span>s for staggered reveals (SplitText-lite). */
export function splitWords(text: string): string[] {
  return text.split(" ");
}
