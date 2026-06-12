import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Contact endpoint (Vercel serverless). Validates with zod, drops
 * honeypot hits silently, rate-limits per IP, and delivers via Resend
 * when RESEND_API_KEY is set (logs to console otherwise — dev mode).
 */
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  company: z.string().optional(), // honeypot
});

/* naive in-memory rate limit — fine for a portfolio (per-instance) */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 });
  }
  const { name, email, message, company } = parsed.data;

  /* honeypot: pretend success, deliver nothing */
  if (company) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (limited(ip)) {
    return NextResponse.json({ error: "rate limited — try later" }, { status: 429 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? "ch.hsyahmedgoheer@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!key) {
    console.log("[contact] (dev — set RESEND_API_KEY to deliver)", {
      name,
      email,
      message,
    });
    return NextResponse.json({ ok: true });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `hasnat.ops uplink <${from}>`,
      to: [to],
      reply_to: email,
      subject: `[uplink] ${name}`,
      text: `from: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    console.error("[contact] resend error", res.status, await res.text());
    return NextResponse.json({ error: "delivery failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
