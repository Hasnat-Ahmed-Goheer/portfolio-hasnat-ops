"use client";

/**
 * Per-project "deployment" motif: one parametric scene, five presets
 * (orbit / helix / pulse / rail / grid) keyed by the project's motif.
 * User-manipulable via damped orbit controls.
 */
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { sceneParams, SHOCK_DECAY } from "@/config/console";
import { themes } from "@/config/theme";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import type { MotifKey } from "@/content/types";
import AmbientField from "../shared/AmbientField";

export default function DeploymentScene() {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const theme = useUiStore((s) => s.theme);
  const colors = themes[theme];
  const motif = useSceneStore((s) => s.motif);
  const accent = useSceneStore((s) => s.motifAccent);
  /* pods keep the project's identity colour but are pulled 35% toward the
     system cyan so every project page still belongs to the same palette;
     the wireframe core stays pure cyan as the persistent system thread */
  const podColor = useMemo(
    () => new THREE.Color(accent).lerp(new THREE.Color(colors.accent), 0.35),
    [accent, colors.accent]
  );
  const count =
    gpuTier === "mobile"
      ? sceneParams.deployment.mobilePods
      : sceneParams.deployment.pods;

  const podsRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  /* terminal-egg shock: pods + core flare, then settle */
  const shock = useRef(0);
  const lastDisturb = useRef(0);

  /* closed loop track for the "rail" motif */
  const railCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * 2.6,
          Math.sin(a * 2) * 0.7,
          Math.sin(a) * 2.6
        )
      );
    }
    return new THREE.CatmullRomCurve3(pts, true);
  }, []);

  useFrame((state, delta) => {
    const mesh = podsRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const store = useSceneStore.getState();

    if (store.disturb !== lastDisturb.current) {
      lastDisturb.current = store.disturb;
      shock.current = 1;
    }
    shock.current *= Math.exp(-SHOCK_DECAY * dt);
    const flare = 1 + shock.current * 0.55;

    for (let i = 0; i < count; i++) {
      const f = i / count;
      placePod(dummy, motif, f, i, t, railCurve);
      dummy.scale.multiplyScalar(flare);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.25 + shock.current * 2.5;
      coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
      const pulse = motif === "pulse" ? 1 + Math.sin(t * 2.2) * 0.12 : 1;
      coreRef.current.scale.setScalar(pulse * flare);
    }
  });

  return (
    <group>
      <AmbientField opacity={0.8} radius={9} />
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color={colors.accent} wireframe toneMapped={false} />
      </mesh>
      <instancedMesh ref={podsRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshBasicMaterial color={podColor} toneMapped={false} />
      </instancedMesh>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.7}
      />
    </group>
  );
}

const AHEAD = new THREE.Vector3();

function placePod(
  dummy: THREE.Object3D,
  motif: MotifKey,
  f: number,
  i: number,
  t: number,
  rail: THREE.CatmullRomCurve3
) {
  switch (motif) {
    case "helix": {
      const a = f * Math.PI * 5 + t * 0.4;
      dummy.position.set(Math.cos(a) * 1.9, (f - 0.5) * 4.4, Math.sin(a) * 1.9);
      dummy.rotation.set(0, a, 0);
      dummy.scale.setScalar(1);
      break;
    }
    case "pulse": {
      const ring = i % 3;
      const a = f * Math.PI * 2 * 3 + t * (0.5 + ring * 0.25);
      const r = 1.6 + ring * 0.8 + Math.sin(t * 2.2 + ring) * 0.18;
      dummy.position.set(Math.cos(a) * r, Math.sin(t * 1.4 + i) * 0.4, Math.sin(a) * r);
      dummy.rotation.set(t * 0.5, a, 0);
      dummy.scale.setScalar(1 + Math.sin(t * 2.2 + i) * 0.25);
      break;
    }
    case "rail": {
      const at = (f + t * 0.04) % 1;
      rail.getPointAt(at, dummy.position);
      /* scratch target — getPointAt without one allocates per pod/frame */
      rail.getPointAt((at + 0.01) % 1, AHEAD);
      dummy.lookAt(AHEAD);
      dummy.scale.set(1.6, 0.8, 0.8);
      break;
    }
    case "grid": {
      const side = Math.ceil(Math.cbrt(16));
      const x = i % side, y = Math.floor(i / side) % side, z = Math.floor(i / (side * side));
      const breathe = 1 + Math.sin(t * 1.1 + i * 0.7) * 0.06;
      dummy.position.set(
        (x - (side - 1) / 2) * 1.4 * breathe,
        (y - (side - 1) / 2) * 1.4 * breathe,
        (z - 0.5) * 1.4 * breathe
      );
      dummy.rotation.set(0, t * 0.15, 0);
      dummy.scale.setScalar(1);
      break;
    }
    default: {
      /* orbit */
      const a = f * Math.PI * 2 + t * (0.25 + (i % 3) * 0.12);
      const r = 2.1 + (i % 3) * 0.5;
      dummy.position.set(
        Math.cos(a) * r,
        Math.sin(t * 0.8 + i) * 0.5,
        Math.sin(a) * r
      );
      dummy.rotation.set(0, -a, 0);
      dummy.scale.setScalar(1);
    }
  }
}
