"use client";

/**
 * Home hero: reactive node-graph "cluster". Instanced nodes + line links,
 * spring physics, raycast hover (pod tooltips + neighbor/edge highlight),
 * pointer-field repulsion across the whole hive, click shockwaves,
 * drag-to-disturb, packet traffic along links, cursor parallax, and a
 * scroll-driven camera push synced to sceneStore.progress.
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
  const packetCount = dim
    ? 0
    : gpuTier === "mobile"
      ? sceneParams.cluster.mobilePackets
      : sceneParams.cluster.packets;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const packetRef = useRef<THREE.InstancedMesh>(null);
  const hovered = useRef(-1);
  const lastHover = useRef(-1);
  const dragId = useRef(-1);
  const lastDisturb = useRef(0);
  /* pending click shockwave origin (-1 = none), consumed in useFrame */
  const shockId = useRef(-1);

  const { bases, phases, sizes, links, neighbors } = useMemo(() => {
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
    const neighbors: number[][] = Array.from({ length: count }, () => []);
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (
          bases[i].distanceTo(bases[j]) < sceneParams.cluster.linkDist &&
          rng() < 0.55
        ) {
          links.push([i, j]);
          neighbors[i].push(j);
          neighbors[j].push(i);
        }
      }
    }
    return { bases, phases, sizes, links, neighbors };
  }, [count]);

  /* mutable physics state */
  const off = useMemo(() => new Float32Array(count * 3), [count]);
  const vel = useMemo(() => new Float32Array(count * 3), [count]);
  const hoverScale = useMemo(() => new Float32Array(count).fill(1), [count]);
  /* per-link glow intensity, lerped toward hover state each frame */
  const linkGlow = useMemo(
    () => new Float32Array(links.length).fill(0.18),
    [links]
  );
  /* packet traffic: which link each packet rides + its progress/speed */
  const packets = useMemo(() => {
    const rng = mulberry32(7);
    return Array.from({ length: packetCount }, () => ({
      link: Math.floor(rng() * Math.max(links.length, 1)),
      t: rng(),
      speed: 0.25 + rng() * 0.45,
    }));
  }, [packetCount, links]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(links.length * 6), 3)
    );
    /* grayscale per-vertex color = link brightness (alpha can't vary per
       vertex on lineBasicMaterial; on a dark bg brightness reads as alpha) */
    g.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(links.length * 6).fill(0.18), 3)
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
  const pointerWorld = useMemo(() => new THREE.Vector3(99, 99, 0), []);
  const dragVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const store = useSceneStore.getState();
    const cam = state.camera;

    /* terminal eggs disturb the cluster */
    if (store.disturb !== lastDisturb.current) {
      lastDisturb.current = store.disturb;
      for (let i = 0; i < count * 3; i++) vel[i] += (Math.random() - 0.5) * 6;
    }

    /* click shockwave: radial impulse rippling out from the clicked node */
    if (shockId.current >= 0) {
      const o = bases[shockId.current];
      for (let i = 0; i < count; i++) {
        if (i === shockId.current) continue;
        const i3 = i * 3;
        tmp.copy(bases[i]).sub(o);
        const d = tmp.length();
        const f = 3.2 * Math.exp(-d * 0.7);
        tmp.normalize();
        vel[i3] += tmp.x * f;
        vel[i3 + 1] += tmp.y * f;
        vel[i3 + 2] += tmp.z * f;
      }
      shockId.current = -1;
    }

    /* pointer in world space (z=0 plane) — the whole hive leans away */
    tmp.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam);
    tmp.sub(cam.position).normalize();
    if (tmp.z !== 0) {
      const k = -cam.position.z / tmp.z;
      pointerWorld.copy(cam.position).addScaledVector(tmp, k);
    }

    /* drag target point (plane at dragged node's depth) */
    let dragPoint: THREE.Vector3 | null = null;
    if (dragId.current >= 0) {
      tmp.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam);
      const dir = tmp.sub(cam.position).normalize();
      const dz = bases[dragId.current].z - cam.position.z;
      const k = dir.z !== 0 ? dz / dir.z : 0;
      dragPoint = dragVec.copy(cam.position).addScaledVector(dir, k);
    }

    const hov = hovered.current;
    const hovNeighbors = hov >= 0 ? neighbors[hov] : null;

    const linePos = lineGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (i === dragId.current && dragPoint) {
        /* pin to pointer; spring returns it on release */
        off[i3] = THREE.MathUtils.clamp(dragPoint.x - bases[i].x, -3, 3);
        off[i3 + 1] = THREE.MathUtils.clamp(dragPoint.y - bases[i].y, -3, 3);
        vel[i3] = vel[i3 + 1] = vel[i3 + 2] = 0;
      } else {
        /* gentle field repulsion so the hive reacts to the cursor itself */
        const px = bases[i].x + off[i3] - pointerWorld.x;
        const py = bases[i].y + off[i3 + 1] - pointerWorld.y;
        const pd = Math.sqrt(px * px + py * py);
        if (pd < 1.7 && pd > 0.0001) {
          const f = ((1.7 - pd) / 1.7) * 3.4 * dt;
          vel[i3] += (px / pd) * f;
          vel[i3 + 1] += (py / pd) * f;
        }
        for (let a = 0; a < 3; a++) {
          vel[i3 + a] += (-off[i3 + a] * 5 - vel[i3 + a] * 2.4) * dt;
          off[i3 + a] += vel[i3 + a] * dt;
        }
      }
      const idle = Math.sin(t * 0.5 + phases[i]) * 0.1;
      const x = bases[i].x + off[i3];
      const y = bases[i].y + idle + off[i3 + 1];
      const z = bases[i].z + off[i3 + 2];

      const targetScale =
        hov === i ? 2.1 : hovNeighbors && hovNeighbors.includes(i) ? 1.45 : 1;
      hoverScale[i] += (targetScale - hoverScale[i]) * 0.15;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.085 * sizes[i] * hoverScale[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const lineCol = lineGeo.attributes.color.array as Float32Array;
    for (let l = 0; l < links.length; l++) {
      const [a, b] = links[l];
      const a3 = a * 3, b3 = b * 3, l6 = l * 6;
      linePos[l6] = bases[a].x + off[a3];
      linePos[l6 + 1] = bases[a].y + Math.sin(t * 0.5 + phases[a]) * 0.1 + off[a3 + 1];
      linePos[l6 + 2] = bases[a].z + off[a3 + 2];
      linePos[l6 + 3] = bases[b].x + off[b3];
      linePos[l6 + 4] = bases[b].y + Math.sin(t * 0.5 + phases[b]) * 0.1 + off[b3 + 1];
      linePos[l6 + 5] = bases[b].z + off[b3 + 2];

      /* edges touching the hovered node light up; idle edges shimmer */
      const base = dim
        ? 0.08
        : 0.16 + Math.sin(t * 0.8 + l * 1.7) * 0.05;
      const target = !dim && hov >= 0 && (a === hov || b === hov) ? 1 : base;
      linkGlow[l] += (target - linkGlow[l]) * 0.18;
      const g = linkGlow[l];
      lineCol[l6] = lineCol[l6 + 1] = lineCol[l6 + 2] = g;
      lineCol[l6 + 3] = lineCol[l6 + 4] = lineCol[l6 + 5] = g;
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    /* packet traffic riding the links */
    const pmesh = packetRef.current;
    if (pmesh && packetCount > 0 && links.length > 0) {
      for (let p = 0; p < packets.length; p++) {
        const pk = packets[p];
        pk.t += pk.speed * dt;
        if (pk.t >= 1) {
          pk.t = 0;
          pk.link = Math.floor(Math.random() * links.length);
        }
        const l6 = pk.link * 6;
        /* ease in/out so packets accelerate mid-link, fade at endpoints */
        const e = pk.t * pk.t * (3 - 2 * pk.t);
        dummy.position.set(
          linePos[l6] + (linePos[l6 + 3] - linePos[l6]) * e,
          linePos[l6 + 1] + (linePos[l6 + 4] - linePos[l6 + 1]) * e,
          linePos[l6 + 2] + (linePos[l6 + 5] - linePos[l6 + 2]) * e
        );
        const pulse = Math.sin(pk.t * Math.PI);
        dummy.scale.setScalar(0.028 * (0.4 + 0.6 * pulse));
        dummy.updateMatrix();
        pmesh.setMatrixAt(p, dummy.matrix);
      }
      pmesh.instanceMatrix.needsUpdate = true;
    }

    /* camera: scroll push-in + cursor parallax */
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
    shockId.current = e.instanceId ?? -1;
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
          vertexColors
          transparent
          opacity={dim ? 0.5 : 1}
        />
      </lineSegments>
      {packetCount > 0 && (
        <instancedMesh
          key={packetCount}
          args={[undefined, undefined, packetCount]}
          ref={packetRef}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={colors.accent2} toneMapped={false} transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
  );
}
