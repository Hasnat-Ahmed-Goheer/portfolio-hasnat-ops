import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center px-5 text-center">
      <p className="sys-label mb-4">SYS://ERROR</p>
      <h1 className="text-5xl font-medium tracking-tight sm:text-7xl">404</h1>
      <p className="mt-4 font-mono text-sm text-muted">
        service not found — no deployment answers at this route.
      </p>
      <Link
        href="/"
        className="mt-8 rounded border border-accent/50 bg-accent/10 px-5 py-2.5 font-mono text-sm text-accent transition-colors hover:bg-accent/20"
      >
        goto home ▸
      </Link>
    </section>
  );
}
