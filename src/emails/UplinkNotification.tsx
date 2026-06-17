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
import { emailColors as c, emailMono as mono, emailSans as sans } from "./theme";

/**
 * Transactional email rendered by the /api/contact route and delivered via
 * Resend — the notification Hasnat receives when someone submits the uplink
 * form. Styled in the hasnat.ops console palette. A React Email template
 * (the idiomatic Resend way): render() turns this into HTML + a plain-text
 * fallback. All styling is inline (email clients strip <style>/external CSS).
 */
export interface UplinkNotificationProps {
  name: string;
  email: string;
  message: string;
  /** ISO timestamp the message was received */
  receivedAt?: string;
}

export default function UplinkNotification({
  name,
  email,
  message,
  receivedAt,
}: UplinkNotificationProps) {
  const when = receivedAt
    ? new Date(receivedAt).toUTCString()
    : new Date().toUTCString();
  const preview = `${name}: ${message.slice(0, 90)}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: c.bg }}>
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          <Section
            style={{
              backgroundColor: c.elev,
              border: `1px solid ${c.line}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* header */}
            <Section
              style={{
                padding: "18px 28px",
                borderBottom: `1px solid ${c.line}`,
              }}
            >
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
                SYS://hasnat.ops · incoming uplink
              </Text>
            </Section>

            {/* body */}
            <Section style={{ padding: "28px" }}>
              <Heading
                as="h1"
                style={{
                  margin: "0 0 20px",
                  fontFamily: sans,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                New message via the uplink
              </Heading>

              {/* metadata rows */}
              <table
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{ marginBottom: "20px", fontFamily: mono, fontSize: "13px" }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 0", color: c.muted, width: "84px" }}>
                      from
                    </td>
                    <td style={{ padding: "6px 0", color: c.text }}>
                      {name}{" "}
                      <Link href={`mailto:${email}`} style={{ color: c.accent }}>
                        &lt;{email}&gt;
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", color: c.muted }}>received</td>
                    <td style={{ padding: "6px 0", color: c.text }}>{when}</td>
                  </tr>
                </tbody>
              </table>

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
                payload
              </Text>
              {/* message body — preserve the sender's line breaks */}
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
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: c.text,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message}
                </Text>
              </Section>

              <Button
                href={`mailto:${email}?subject=${encodeURIComponent(
                  "Re: your message to hasnat.ops"
                )}`}
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
                reply to {name.split(" ")[0]} →
              </Button>
            </Section>

            {/* footer */}
            <Hr style={{ margin: 0, borderColor: c.line }} />
            <Section style={{ padding: "16px 28px" }}>
              <Text
                style={{
                  margin: 0,
                  fontFamily: mono,
                  fontSize: "11px",
                  color: c.muted,
                }}
              >
                delivered by the hasnat.ops uplink · reply directly to reach{" "}
                {name.split(" ")[0]}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* preview data so `email dev` / the React Email studio can render this file */
UplinkNotification.PreviewProps = {
  name: "Ada Lovelace",
  email: "ada@analytical.engine",
  message:
    "Saw the operations-console portfolio — the latent-field skills map is brilliant.\n\nWe're hiring for a platform role and would love to talk. Are you open to a quick call next week?",
  receivedAt: new Date().toISOString(),
} satisfies UplinkNotificationProps;
