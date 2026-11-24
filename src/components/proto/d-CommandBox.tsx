"use client";

/**
 * Prototype D hero: a ⌘K-style command menu listing the projects. Typing
 * filters the list, ↑/↓ move the selection, Enter opens it. Pressing ⌘K or
 * Ctrl+K anywhere on the page focuses the box. Every row is also a normal link.
 */
import { useEffect, useMemo, useRef, useState } from "react";

export interface CommandItem {
  slug: string;
  title: string;
  hint: string;
  status: "running" | "archived";
}

export default function CommandBox({ items }: { items: CommandItem[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => `${i.title} ${i.hint}`.toLowerCase().includes(t));
  }, [q, items]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(shown.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && shown[sel]) {
      window.location.href = `/work/${shown[sel].slug}`;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4">
        <span aria-hidden="true" className="text-[#8a8a93]">⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search projects, stacks…"
          aria-label="Search projects"
          role="combobox"
          aria-expanded="true"
          aria-controls="d-cmd-list"
          aria-activedescendant={shown[sel] ? `d-cmd-${shown[sel].slug}` : undefined}
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-[#ededed] outline-none placeholder:text-[#8a8a93]"
        />
        <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[11px] text-[#a1a1aa] sm:block">
          ⌘K
        </kbd>
      </div>
      <p className="px-4 pb-1 pt-3 font-mono text-[11px] uppercase tracking-wider text-[#8a8a93]">
        Projects · {shown.length}
      </p>
      <ul id="d-cmd-list" role="listbox" className="max-h-[320px] overflow-y-auto px-2 pb-2">
        {shown.map((i, idx) => (
          <li key={i.slug} id={`d-cmd-${i.slug}`} role="option" aria-selected={idx === sel}>
            <a
              href={`/work/${i.slug}`}
              onMouseEnter={() => setSel(idx)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                idx === sel ? "bg-white/[0.07] text-[#ededed]" : "text-[#a1a1aa]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  i.status === "running" ? "bg-emerald-400" : "bg-[#5a5a63]"
                }`}
              />
              <span className="min-w-0 flex-1 truncate">{i.title}</span>
              <span className="hidden shrink-0 font-mono text-[11px] text-[#8a8a93] sm:block">{i.hint}</span>
              {idx === sel && (
                <span aria-hidden="true" className="shrink-0 font-mono text-[11px] text-[#a194ff]">
                  ↵
                </span>
              )}
            </a>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-[#8a8a93]">No matches for “{q}”</li>
        )}
      </ul>
    </div>
  );
}
