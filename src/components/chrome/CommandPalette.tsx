"use client";

/**
 * ⌘K command palette — a list-based, arrow-navigable quick switcher (distinct
 * from the typed power-shell on `~`/backtick). Fuzzy-filters a flat action set
 * (routes, projects, themes, résumé, terminal) and runs the selected action.
 * Fully keyboard-operable; reuses the router and theme engine, traps focus
 * while open, and restores it to the trigger on close.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { themes } from "@/config/theme";
import { useConsoleStore } from "@/stores/consoleStore";
import { useTerminalStore } from "@/stores/terminalStore";
import { useUiStore } from "@/stores/uiStore";
import { trapTab } from "@/lib/focusTrap";
import { startTour } from "@/lib/tour";
import { tick as soundTick, confirm as soundConfirm } from "@/lib/sound";

interface Action {
  id: string;
  label: string;
  hint: string;
  group: string;
  keywords?: string;
  run: () => void;
}

/** subsequence fuzzy match — returns a score (lower = better) or -1 if no match */
function fuzzy(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let ti = 0;
  let score = 0;
  let prev = -1;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return -1;
    /* contiguous matches score better than scattered ones */
    score += prev === -1 ? found : found - prev - 1;
    prev = found;
    ti = found + 1;
  }
  return score;
}

export default function CommandPalette() {
  const router = useRouter();
  const open = useConsoleStore((s) => s.paletteOpen);
  const setPaletteOpen = useConsoleStore((s) => s.setPaletteOpen);
  const setTheme = useUiStore((s) => s.setTheme);
  const theme = useUiStore((s) => s.theme);
  const openTerminal = useTerminalStore((s) => s.setOpen);
  const soundEnabled = useConsoleStore((s) => s.soundEnabled);
  const toggleSound = useConsoleStore((s) => s.toggleSound);

  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const lastTick = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<Element | null>(null);

  const close = useCallback(() => setPaletteOpen(false), [setPaletteOpen]);

  const actions = useMemo<Action[]>(() => {
    const go = (path: string) => () => {
      close();
      router.push(path);
    };
    const list: Action[] = [
      { id: "go-home", label: "Home", hint: "/", group: "Navigate", keywords: "cluster index", run: go("/") },
      { id: "go-about", label: "About", hint: "/about", group: "Navigate", keywords: "operator skills latent", run: go("/about") },
      { id: "go-work", label: "Work", hint: "/work", group: "Navigate", keywords: "projects deployments registry", run: go("/work") },
      { id: "go-exp", label: "Experience", hint: "/experience", group: "Navigate", keywords: "eventlog timeline", run: go("/experience") },
      { id: "go-lab", label: "Lab", hint: "/lab", group: "Navigate", keywords: "experiments", run: go("/lab") },
      { id: "go-contact", label: "Contact", hint: "/contact", group: "Navigate", keywords: "uplink email hire", run: go("/contact") },
    ];
    for (const p of projects) {
      list.push({
        id: `open-${p.slug}`,
        label: p.title,
        hint: "open",
        group: "Deployments",
        keywords: `${p.slug} ${p.stack.join(" ")}`,
        run: go(`/work/${p.slug}`),
      });
    }
    for (const name of Object.keys(themes)) {
      list.push({
        id: `theme-${name}`,
        label: `Theme: ${name}`,
        hint: theme === name ? "active" : "switch",
        group: "Display",
        keywords: "color palette appearance",
        run: () => {
          setTheme(name);
          close();
        },
      });
    }
    list.push({
      id: "run-tour",
      label: "Run guided tour",
      hint: "demo",
      group: "System",
      keywords: "tour demo walkthrough showcase intro start",
      run: () => {
        close();
        startTour({ navigate: (p) => router.push(p), close });
      },
    });
    list.push({
      id: "toggle-sound",
      label: soundEnabled ? "Mute console sound" : "Unmute console sound",
      hint: soundEnabled ? "on" : "off",
      group: "System",
      keywords: "sound audio mute unmute volume uplink tones",
      run: () => {
        /* don't close() — keep the palette so the label flips visibly and the
           toggle itself is the gesture that unlocks the AudioContext */
        toggleSound();
      },
    });
    list.push({
      id: "open-terminal",
      label: "Open terminal",
      hint: "`",
      group: "System",
      keywords: "shell console command line",
      run: () => {
        close();
        openTerminal(true);
      },
    });
    list.push({
      id: "resume",
      label: "Download résumé",
      hint: "pdf",
      group: "System",
      keywords: "cv hire pdf",
      run: () => {
        close();
        window.open(profile.resumeUrl, "_blank", "noopener");
      },
    });
    return list;
  }, [router, close, theme, setTheme, openTerminal, soundEnabled, toggleSound]);

  /* run an action with a soft confirm cue (no-op when muted). The sound-toggle
     itself doesn't double-beep: turning ON, the toggle's own gesture unlocks
     the context but this fires before the engine's `enabled` flips; turning
     OFF is silent by definition. */
  const runAction = useCallback((a: Action) => {
    if (a.id !== "toggle-sound") soundConfirm();
    a.run();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return actions;
    return actions
      .map((a) => ({ a, s: fuzzy(query.trim(), `${a.label} ${a.keywords ?? ""}`) }))
      .filter((r) => r.s >= 0)
      .sort((x, y) => x.s - y.s)
      .map((r) => r.a);
  }, [actions, query]);

  /* clamp selection when the result set shrinks */
  useEffect(() => {
    setSel((s) => Math.min(s, Math.max(0, results.length - 1)));
  }, [results.length]);

  /* open/close side effects: stash the trigger, reset query, focus the input;
     on close restore focus to the trigger — but ONLY if focus was orphaned to
     <body>. An action that hands off to another surface (e.g. "Open terminal"
     focuses the terminal input) must keep that focus, so we never yank it back. */
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      setQuery("");
      setSel(0);
      inputRef.current?.focus();
    } else if (
      prevFocus.current instanceof HTMLElement &&
      (document.activeElement === document.body || document.activeElement === null)
    ) {
      prevFocus.current.focus();
    }
  }, [open]);

  /* keep the active option scrolled into view */
  useEffect(() => {
    const el = listRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [sel, results]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    /* soft, debounced keystroke tick on printable input (no-op when muted) */
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = e.timeStamp || performance.now();
      if (now - lastTick.current > 45) {
        lastTick.current = now;
        soundTick();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[sel]) runAction(results[sel]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  /* group consecutive results under headers while keeping a flat index */
  let flat = -1;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button
        aria-label="Close command palette"
        className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-sm"
        onClick={close}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(e) => trapTab(e, dialogRef.current)}
        className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-lg border hairline bg-elev/95 font-mono shadow-2xl shadow-black/60 backdrop-blur"
      >
        <div className="flex items-center gap-2 border-b hairline px-4 py-3">
          <span className="text-accent">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="cmdk-list"
            aria-activedescendant={results[sel] ? `cmdk-${results[sel].id}` : undefined}
            aria-label="Search commands"
            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted/50"
            placeholder="jump to a page, project, or command…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded border hairline px-1.5 py-0.5 text-[10px] text-muted sm:block">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id="cmdk-list"
          role="listbox"
          aria-label="Commands"
          data-lenis-prevent
          className="max-h-[52vh] overflow-y-auto overscroll-contain py-2"
        >
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-muted">
              no matches for &ldquo;{query}&rdquo;
            </p>
          )}
          {results.map((a) => {
            flat++;
            const header = a.group !== lastGroup ? a.group : null;
            lastGroup = a.group;
            const active = flat === sel;
            const idx = flat;
            return (
              <div key={a.id}>
                {header && (
                  <p className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-[0.2em] text-muted/60">
                    {header}
                  </p>
                )}
                <button
                  id={`cmdk-${a.id}`}
                  role="option"
                  aria-selected={active}
                  onMouseMove={() => setSel(idx)}
                  onClick={() => runAction(a)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    active ? "bg-accent/10 text-text" : "text-text/80"
                  }`}
                >
                  <span
                    className={`h-1 w-1 shrink-0 rounded-full ${
                      active ? "bg-accent" : "bg-transparent"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                  <span className="shrink-0 text-[10px] text-muted">{a.hint}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 border-t hairline px-4 py-2 text-[10px] text-muted">
          <span>↑↓ move</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span className="ml-auto hidden sm:inline">{lexicon.systemName}</span>
        </div>
      </div>
    </div>
  );
}
