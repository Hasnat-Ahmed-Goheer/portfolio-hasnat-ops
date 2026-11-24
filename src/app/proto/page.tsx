const OPTIONS = [
  { href: "/proto/a", name: "A — Editorial", note: "Warm paper, sans + serif name, text index of work with hover previews. Calm, confident, content first." },
  { href: "/proto/b", name: "B — Product", note: "Bento grid, split case-study cards with real screenshots and one headline number each. Crisp, light, one blue." },
  { href: "/proto/c", name: "C — Signal", note: "Saturated ultramarine, full-width wordmark, ticker, case studies that stack as you scroll. Loud and memorable." },
];

export default function ProtoIndex() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-white px-6 py-20 font-sans text-neutral-900" style={{ colorScheme: "light" }}>
      <h1 className="text-3xl font-semibold tracking-tight">Redesign prototypes</h1>
      <p className="mt-2 text-neutral-500">Home page only, three directions. Same content in each.</p>
      <ul className="mt-10 space-y-3">
        {OPTIONS.map((o) => (
          <li key={o.href}>
            <a href={o.href} className="block rounded-2xl border border-neutral-200 p-6 transition-colors hover:border-neutral-400">
              <p className="text-lg font-medium">{o.name} →</p>
              <p className="mt-1 text-neutral-500">{o.note}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
