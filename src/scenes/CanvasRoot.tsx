"use client";

/**
 * Single persistent WebGL canvas, fixed behind the DOM. Scenes swap by
 * route with a CSS crossfade (the GL context itself never remounts).
 * Renders a static gradient fallback when WebGL is unavailable or
 * reduced motion is requested ("off" tier).
 */
import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import { tick } from "@/lib/perfMeter";
import Effects from "./shared/Effects";

/** feeds the module FPS meter — store-free, drives the telemetry strip + `top` */
function FrameMeter() {
  useFrame(() => tick(performance.now()));
  return null;
}

/** Signals first-load readiness once the active scene has rendered for a beat
    — long enough for shaders to compile, springs/bloom to converge, and the
    field to look settled (NOT just "a frame painted", which left the boot
    panel lifting onto a dark, grainy, still-converging canvas). Accumulates
    clamped delta so it's wall-clock based, not frame-count based, regardless
    of the lazy-chunk load gap. Lives INSIDE the scene's Suspense boundary so
    it can't fire on the bare canvas. One-time write to uiStore. */
function ReadySignal() {
  const elapsed = useRef(0);
  const done = useRef(false);
  useFrame((_, delta) => {
    if (done.current) return;
    elapsed.current += Math.min(delta, 0.05);
    if (elapsed.current >= 0.4) {
      done.current = true;
      useUiStore.getState().setSceneReady(true);
    }
  });
  return null;
}

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
  const sceneReady = useUiStore((s) => s.sceneReady);
  const pathname = usePathname();
  const target = sceneKeyFor(pathname);

  const [shown, setShown] = useState(target);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  /* PerformanceMonitor flips this under sustained low FPS: DPR drops to 1
     and postprocessing is disabled — graceful degradation per PLAN §E */
  const [degraded, setDegraded] = useState(false);
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>(undefined);

  /* crossfade scene swap — fast on purpose: during a route change the opaque
     RouteCurtain covers the viewport, so the whole fade-out → swap → fade-in
     must finish UNDER the curtain (≈0.2s + 0.2s) before it lifts (~0.42s),
     revealing a fully-settled scene rather than a half-faded one */
  useEffect(() => {
    if (target === shown) return;
    setVisible(false);
    const t = setTimeout(() => {
      setShown(target);
      setVisible(true);
    }, 200);
    return () => clearTimeout(t);
  }, [target, shown]);

  /* no-canvas tier never renders a frame — unblock the boot reveal */
  useEffect(() => {
    if (gpuTier === "off") useUiStore.getState().setSceneReady(true);
  }, [gpuTier]);

  /* fail-safe: never let the canvas stay hidden if ReadySignal hasn't fired
     (slow chunk, throttled tab, etc.) — force the reveal after 2s */
  useEffect(() => {
    if (sceneReady) return;
    const t = setTimeout(() => useUiStore.getState().setSceneReady(true), 2000);
    return () => clearTimeout(t);
  }, [sceneReady]);

  /* pause rendering when tab hidden; only wire R3F pointer events on
     fine-pointer (mouse) devices — touch devices need all events for scroll */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (isFinePointer) setEventSource(document.body);
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

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="scene-layer"
      /* first load fades in only once the scene has actually rendered
         (sceneReady); thereafter it's just the per-route crossfade */
      style={{ opacity: visible && sceneReady ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        dpr={degraded ? 1 : gpuTier === "mobile" ? [1, 1.5] : [1, 1.75]}
        /* antialias off: scenes are points/wireframes + bloom, MSAA buys
           nothing visible here and costs a full-screen multisample resolve */
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        frameloop={paused ? "never" : "always"}
        {...(eventSource ? { eventSource, eventPrefix: "client" as const } : {})}
      >
        <PerformanceMonitor
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
          flipflops={2}
          onFallback={() => setDegraded(true)}
        />
        <FrameMeter />
        <Suspense fallback={null}>
          {sceneNodeFor(shown)}
          <ReadySignal />
        </Suspense>
        {gpuTier === "full" && <Effects degraded={degraded} />}
      </Canvas>
    </div>
  );
}
