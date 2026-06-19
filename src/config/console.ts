/**
 * console.ts — concept lexicon + scene parameter presets.
 * The "operations console" metaphor is expressed entirely through these
 * tokens; swap the metaphor by editing this file + /content, not components.
 */
export const lexicon = {
  systemName: "hasnat.ops",
  prompt: "hasnat@ops:~$",
  sectionPrefix: "SYS://",
  sections: {
    home: "CLUSTER",
    about: "OPERATOR",
    work: "REGISTRY",
    experience: "EVENTLOG",
    lab: "SANDBOX",
    contact: "UPLINK",
  },
  projectNoun: "deployment",
  statusHealthy: "operational",
  footerEnd: "end of stream ▮",
} as const;

export const bootLines = [
  "hasnat.ops v1.0.0 — init",
  "[ ok ] mounting /home/hasnat",
  "[ ok ] loading kubeconfig … 15+ environments",
  "[ ok ] helm repo sync … 10+ charts",
  "[ ok ] vector index attached (pinecone)",
  "[ ok ] auth centralized — tokens verified server-side",
  "[ ok ] uplink ready",
  "starting console …",
];

/** Live hero "session" — a scripted, auto-typing terminal that idles in the
    hero so the landing reads as a running system, not styled text. Display only
    (the real shell is `~`); each command types out, then its lines stream in. */
export const heroSession: { cmd: string; out: string[] }[] = [
  { cmd: "whoami", out: ["hasnat — full-stack · cloud-native · ai"] },
  {
    cmd: "kubectl get pods",
    out: [
      "nextjs     Running   2y",
      "fastapi    Running   1y",
      "pinecone   Running   8mo",
    ],
  },
  {
    cmd: "uptime",
    out: ["99.9% uptime · sub-200ms p95 · 15+ envs"],
  },
];

/** Per-scene tunables (counts auto-reduced on low-power devices). */
/* Shared shockwave decay rate (per second, used as exp(-SHOCK_DECAY * dt)).
   Every scene's terminal-egg / disturb ripple settles at the same cadence so
   the whole console reacts as one system — previously each scene drifted
   (2.0–2.4) and pulses felt subtly out of step between routes. */
export const SHOCK_DECAY = 2.2;

/* Shared camera rig — one resting eye distance + fov + cursor-parallax law for
   every scene, so route hops read as one continuous camera instead of three.
   Scenes keep their own character through the *targetZ* they feed the rig
   (e.g. cluster's scroll dive), never through a different resting distance.
   Previously each scene rested at its own Z (cluster 9, latent 8.5, pipeline 8)
   and /work/[slug] orbited — the dominant cause of the "different worlds" feel. */
export const cameraRig = {
  restZ: 8.5,
  fov: 50,
  parallaxX: 0.5,
  parallaxY: 0.3,
  gain: 0.04,
} as const;

export const sceneParams = {
  /* seed / dimSeed: the dim "twin" routes (/contact, /experience) reseed their
     layout so they no longer overlay their parent scene pixel-for-pixel — a
     different constellation/stream routing, same primitives + palette. pingPeriod
     drives /contact's uplink beacon (cluster ring + ambient dust pulse in sync). */
  cluster: {
    nodes: 110, linkDist: 2.6, mobileNodes: 56, packets: 16, mobilePackets: 8,
    seed: 42, dimSeed: 91,
    /* uplink beacon: a ring re-arms every pingPeriod and expands at pingSpeed
       to pingExtent. Tuned so it dissipates (~2.7s) before re-arming (3.2s) —
       a deliberate "ping … rest … ping", not a constant churn. */
    pingPeriod: 3.2, pingSpeed: 4.5, pingExtent: 12,
    /* cursor magnetism: nodes within magnetRadius are drawn toward the pointer
       (a gravity well), the nearest "lead" node pulled hardest so the hive
       visibly reaches for the cursor and forms a transient constellation. The
       per-node spring (offSpring) resists, so they gather without collapsing
       and snap back on leave; gatherMax clamps the offset as a safety net. */
    magnetRadius: 2.9, magnetPull: 5.2, leadPull: 2.1, gatherMax: 2.2,
  },
  latent: { points: 36000, mobilePoints: 12000, clusters: 5 },
  pipeline: { tubes: 5, packetsPerTube: 5, seed: 11, dimSeed: 23 },
  deployment: { pods: 14, mobilePods: 8 },
} as const;
