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
import { cameraRig, sceneParams } from "@/config/console";
import { applyCameraRig } from "../shared/cameraRig";
import { pointerToPlane } from "../shared/pointerPlane";
import { themes } from "@/config/theme";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { mulberry32 } from "../shared/rng";
import AmbientField from "../shared/AmbientField";

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
  /* cursor magnetism: only engages for a real, recently-moved FINE pointer.
     Without this gate a touch device (or an idle tab) leaves state.pointer at
     the origin, and the gravity well would reel every node to screen-center.
     magnetExpiry is the wall-clock time the current activity lapses at. */
  const magnetExpiry = useRef(0);
  /* nearest node to the cursor, tracked across frames so the "lead" gets the
     hardest pull (one frame of lag is invisible, saves a second pass) */
  const leadNode = useRef(-1);
  /* /contact uplink beacon: a bright ring expands from origin on a fixed
     period, in sync with the ambient dust pulse (dim variant only) */
  const pingClock = useRef(0);
  const pingRadius = useRef(99);
  /* fling: track drag-point velocity so release throws the node */
  const dragVel = useMemo(() => new Float32Array(2), []);
  const prevDrag = useMemo(() => new THREE.Vector3(), []);
  const dragging = useRef(false);

  const { bases, phases, sizes, links, neighbors } = useMemo(() => {
    /* dim twin (/contact) reseeds so its hive doesn't overlay the home scene */
    const rng = mulberry32(
      dim ? sceneParams.cluster.dimSeed : sceneParams.cluster.seed
    );
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
  }, [count, dim]);

  /* mutable physics state */
  const off = useMemo(() => new Float32Array(count * 3), [count]);
  const vel = useMemo(() => new Float32Array(count * 3), [count]);
  const hoverScale = useMemo(() => new Float32Array(count).fill(1), [count]);
  /* per-node visibility scale (0..1) — kubectl scale/delete spawn & evict */
  const life = useMemo(() => new Float32Array(count).fill(1), [count]);
  const killTimer = useMemo(() => new Float32Array(count), [count]);
  const lastKill = useRef(0);
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

  /* release drag anywhere (carrying fling velocity); clear tooltip on unmount */
  useEffect(() => {
    const up = () => {
      const i = dragId.current;
      if (i >= 0) {
        const i3 = i * 3;
        vel[i3] += THREE.MathUtils.clamp(dragVel[0], -16, 16);
        vel[i3 + 1] += THREE.MathUtils.clamp(dragVel[1], -16, 16);
      }
      dragId.current = -1;
      dragging.current = false;
    };
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerup", up);
      useSceneStore.getState().setHoverLabel("");
    };
  }, [vel, dragVel]);

  /* arm cursor magnetism on real mouse movement only — touch pointers and an
     idle cursor must NOT engage it (see magnetExpiry). Each move extends the
     window ~0.6s so the well fades out shortly after the cursor stops. */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      magnetExpiry.current = performance.now() + 600;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
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

    /* uplink beacon (/contact): re-arm a ring at origin every pingPeriod, then
       let it expand outward — nodes/links it crosses flare, the dust pulses */
    if (dim) {
      const { pingPeriod, pingSpeed, pingExtent } = sceneParams.cluster;
      pingClock.current += dt;
      if (pingClock.current >= pingPeriod) {
        pingClock.current -= pingPeriod;
        pingRadius.current = 0;
      }
      if (pingRadius.current < pingExtent) pingRadius.current += dt * pingSpeed;
    }

    /* kubectl delete pod <name>: evict a matching (or any) live node — it
       gets flung upward, shrinks out, then respawns when its timer expires */
    if (store.killSeq !== lastKill.current) {
      lastKill.current = store.killSeq;
      const name = store.killName;
      let target = -1;
      for (let i = 0; i < count; i++) {
        if (
          life[i] > 0.5 &&
          killTimer[i] <= 0 &&
          (!name || POD_NAMES[i % POD_NAMES.length] === name)
        ) {
          target = i;
          break;
        }
      }
      if (target < 0)
        for (let i = 0; i < count; i++)
          if (life[i] > 0.5 && killTimer[i] <= 0) {
            target = i;
            break;
          }
      if (target >= 0) {
        const t3 = target * 3;
        killTimer[target] = 2.4;
        vel[t3] += (Math.random() - 0.5) * 8;
        vel[t3 + 1] += 5 + Math.random() * 3;
        vel[t3 + 2] += (Math.random() - 0.5) * 6;
      }
    }

    /* kubectl scale: how many nodes are currently "scheduled" */
    const liveCount = Math.round(store.replicaFrac * count);

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

    /* pointer in world space (z=0 plane) — the hive reaches toward it */
    pointerToPlane(state.pointer, cam, 0, pointerWorld);

    /* cursor magnetism: armed only by a recent real mouse move (magnetExpiry),
       and eased down by the scroll dive so it hands off to the camera push as
       you descend. Find the nearest node (the "lead") so it can be pulled
       hardest — done once per frame here, reused in the node loop below. */
    const { magnetRadius, magnetPull, leadPull, gatherMax } =
      sceneParams.cluster;
    const magnetGain =
      performance.now() < magnetExpiry.current ? 1 - store.progress : 0;
    if (magnetGain > 0) {
      let best = -1;
      let bestD = magnetRadius * magnetRadius;
      for (let i = 0; i < count; i++) {
        if (i >= liveCount) continue;
        const dx = pointerWorld.x - (bases[i].x + off[i * 3]);
        const dy = pointerWorld.y - (bases[i].y + off[i * 3 + 1]);
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD) {
          bestD = d2;
          best = i;
        }
      }
      leadNode.current = best;
    } else {
      leadNode.current = -1;
    }

    /* drag target point (plane at dragged node's depth) */
    let dragPoint: THREE.Vector3 | null = null;
    if (dragId.current >= 0) {
      dragPoint = pointerToPlane(state.pointer, cam, bases[dragId.current].z, dragVec);
      /* drag-point velocity (world units/sec) for fling-on-release */
      if (dragging.current && dt > 0) {
        const inv = 1 / dt;
        dragVel[0] = (dragPoint.x - prevDrag.x) * inv;
        dragVel[1] = (dragPoint.y - prevDrag.y) * inv;
      } else {
        dragVel[0] = dragVel[1] = 0;
        dragging.current = true;
      }
      prevDrag.copy(dragPoint);
    }

    const hov = hovered.current;
    const hovNeighbors = hov >= 0 ? neighbors[hov] : null;

    const linePos = lineGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      /* spawn/despawn: alive if scheduled (within replica count) and not
         mid-eviction; life lerps so nodes pop in and shrink out smoothly */
      if (killTimer[i] > 0) killTimer[i] -= dt;
      const alive = i < liveCount && killTimer[i] <= 0;
      life[i] += ((alive ? 1 : 0) - life[i]) * 0.12;
      if (i === dragId.current && dragPoint) {
        /* pin to pointer; spring returns it on release */
        off[i3] = THREE.MathUtils.clamp(dragPoint.x - bases[i].x, -3, 3);
        off[i3 + 1] = THREE.MathUtils.clamp(dragPoint.y - bases[i].y, -3, 3);
        vel[i3] = vel[i3 + 1] = vel[i3 + 2] = 0;
      } else {
        /* cursor magnetism: nodes within magnetRadius are drawn TOWARD the
           pointer (a gravity well), the nearest "lead" node hardest, so the
           hive visibly reaches for the cursor and gathers a transient
           constellation. The spring below resists, so they lean without
           collapsing and snap back when the cursor leaves or the page dives. */
        if (magnetGain > 0) {
          const dx = pointerWorld.x - (bases[i].x + off[i3]);
          const dy = pointerWorld.y - (bases[i].y + off[i3 + 1]);
          const pd = Math.sqrt(dx * dx + dy * dy);
          if (pd < magnetRadius && pd > 0.0001) {
            let pull = ((magnetRadius - pd) / magnetRadius) * magnetPull;
            if (i === leadNode.current) pull += leadPull;
            pull *= magnetGain * dt;
            vel[i3] += (dx / pd) * pull;
            vel[i3 + 1] += (dy / pd) * pull;
          }
        }
        for (let a = 0; a < 3; a++) {
          vel[i3 + a] += (-off[i3 + a] * 5 - vel[i3 + a] * 2.4) * dt;
          off[i3 + a] += vel[i3 + a] * dt;
        }
        /* clamp the gather so a held cursor can't reel a node in unboundedly */
        off[i3] = THREE.MathUtils.clamp(off[i3], -gatherMax, gatherMax);
        off[i3 + 1] = THREE.MathUtils.clamp(off[i3 + 1], -gatherMax, gatherMax);
      }
      const idle = Math.sin(t * 0.5 + phases[i]) * 0.1;
      const x = bases[i].x + off[i3];
      const y = bases[i].y + idle + off[i3 + 1];
      const z = bases[i].z + off[i3 + 2];

      const targetScale =
        hov === i
          ? 2.1
          : i === leadNode.current
            ? 1.7 // the magnet "lead" swells so the snap reads as deliberate
            : hovNeighbors && hovNeighbors.includes(i)
              ? 1.45
              : 1;
      hoverScale[i] += (targetScale - hoverScale[i]) * 0.15;

      /* beacon shell: nodes near the expanding ping radius flare, fading as
         the ring dissipates outward */
      let ping = 0;
      if (dim) {
        const r = Math.sqrt(x * x + y * y + z * z) - pingRadius.current;
        ping =
          Math.exp(-r * r * 1.2) *
          Math.max(0, 1 - pingRadius.current / sceneParams.cluster.pingExtent);
      }

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(
        0.085 * sizes[i] * hoverScale[i] * life[i] * (1 + ping * 1.6)
      );
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
      /* a link is only as bright as its dimmer (or despawning) endpoint */
      let g = linkGlow[l] * Math.min(life[a], life[b]);
      /* uplink beacon ring sweeps brightness through the links it crosses */
      if (dim) {
        const mx = (linePos[l6] + linePos[l6 + 3]) * 0.5;
        const my = (linePos[l6 + 1] + linePos[l6 + 4]) * 0.5;
        const mz = (linePos[l6 + 2] + linePos[l6 + 5]) * 0.5;
        const r = Math.sqrt(mx * mx + my * my + mz * mz) - pingRadius.current;
        g +=
          Math.exp(-r * r * 1.2) *
          Math.max(0, 1 - pingRadius.current / sceneParams.cluster.pingExtent) *
          0.5;
      }
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

    /* camera: shared rig + this scene's own scroll dive toward the cluster.
       0.05 z-gain (vs the shared 0.04) keeps the push-in a touch snappier. */
    const targetZ = (dim ? cameraRig.restZ + 2 : cameraRig.restZ) - store.progress * 3.6;
    applyCameraRig(state, targetZ, 0.05);
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
      <AmbientField
        opacity={dim ? 0.45 : 0.8}
        radius={11}
        pulse={dim ? sceneParams.cluster.pingPeriod : 0}
      />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        onPointerMove={onMove}
        onPointerOut={onOut}
        onPointerDown={onDown}
      >
        {/* detail 1 (80 tris) — these render at ~0.085 scale, so detail 2's
            320 tris/node were 4× the geometry for no visible gain */}
        <icosahedronGeometry args={[1, 1]} />
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
