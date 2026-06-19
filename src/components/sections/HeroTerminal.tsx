"use client";

/**
 * HeroTerminal — a display-only, auto-typing shell that idles in the hero so
 * the landing reads as a live, running system rather than styled prose (the
 * real interactive shell is `~`). It loops the scripted `heroSession`: each
 * command types out char-by-char, then its output lines stream in, then it
 * holds and restarts.
 *
 * - aria-hidden + pointer-events-none: it's decorative flavour (screen readers
 *   get the real bio), and it must let cursor magnetism reach the canvas behind.
 * - Reduced motion: renders the full session statically, no typing loop.
 * - Fixed height + overflow-hidden so streaming lines never shift the hero.
 */
import { useEffect, useRef, useState } from "react";
import { heroSession, lexicon } from "@/config/console";

type Line = { text: string; cmd?: boolean };

export default function HeroTerminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [done, setDone] = useState(false); // reduced-motion static render

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const all: Line[] = [];
      for (const e of heroSession) {
        all.push({ text: e.cmd, cmd: true });
        for (const o of e.out) all.push({ text: o });
      }
      setLines(all);
      setDone(true);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wait = (ms: number) =>
      new Promise<void>((r) => {
        timer = setTimeout(r, ms);
      });

    async function run() {
      while (!cancelled) {
        setLines([]);
        setTyping("");
        for (const e of heroSession) {
          for (let i = 1; i <= e.cmd.length; i++) {
            if (cancelled) return;
            setTyping(e.cmd.slice(0, i));
            await wait(38);
          }
          await wait(260);
          if (cancelled) return;
          setLines((ls) => [...ls, { text: e.cmd, cmd: true }]);
          setTyping("");
          for (const o of e.out) {
            if (cancelled) return;
            await wait(150);
            setLines((ls) => [...ls, { text: o }]);
          }
          await wait(900);
        }
        await wait(2400); // hold the full session, then loop
      }
    }
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none w-72 overflow-hidden rounded-lg border hairline bg-elev/70 p-3 font-mono text-[11px] leading-relaxed shadow-2xl shadow-black/40 backdrop-blur-sm"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-ok" />
        <span>{lexicon.systemName} · live</span>
      </div>
      {/* fits the full 8-line session at its peak (3 cmds + their output) so
          the last `uptime` line never clips before the loop restarts */}
      <div className="h-[150px]">
        {lines.map((l, i) =>
          l.cmd ? (
            <div key={i} className="truncate text-text/90">
              <span className="text-accent">{lexicon.prompt}</span> {l.text}
            </div>
          ) : (
            <div key={i} className="truncate text-muted">
              {l.text}
            </div>
          )
        )}
        {!done && typing !== "" && (
          <div className="truncate text-text/90">
            <span className="text-accent">{lexicon.prompt}</span> {typing}
            <span className="caret" />
          </div>
        )}
      </div>
    </div>
  );
}
