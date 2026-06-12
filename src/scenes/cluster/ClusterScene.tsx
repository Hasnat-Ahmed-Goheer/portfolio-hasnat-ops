"use client";

/**
 * Home hero: reactive node-graph "cluster". Instanced nodes + line links,
 * spring physics, raycast hover (with pod tooltips), drag-to-disturb,
 * cursor parallax, and a scroll-driven camera push synced to
 * sceneStore.progress.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { sceneParams } from "@/config/console";
import { themes } from "@/config/theme";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { mulberry32 } from "../shared/rng";

const CENTERS = [
  new THREE.Vector3(-2.2, 0.7, 0),
  new THREE.Vector3(1.9, 1.1, -1),
  new THREE.Vector3(0.5, -1.6, 0.7),
];

/* pod names for hover tooltips — thematic, drawn from the real stack */
const POD_NAMES = [
  "nextjs", "nestjs", "fastapi", "k8s-api", "helm", "rancher",
  "pinecone", "gemini", "stripe", "postgres", "mongo", "redis",
  "nginx", "lambda", "s3", "gateway", "websocket", "auth",
  "scheduler", "ingest", "worker", "cron", "registry", "uplink",
];

export default function ClusterScene({ dim = false }: { dim?: boolean }) {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const theme = useUiStore((s) => s.theme);
  const colors = themes[theme];
  const count =
    gpuTier === "mobile"
      ? sceneParams.cluster.mobileNodes
      : sceneParams.cluster.nodes;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const hovered = useRef(-1);
  const lastHover = useRef(-1);
  const dragId = useRef(-1);
  const lastDisturb = useRef(0);

  const { bases, phases, sizes, links } = useMemo(() => {
    const rng = mulberry32(42);
    const bases: THREE.Vector3[] = [];
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const c = CENTERS[i % 3];
      bases.push(
        new THREE.Vector3(
          c.x + (rng() - 0.5) * 3.4,
          c.y + (rng() - 0.5) * 2.8,
          c.z + (rng() - 0.5) * 2.6
        )
      );
      phases[i] = rng() * Math.PI * 2;
      sizes[i] = 0.6 + rng() * 0.9;
    }
    const links: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (
          bases[i].distanceTo(bases[j]) < sceneParams.cluster.linkDist &&
          rng() < 0.55
        ) {
          links.push([i, j]);
        }
      }
    }
    return { bases, phases, sizes, links };
  }, [count]);

  /* mutable physics state */
  const off = useMemo(() => new Float32Array(count * 3), [count]);
  const vel = useMemo(() => new Float32Array(count * 3), [count]);
  const hoverScale = useMemo(() => new Float32Array(count).fill(1), [count]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(links.length * 6), 3)
    );
    return g;
  }, [links]);
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

  /* per-instance colors: cyan majority, violet + amber accents */
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      if (i % 9 === 0) c.set(colors.accent2);
      else if (i % 4 === 0) c.set(colors.accent3);
      else c.set(colors.accent);
      if (dim) c.multiplyScalar(0.45);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, colors, dim]);

  /* release drag anywhere; clear tooltip on unmount */
  useEffect(() => {
    const up = () => (dragId.current = -1);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerup", up);
      useSceneStore.getState().setHoverLabel("");
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const store = useSceneStore.getState();

    /* terminal eggs disturb the cluster */
    if (store.disturb !== lastDisturb.current) {
      lastDisturb.current = store.disturb;
      for (let i = 0; i < count * 3; i++) vel[i] += (Math.random() - 0.5) * 6;
    }

    /* drag target point (plane at dragged node's depth) */
    let dragPoint: THREE.Vector3 | null = null;
    if (dragId.current >= 0) {
      const cam = state.camera;
      tmp.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam);
      const dir = tmp.sub(cam.position).normalize();
      const dz = bases[dragId.current].z - cam.position.z;
      const k = dir.z !== 0 ? dz / dir.z : 0;
      dragPoint = cam.position.clone().add(dir.multiplyScalar(k));
    }

    const linePos = lineGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (i === dragId.current && dragPoint) {
        /* pin to pointer; spring returns it on release */
        off[i3] = THREE.MathUtils.clamp(dragPoint.x - bases[i].x, -3, 3);
        off[i3 + 1] = THREE.MathUtils.clamp(dragPoint.y - bases[i].y, -3, 3);
        vel[i3] = vel[i3 + 1] = vel[i3 + 2] = 0;
      } else {
        for (let a = 0; a < 3; a++) {
          vel[i3 + a] += (-off[i3 + a] * 5 - vel[i3 + a] * 2.4) * dt;
          off[i3 + a] += vel[i3 + a] * dt;
        }
      }
      const idle = Math.sin(t * 0.5 + phases[i]) * 0.1;
      const x = bases[i].x + off[i3];
      const y = bases[i].y + idle + off[i3 + 1];
      const z = bases[i].z + off[i3 + 2];

      const targetScale = hovered.current === i ? 2.1 : 1;
      hoverScale[i] += (targetScale - hoverScale[i]) * 0.15;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.085 * sizes[i] * hoverScale[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    for (let l = 0; l < links.length; l++) {
      const [a, b] = links[l];
      const a3 = a * 3, b3 = b * 3, l6 = l * 6;
      linePos[l6] = bases[a].x + off[a3];
      linePos[l6 + 1] = bases[a].y + Math.sin(t * 0.5 + phases[a]) * 0.1 + off[a3 + 1];
      linePos[l6 + 2] = bases[a].z + off[a3 + 2];
      linePos[l6 + 3] = bases[b].x + off[b3];
      linePos[l6 + 4] = bases[b].y + Math.sin(t * 0.5 + phases[b]) * 0.1 + off[b3 + 1];
      linePos[l6 + 5] = bases[b].z + off[b3 + 2];
    }
    lineGeo.attributes.position.needsUpdate = true;

    /* camera: scroll push-in + cursor parallax */
    const cam = state.camera;
    const targetZ = (dim ? 10.5 : 9) - store.progress * 3.6;
    cam.position.z += (targetZ - cam.position.z) * 0.05;
    cam.position.x += (state.pointer.x * 0.7 - cam.position.x) * 0.04;
    cam.position.y += (state.pointer.y * 0.4 - cam.position.y) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const id = e.instanceId ?? -1;
    hovered.current = id;
    if (id !== lastHover.current) {
      lastHover.current = id;
      useSceneStore
        .getState()
        .setHoverLabel(
          id >= 0 ? `pod/${POD_NAMES[id % POD_NAMES.length]}-${id} · running` : ""
        );
    }
  };
  const onOut = () => {
    hovered.current = -1;
    lastHover.current = -1;
    useSceneStore.getState().setHoverLabel("");
  };
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    /* touch drags would fight page scroll — fine pointers only */
    if (e.pointerType === "touch") return;
    e.stopPropagation();
    dragId.current = e.instanceId ?? -1;
  };

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onPointerMove={onMove}
        onPointerOut={onOut}
        onPointerDown={onDown}
      >
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={dim ? 0.6 : 1} />
      </instancedMesh>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color={colors.accent}
          transparent
          opacity={dim ? 0.08 : 0.18}
        />
      </lineSegments>
    </group>
  );
}
