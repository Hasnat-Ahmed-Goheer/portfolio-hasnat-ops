"use client";

/**
 * The 3-in-1 terminal (roles 2 & 3): global command palette + inline
 * lab shell. Boot (role 1) shares the visual language via BootSequence.
 * Fully keyboard-operable: ↑/↓ history, Tab completion, → accepts the
 * first suggestion, ESC closes.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { lexicon } from "@/config/console";
import { useTerminalStore, type LineKind } from "@/stores/terminalStore";
import { execute, complete, type CmdCtx } from "@/lib/commands";
import { formatPath } from "@/lib/fakeFs";
import { playKey, playNav } from "@/lib/audio";

const kindClass: Record<LineKind, string> = {
  in: "text-text",
  out: "text-text/90",
  ok: "text-ok",
  err: "text-danger",
  dim: "text-muted",
};

export default function Terminal({ mode }: { mode: "palette" | "inline" }) {
  const router = useRouter();
  const open = useTerminalStore((s) => s.open);
  const lines = useTerminalStore((s) => s.lines);
  const cwd = useTerminalStore((s) => s.cwd);
  const setOpen = useTerminalStore((s) => s.setOpen);
  const push = useTerminalStore((s) => s.push);
  const navHistory = useTerminalStore((s) => s.navHistory);

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<Element | null>(null);

  const isPalette = mode === "palette";
  const visible = isPalette ? open : true;

  const ctx: CmdCtx = {
    navigate: (p) => router.push(p),
    close: () => isPalette && setOpen(false),
  };

  /* greeting on first ever open */
  useEffect(() => {
    if (visible && useTerminalStore.getState().lines.length === 0) {
      push(`${lexicon.systemName} — interactive console`, "ok");
      push("run `help` to list commands. ESC closes.", "dim");
    }
  }, [visible, push]);

  /* focus management: trap focus in palette, restore on close */
  useEffect(() => {
    if (isPalette && open) {
      prevFocus.current = document.activeElement;
      inputRef.current?.focus();
    } else if (isPalette && !open && prevFocus.current instanceof HTMLElement) {
      prevFocus.current.focus();
    }
  }, [isPalette, open]);

  /* keep scrolled to bottom */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const onChange = useCallback((v: string) => {
    setInput(v);
    setSuggestions(v.trim() ? complete(v).slice(0, 6) : []);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    /* ambient feedback: a tick per character, a confirming note on submit */
    if (e.key.length === 1) playKey();
    if (e.key === "Enter") {
      playNav();
      execute(input, ctx);
      setInput("");
      setSuggestions([]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      onChange(navHistory(-1, input));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onChange(navHistory(1, input));
    } else if (e.key === "Tab") {
      e.preventDefault();
      const opts = complete(input);
      if (opts.length === 1) {
        const parts = input.split(/\s+/);
        parts[parts.length - 1] = opts[0];
        onChange(parts.join(" ") + (opts[0].endsWith("/") ? "" : " "));
      } else if (opts.length > 1) {
        push(opts.join("   "), "dim");
      }
    } else if (
      e.key === "ArrowRight" &&
      suggestions[0] &&
      e.currentTarget.selectionStart === input.length
    ) {
      /* → accepts the first suggestion (shell-style autosuggest) */
      e.preventDefault();
      const parts = input.split(/\s+/);
      parts[parts.length - 1] = suggestions[0];
      onChange(parts.join(" ") + (suggestions[0].endsWith("/") ? "" : " "));
    } else if (e.key === "Escape" && isPalette) {
      setOpen(false);
    }
  };

  if (!visible) return null;

  const panel = (
    <div
      role={isPalette ? "dialog" : "group"}
      aria-modal={isPalette || undefined}
      aria-label="Command terminal"
      className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border hairline bg-elev/95 font-mono text-[13px] shadow-2xl shadow-black/60"
      onKeyDown={(e) => e.key === "Escape" && isPalette && setOpen(false)}
    >
      <div className="flex items-center gap-2 border-b hairline px-4 py-2 text-xs text-muted">
        <span className="status-dot inline-block h-2 w-2 rounded-full bg-ok" />
        {lexicon.systemName} — {formatPath(cwd)}
        {isPalette && (
          <button
            onClick={() => setOpen(false)}
            className="ml-auto rounded px-2 py-0.5 text-muted hover:text-text"
            aria-label="Close terminal"
          >
            esc ✕
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        aria-live="polite"
        /* data-lenis-prevent: without it Lenis swallows wheel events and
           scrolls the page instead of the terminal buffer */
        data-lenis-prevent
        className="h-72 overflow-y-auto overscroll-contain px-4 py-3 leading-relaxed"
      >
        {lines.map((l) => (
          <div key={l.id} className={`whitespace-pre-wrap ${kindClass[l.kind]}`}>
            {l.text}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="border-t hairline px-4 py-1 text-xs text-muted">
          <span className="text-accent">→ </span>
          {suggestions.join("   ")}
        </div>
      )}

      <div className="flex items-center gap-2 border-t hairline px-4 py-3">
        <label htmlFor={`term-${mode}`} className="text-accent">
          {lexicon.prompt}
        </label>
        <input
          ref={inputRef}
          id={`term-${mode}`}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent text-text outline-none placeholder:text-muted/50"
          placeholder="help"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>
    </div>
  );

  if (!isPalette) return panel;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        aria-label="Close terminal"
        className="absolute inset-0 cursor-default bg-black/70"
        onClick={() => setOpen(false)}
        tabIndex={-1}
      />
      <div className="relative w-full max-w-2xl">{panel}</div>
    </div>
  );
}
