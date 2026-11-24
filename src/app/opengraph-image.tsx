import { renderHomeCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderHomeCard();
}
