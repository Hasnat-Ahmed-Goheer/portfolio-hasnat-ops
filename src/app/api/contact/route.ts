import { NextResponse } from "next/server";
import { z } from "zod";
import { render } from "@react-email/render";
import UplinkNotification from "@/emails/UplinkNotification";
import UplinkAck from "@/emails/UplinkAck";

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

  /* rich HTML from the React Email template; a hand-written plain-text
     fallback (cleaner than html-to-text, which duplicates mailto hrefs) */
  const receivedAt = new Date();
  const html = await render(
    UplinkNotification({ name, email, message, receivedAt: receivedAt.toISOString() })
  );
  const text = [
    "New message via the hasnat.ops uplink",
    "",
    `from:     ${name} <${email}>`,
    `received: ${receivedAt.toUTCString()}`,
    "",
    message,
    "",
    `— reply directly to this email to reach ${name.split(" ")[0]}`,
  ].join("\n");

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
      html,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[contact] resend error", res.status, await res.text());
    return NextResponse.json({ error: "delivery failed" }, { status: 502 });
  }

  /* best-effort auto-reply to the sender — the notification above already
     succeeded, so a failure here must not fail the request */
  try {
    const ackHtml = await render(UplinkAck({ name, message }));
    const ackText = [
      `Message received, ${name.split(" ")[0]} — thanks for reaching out through the console.`,
      "",
      "I read everything that comes through the uplink and typically reply within a day or two.",
      "If it's time-sensitive, just respond to this email and it'll come straight to me.",
      "",
      "— Hasnat Ahmed Goheer · Full Stack Software Engineer",
    ].join("\n");
    const ack = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Hasnat Ahmed Goheer <${from}>`,
        to: [email],
        reply_to: to,
        subject: "Message received — hasnat.ops",
        html: ackHtml,
        text: ackText,
      }),
    });
    if (!ack.ok) {
      console.error("[contact] auto-reply failed", ack.status, await ack.text());
    }
  } catch (err) {
    console.error("[contact] auto-reply threw", err);
  }

  return NextResponse.json({ ok: true });
}
