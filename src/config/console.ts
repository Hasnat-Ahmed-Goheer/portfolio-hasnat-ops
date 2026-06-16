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
  cluster: { nodes: 110, linkDist: 2.6, mobileNodes: 56, packets: 16, mobilePackets: 8 },
  latent: { points: 28000, mobilePoints: 10000, clusters: 5 },
  pipeline: { tubes: 5, packetsPerTube: 3 },
  deployment: { pods: 14, mobilePods: 8 },
} as const;
