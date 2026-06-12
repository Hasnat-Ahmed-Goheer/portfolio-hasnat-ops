"use client";

/**
 * Terminal role 1: the boot sequence. Plays once per session on first
 * load, skippable by any key/click, skipped entirely under reduced motion.
 */
import { useEffect, useRef, useState } from "react";
import { bootLines, lexicon } from "@/config/console";
import { useUiStore } from "@/stores/uiStore";

const SESSION_KEY = "ops-booted";

export default function BootSequence() {
  const setBooted = useUiStore((s) => s.setBooted);
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const [mounted, setMounted] = useState(false);
  const [skipBoot, setSkipBoot] = useState(true); // resolved after mount
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";
    setSkipBoot(seen);
    if (seen) setBooted(true);
  }, [setBooted]);

  /* reduced motion: never play */
  useEffect(() => {
    if (mounted && reducedMotion && !finished.current) {
      finished.current = true;
      sessionStorage.setItem(SESSION_KEY, "1");
      setSkipBoot(true);
      setBooted(true);
    }
  }, [mounted, reducedMotion, setBooted]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    sessionStorage.setItem(SESSION_KEY, "1");
    setFading(true);
    setTimeout(() => {
      setBooted(true);
      setSkipBoot(true);
    }, 550);
  };

  /* typed line cadence */
  useEffect(() => {
    if (!mounted || skipBoot) return;
    if (count >= bootLines.length) {
      const t = setTimeout(finish, 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 350 : 230);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, skipBoot, count]);

  /* skip on any key / click */
  useEffect(() => {
    if (!mounted || skipBoot) return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, skipBoot]);

  if (!mounted || skipBoot) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-bg transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-xl px-6 font-mono text-sm leading-relaxed">
        {bootLines.slice(0, count).map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("[ ok ]")
                ? "text-ok"
                : i === 0
                  ? "text-accent"
                  : "text-text/85"
            }
          >
            {line}
          </div>
        ))}
        <div className="caret text-text/85" />
        <button
          onClick={finish}
          className="mt-8 text-xs text-muted hover:text-text"
        >
          press any key to skip — {lexicon.systemName}
        </button>
      </div>
    </div>
  );
}
