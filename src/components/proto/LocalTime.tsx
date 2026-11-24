"use client";

/** Live local time in Islamabad, e.g. "14:32 PKT". Empty until mounted, so
 *  the server and client HTML always match. */
import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  hour: "2-digit",
  minute: "2-digit",
});

export default function LocalTime({ className }: { className?: string }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`tabular-nums ${className ?? ""}`} suppressHydrationWarning>
      {now ? `${now} PKT` : "PKT"}
    </span>
  );
}
