"use client";

/**
 * Single persistent WebGL canvas, fixed behind the DOM. Scenes swap by
 * route with a CSS crossfade (the GL context itself never remounts).
 * Renders a static gradient fallback when WebGL is unavailable or
 * reduced motion is requested ("off" tier).
 */
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import Effects from "./shared/Effects";

const Cluster = lazy(() => import("./cluster/ClusterScene"));
const Latent = lazy(() => import("./latent/LatentScene"));
const Pipeline = lazy(() => import("./pipeline/PipelineScene"));
const Deployment = lazy(() => import("./deployment/DeploymentScene"));

function sceneKeyFor(path: string): string {
  if (path === "/") return "cluster";
  if (path.startsWith("/work/")) return "deployment";
  if (path === "/work") return "pipeline";
  if (path === "/about") return "latent";
  if (path === "/experience") return "pipeline-dim";
  if (path === "/lab") return "latent-lab";
  if (path === "/contact") return "cluster-dim";
  return "cluster-dim";
}

function sceneNodeFor(key: string): ReactNode {
  switch (key) {
    case "cluster": return <Cluster />;
    case "cluster-dim": return <Cluster dim />;
    case "latent": return <Latent />;
    case "latent-lab": return <Latent variant="lab" />;
    case "pipeline": return <Pipeline />;
    case "pipeline-dim": return <Pipeline dim />;
    case "deployment": return <Deployment />;
    default: return <Cluster dim />;
  }
}

export default function CanvasRoot() {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const pathname = usePathname();
  const target = sceneKeyFor(pathname);

  const [shown, setShown] = useState(target);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  /* PerformanceMonitor flips this under sustained low FPS: DPR drops to 1
     and postprocessing is disabled — graceful degradation per PLAN §E */
  const [degraded, setDegraded] = useState(false);
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  /* crossfade scene swap */
  useEffect(() => {
    if (target === shown) return;
    setVisible(false);
    const t = setTimeout(() => {
      setShown(target);
      setVisible(true);
    }, 380);
    return () => clearTimeout(t);
  }, [target, shown]);

  /* pause rendering when tab hidden */
  useEffect(() => {
    setEventSource(document.body);
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* no-WebGL / reduced-motion fallback: static nebula gradient */
  if (gpuTier === "off") {
    return (
      <div
        aria-hidden="true"
        className="scene-layer"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 30% 35%, color-mix(in srgb, var(--accent) 9%, transparent), transparent), radial-gradient(ellipse 55% 45% at 75% 70%, color-mix(in srgb, var(--accent3) 7%, transparent), transparent)",
        }}
      />
    );
  }

  if (!eventSource) return null;

  return (
    <div
      aria-hidden="true"
      className="scene-layer"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={degraded ? 1 : gpuTier === "mobile" ? [1, 1.5] : [1, 1.75]}
        /* antialias off: scenes are points/wireframes + bloom, MSAA buys
           nothing visible here and costs a full-screen multisample resolve */
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        frameloop={paused ? "never" : "always"}
        eventSource={eventSource}
        eventPrefix="client"
      >
        <PerformanceMonitor
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
          flipflops={2}
          onFallback={() => setDegraded(true)}
        />
        <Suspense fallback={null}>{sceneNodeFor(shown)}</Suspense>
        {gpuTier === "full" && !degraded && <Effects />}
      </Canvas>
    </div>
  );
}
