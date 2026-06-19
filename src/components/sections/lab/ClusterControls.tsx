"use client";

/**
 * Inline cluster operator — wires the existing terminal command bus
 * (lib/commands kubectl) to buttons. Each press runs the SAME command the
 * shell does: it scales/drains the real cluster scene via sceneStore and
 * echoes into the inline terminal below. The home graph reacts live; here we
 * show the resulting replica count straight from sceneStore.
 *
 * No new scene wiring — this is pattern #3 (existing commands inline).
 */
import { useRouter } from "next/navigation";
import { execute } from "@/lib/commands";
import { useSceneStore, BASE_REPLICAS } from "@/stores/sceneStore";

const ACTIONS: { label: string; cmd: string; tone?: "danger" }[] = [
  { label: "scale ×2", cmd: "kubectl scale deployment cluster --replicas=200" },
  { label: "scale ½", cmd: "kubectl scale deployment cluster --replicas=50" },
  { label: "drain", cmd: "kubectl drain", tone: "danger" },
  { label: "restore", cmd: "kubectl apply" },
];

export default function ClusterControls() {
  const router = useRouter();
  const replicas = useSceneStore((s) => s.replicas);
  const frac = useSceneStore((s) => s.replicaFrac);

  function run(cmd: string) {
    /* same ctx shape the terminal passes — navigate/close are no-ops here
       except `goto`, which these commands never call */
    execute(cmd, { navigate: (p) => router.push(p), close: () => {} });
  }

  return (
    <div className="group h-full rounded-lg border hairline bg-elev/50 p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs" style={{ color: "var(--accent2)" }}>
          exp/cluster-physics
        </p>
        <p className="font-mono text-[10px] text-muted">
          <span className="text-ok">●</span> live · command bus
        </p>
      </div>
      <p className="mt-2 text-xl font-medium tracking-tight">Cluster physics</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The home graph runs live spring dynamics. These buttons run real{" "}
        <span className="font-mono text-[color:var(--accent2)]">kubectl</span>{" "}
        commands through the same bus the shell uses — scale, drain, reconcile.
        Echoes into the terminal below;{" "}
        <a
          href="/"
          className="underline decoration-dotted underline-offset-2 hover:text-[color:var(--accent2)]"
        >
          goto home
        </a>{" "}
        to watch the cluster react.
      </p>

      <div className="mt-5 flex items-center gap-3 font-mono text-xs">
        <span className="text-muted">replicas</span>
        <span className="text-lg" style={{ color: "var(--accent2)" }}>
          {replicas}
        </span>
        <span className="text-muted/60">/ {BASE_REPLICAS} baseline</span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-elev"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(frac * 100)}
        aria-label="Cluster replica fraction"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.min(100, frac * 100)}%`,
            background: "var(--accent2)",
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => run(a.cmd)}
            className={`rounded border px-3 py-1.5 font-mono text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent2)] ${
              a.tone === "danger"
                ? "border-[color:var(--danger)]/40 text-[color:var(--danger)] hover:border-[color:var(--danger)] hover:bg-[color:var(--danger)]/10"
                : "hairline text-muted hover:border-[color:var(--accent2)]/50 hover:text-[color:var(--accent2)]"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
