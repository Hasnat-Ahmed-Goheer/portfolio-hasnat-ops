import nodemailer, { type Transporter } from "nodemailer";

/**
 * Gmail SMTP transport for the contact form (Nodemailer). Sends *as* the
 * Gmail account itself (authenticated with an App Password), which is why the
 * From address can be a real gmail.com address — Google authorizes it, unlike
 * a third-party relay. Requires GMAIL_USER + GMAIL_APP_PASSWORD env vars.
 *
 * The transporter is created once per warm serverless instance and reused
 * (connection pooling), not rebuilt per request.
 */
let transporter: Transporter | null = null;

export function getMailer(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null; // not configured → caller falls back to dev log
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // TLS on 465
      auth: { user, pass },
      pool: true,
      maxConnections: 1,
    });
  }
  return transporter;
}

/** the authenticated Gmail address — also the default From / To */
export function mailerUser(): string | undefined {
  return process.env.GMAIL_USER;
}
