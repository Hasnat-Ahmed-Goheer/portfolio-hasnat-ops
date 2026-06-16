"use client";

/**
 * Discovery toasts: when the terminal unlocks an easter egg, pop a small
 * "achievement" card. Driven purely by terminalStore.unlocked growing —
 * the Lab badge grid tracks the same set. Auto-dismisses with a fade-out;
 * reduced-motion skips the slide (opacity only).
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useTerminalStore } from "@/stores/terminalStore";

const LABELS: Record<string, string> = {
  dotfiles: "ls -a · hidden files",
  secrets: ".secrets · classified",
  sudo: "sudo · privilege escalation",
  matrix: "matrix · wake up",
  hire: "hire · good judgment",
  sl: "sl · the train",
  top: "top · process monitor",
  ping: "ping · sub-200ms",
  neofetch: "neofetch · system info",
  kubectl: "kubectl · cluster operator",
  whoami: "whoami · identity confirmed",
  uptime: "uptime · always on",
  coffee: "coffee · 418 teapot",
  cowsay: "cowsay · moo",
  vim: "vim · no escape",
};

const HOLD_MS = 3200;

interface Toast {
  id: number;
  label: string;
  phase: "enter" | "exit";
}

let toastId = 0;

export default function Toasts() {
  const unlocked = useTerminalStore((s) => s.unlocked);
  const seen = useRef<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const primed = useRef(false);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!primed.current) {
      primed.current = true;
      unlocked.forEach((e) => seen.current.add(e));
      return;
    }
    const fresh = unlocked.filter((e) => !seen.current.has(e));
    if (!fresh.length) return;
    fresh.forEach((e) => seen.current.add(e));
    const added = fresh.map((e) => ({
      id: toastId++,
      label: LABELS[e] ?? e,
      phase: "enter" as const,
    }));
    setToasts((t) => [...t, ...added]);

    added.forEach((toast) => {
      const timer = setTimeout(() => {
        timers.current.delete(toast.id);
        setToasts((t) =>
          t.map((x) => (x.id === toast.id ? { ...x, phase: "exit" } : x))
        );
      }, HOLD_MS);
      timers.current.set(toast.id, timer);
    });

    return () => {
      added.forEach((toast) => {
        const t = timers.current.get(toast.id);
        if (t) { clearTimeout(t); timers.current.delete(toast.id); }
      });
    };
  }, [unlocked]);

  const handleAnimEnd = useCallback((id: number, animName: string) => {
    if (animName === "toast-out") {
      setToasts((t) => t.filter((x) => x.id !== id));
    }
  }, []);

  if (!toasts.length) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-5 z-[55] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${t.phase === "exit" ? "toast-out" : "toast-in"} flex items-center gap-2 rounded-lg border border-[color:var(--accent2)]/40 bg-elev/95 px-3.5 py-2.5 font-mono text-xs shadow-lg shadow-black/40`}
          onAnimationEnd={(e) => handleAnimEnd(t.id, e.animationName)}
        >
          <span className="text-[color:var(--accent2)]">★</span>
          <span className="text-muted">unlocked</span>
          <span className="text-text">{t.label}</span>
        </div>
      ))}
    </div>
  );
}
