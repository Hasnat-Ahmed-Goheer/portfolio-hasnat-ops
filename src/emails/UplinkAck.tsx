import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { profile } from "@/content/profile";
import {
  emailColors as c,
  emailMono as mono,
  emailSans as sans,
  SITE_URL,
} from "./theme";

/**
 * Auto-reply confirmation sent back to whoever submits the uplink form —
 * "message received, I'll be in touch". Rendered by /api/contact via Resend,
 * best-effort (a failure here never fails the request). Same console palette
 * as the notification so both emails read as one system.
 */
export interface UplinkAckProps {
  name: string;
  message: string;
}

export default function UplinkAck({ name, message }: UplinkAckProps) {
  const first = name.split(" ")[0] || "there";

  return (
    <Html lang="en">
      <Head />
      <Preview>Message received — {profile.name} will be in touch shortly.</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: c.bg }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 16px" }}>
          <Section
            style={{
              backgroundColor: c.elev,
              border: `1px solid ${c.line}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* header */}
            <Section style={{ padding: "18px 28px", borderBottom: `1px solid ${c.line}` }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: mono,
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: c.accent,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: c.ok,
                    marginRight: "8px",
                  }}
                />
                SYS://hasnat.ops · uplink acknowledged
              </Text>
            </Section>

            {/* body */}
            <Section style={{ padding: "28px" }}>
              <Heading
                as="h1"
                style={{
                  margin: "0 0 16px",
                  fontFamily: sans,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                Message received, {first} 👋
              </Heading>
              <Text
                style={{
                  margin: "0 0 20px",
                  fontFamily: sans,
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: c.text,
                }}
              >
                Thanks for reaching out through the console — your transmission landed.
                I read everything that comes through the uplink and typically reply
                within a day or two. If it&rsquo;s time-sensitive, just respond to this
                email and it&rsquo;ll come straight to me.
              </Text>

              {/* echo their message back so they have a record */}
              <Text
                style={{
                  margin: "0 0 8px",
                  fontFamily: mono,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: c.muted,
                }}
              >
                your transmission
              </Text>
              <Section
                style={{
                  backgroundColor: c.bg,
                  border: `1px solid ${c.line}`,
                  borderRadius: "8px",
                  padding: "16px 18px",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontFamily: sans,
                    fontSize: "14px",
                    lineHeight: "1.6",
                    color: c.muted,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message}
                </Text>
              </Section>

              <Button
                href={SITE_URL}
                style={{
                  display: "inline-block",
                  marginTop: "24px",
                  padding: "12px 22px",
                  border: `1px solid ${c.accent}80`,
                  borderRadius: "8px",
                  color: c.accent,
                  fontFamily: mono,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                explore the console →
              </Button>
            </Section>

            {/* signature */}
            <Hr style={{ margin: 0, borderColor: c.line }} />
            <Section style={{ padding: "20px 28px" }}>
              <Text
                style={{
                  margin: "0 0 4px",
                  fontFamily: sans,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                {profile.name}
              </Text>
              <Text style={{ margin: "0 0 10px", fontFamily: mono, fontSize: "12px", color: c.muted }}>
                {profile.role} · {profile.location}
              </Text>
              <Text style={{ margin: 0, fontFamily: mono, fontSize: "12px" }}>
                {profile.socials.map((s, i) => (
                  <span key={s.label}>
                    {i > 0 && <span style={{ color: c.muted }}> · </span>}
                    <Link href={s.href} style={{ color: c.accent, textDecoration: "none" }}>
                      {s.label}
                    </Link>
                  </span>
                ))}
              </Text>
            </Section>

            {/* footer */}
            <Hr style={{ margin: 0, borderColor: c.line }} />
            <Section style={{ padding: "14px 28px" }}>
              <Text style={{ margin: 0, fontFamily: mono, fontSize: "11px", color: c.muted }}>
                automated confirmation from the hasnat.ops uplink · a real reply is on its way
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* preview data for the React Email studio */
UplinkAck.PreviewProps = {
  name: "Ada Lovelace",
  message:
    "Saw the operations-console portfolio — the latent-field skills map is brilliant. We're hiring for a platform role and would love to talk.",
} satisfies UplinkAckProps;
