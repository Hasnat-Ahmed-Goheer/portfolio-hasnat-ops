"use client";

/**
 * Uplink: contact form styled as stdin prompts. Posts to /api/contact.
 * The "company" field is a honeypot — visually hidden, bots fill it.
 */
import { useState, type FormEvent } from "react";
import { lexicon } from "@/config/console";
import { profile } from "@/content/profile";
import Reveal from "@/components/ui/Reveal";
import DecodeText from "@/components/ui/DecodeText";
import Magnetic from "@/components/ui/Magnetic";

type Status = "idle" | "sending" | "ok" | "err";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "transmission failed");
      setStatus("ok");
      form.reset();
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "transmission failed");
    }
  }

  const field =
    "w-full rounded border hairline bg-elev/60 px-4 py-3 font-mono text-sm text-text outline-none transition-colors placeholder:text-muted/40 focus:border-accent/60";

  return (
    <>
      <section className="scene-passthrough relative flex min-h-[52svh] flex-col justify-end px-5 pb-14">
        <div className="mx-auto w-full max-w-6xl">
          <p className="sys-label mb-4">
            <DecodeText
              text={`${lexicon.sectionPrefix}${lexicon.sections.contact}`}
            />
          </p>
          <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
            Open a connection
          </h1>
          <p className="mt-4 font-mono text-xs text-muted">
            <span className="text-ok">●</span> {profile.availability} · response
            ETA &lt; 48h
          </p>
        </div>
      </section>

      <section className="relative px-5 pb-28" aria-label="Contact form">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_300px]">
          <Reveal>
            <form onSubmit={onSubmit} className="max-w-xl space-y-5" noValidate>
              {/* honeypot */}
              <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" tabIndex={-1} autoComplete="off" />
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block font-mono text-xs text-accent">
                  &gt; name:
                </label>
                <input id="name" name="name" required maxLength={120} className={field} placeholder="your name" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block font-mono text-xs text-accent">
                  &gt; email:
                </label>
                <input id="email" name="email" type="email" required maxLength={200} className={field} placeholder="you@domain.com" />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block font-mono text-xs text-accent">
                  &gt; message:
                </label>
                <textarea id="message" name="message" required rows={6} maxLength={5000} className={field} placeholder="what should we build?" />
              </div>

              <Magnetic className="inline-block" strength={0.35}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded border border-accent/50 bg-accent/10 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
                >
                  {status === "sending" ? "transmitting …" : "transmit ▸"}
                </button>
              </Magnetic>

              <div aria-live="polite" className="min-h-6 font-mono text-xs">
                {status === "ok" && (
                  <p className="text-ok">200 OK — packet received. response ETA &lt; 48h.</p>
                )}
                {status === "err" && <p className="text-danger">5xx — {error}. email works too: {profile.email}</p>}
              </div>
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4 font-mono text-xs">
              <p className="sys-label">direct channels</p>
              <a href={`mailto:${profile.email}`} className="block text-text/85 hover:text-accent">
                {profile.email}
              </a>
              {profile.socials
                .filter((s) => s.label !== "Email")
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-text/85 hover:text-accent"
                  >
                    {s.label} ↗
                  </a>
                ))}
              <a href={profile.resumeUrl} className="block text-text/85 hover:text-accent">
                resume.pdf ↓
              </a>
              <p className="pt-4 text-muted">or: ⌘K → contact</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
