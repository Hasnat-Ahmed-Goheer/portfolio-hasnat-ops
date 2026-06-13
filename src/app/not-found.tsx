import Link from "next/link";
import DecodeText from "@/components/ui/DecodeText";

const LOG = [
  ["[ .. ]", "resolving route against service registry"],
  ["[fail]", "no deployment answers at this address"],
  ["[ ok ]", "fallback route available: /"],
] as const;

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 text-center">
      <p className="sys-label mb-4">
        <DecodeText text="SYS://ERROR · 404" />
      </p>
      <h1 className="text-6xl font-medium tracking-tight sm:text-8xl">
        4<span className="text-accent">0</span>4
      </h1>
      <div
        className="mt-8 w-full max-w-md rounded-lg border hairline bg-elev/60 p-5 text-left font-mono text-xs leading-loose"
        aria-label="Error log"
      >
        {LOG.map(([tag, msg], i) => (
          <p
            key={i}
            className="nf-line opacity-0 motion-reduce:opacity-100"
            style={{ animationDelay: `${0.25 + i * 0.45}s` }}
          >
            <span className={tag === "[fail]" ? "text-danger" : tag === "[ ok ]" ? "text-ok" : "text-muted"}>
              {tag}
            </span>{" "}
            <span className="text-text/85">{msg}</span>
          </p>
        ))}
        <p
          className="nf-line caret opacity-0 motion-reduce:opacity-100"
          style={{ animationDelay: `${0.25 + LOG.length * 0.45}s` }}
        />
      </div>
      <Link
        href="/"
        className="mt-8 rounded border border-accent/50 bg-accent/10 px-5 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-accent/20"
      >
        goto home ▸
      </Link>
    </section>
  );
}
