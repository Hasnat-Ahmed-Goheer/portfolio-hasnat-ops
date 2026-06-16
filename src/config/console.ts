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

/** Per-scene tunables (counts auto-reduced on low-power devices). */
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
  },
  latent: { points: 36000, mobilePoints: 12000, clusters: 5 },
  pipeline: { tubes: 5, packetsPerTube: 3, seed: 11, dimSeed: 23 },
  deployment: { pods: 14, mobilePods: 8 },
} as const;
