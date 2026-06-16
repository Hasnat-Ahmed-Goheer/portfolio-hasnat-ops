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
  const sceneReady = useUiStore((s) => s.sceneReady);
  const [mounted, setMounted] = useState(false);
  const [skipBoot, setSkipBoot] = useState(true); // resolved after mount
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);
  const finished = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem(SESSION_KEY) === "1";
    setSkipBoot(seen);
    if (seen) setBooted(true);
  }, [setBooted]);

  /* drop the server-rendered first-paint shield once we've mounted: by now the
     boot panel (new visitor) or the real content (returning) is committed
     underneath, so removing the identical-dark shield reveals it seamlessly —
     no bare-page flash before "init" */
  useEffect(() => {
    if (mounted) document.getElementById("boot-cover")?.remove();
  }, [mounted, skipBoot]);

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
    /* reveal the chrome + hero WITH the panel fade (not 550ms after) so the
       site arrives as one beat instead of a dead gap; the panel only unmounts
       once its fade-out has finished */
    setBooted(true);
    fadeTimer.current = setTimeout(() => setSkipBoot(true), 550);
  };
  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  /* typed line cadence */
  useEffect(() => {
    if (!mounted || skipBoot) return;
    if (count >= bootLines.length) return; // typed out; reveal handled below
    const t = setTimeout(() => setCount((c) => c + 1), count === 0 ? 350 : 230);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, skipBoot, count]);

  /* once typed out, hold the boot screen until the scene is actually warm,
     then lift — so we reveal a rendered scene, not a blank canvas. sceneReady
     is the single readiness source: CanvasRoot guarantees it flips (its 2s
     fail-safe, or instantly on the no-canvas tier), so no separate cap here */
  const linesDone = count >= bootLines.length;
  useEffect(() => {
    if (!mounted || skipBoot || !linesDone || !sceneReady) return;
    const t = setTimeout(finish, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, skipBoot, linesDone, sceneReady]);

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
        {linesDone &&
          (sceneReady ? (
            <div className="text-ok">[ ok ] render online</div>
          ) : (
            <div className="text-accent2">
              [ .. ] warming render pipeline<span className="caret" />
            </div>
          ))}
        {!linesDone && <div className="caret text-text/85" />}
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
