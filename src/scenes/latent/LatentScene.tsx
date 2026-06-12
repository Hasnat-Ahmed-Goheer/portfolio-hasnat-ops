"use client";

/**
 * Latent-space particle field (the Pinecone-as-starfield). ~42k instanced
 * points in a custom shader. Scroll (sceneStore.progress) morphs the cloud
 * into 5 labeled skill clusters; pointer repels points; hovering a skill
 * in the DOM excites its cluster. "lab" variant: free-floating, amber.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneParams } from "@/config/console";
import { themes } from "@/config/theme";
import { skillGroups } from "@/content/skills";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { mulberry32 } from "../shared/rng";

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uActive;
uniform vec3 uPointer;
uniform float uSize;
attribute vec3 aTarget;
attribute float aCluster;
attribute float aRand;
varying float vActive;
varying float vFade;
varying float vTwinkle;

void main() {
  vTwinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aRand * 40.0);
  vec3 pos = mix(position, aTarget, uMorph);
  float drift = 1.0 - uMorph * 0.65;
  pos.x += sin(uTime * 0.30 + aRand * 6.2831 + pos.y * 0.55) * 0.20 * drift;
  pos.y += cos(uTime * 0.24 + aRand * 12.566 + pos.x * 0.45) * 0.20 * drift;
  pos.z += sin(uTime * 0.18 + aRand * 9.42) * 0.15 * drift;

  vec3 d = pos - uPointer;
  float dist = length(d);
  pos += normalize(d + 0.0001) * smoothstep(1.4, 0.0, dist) * 0.7;

  float active = uActive < -0.5 ? 0.0 : step(abs(aCluster - uActive), 0.4);
  vActive = active;
  vFade = uActive < -0.5 ? 1.0 : mix(0.22, 1.0, active);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * (0.5 + aRand) * (1.0 + active * 0.9) * (220.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uColorActive;
varying float vActive;
varying float vFade;
varying float vTwinkle;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * 0.5 * vFade * vTwinkle;
  if (a < 0.01) discard;
  vec3 col = mix(uColor, uColorActive, vActive);
  gl_FragColor = vec4(col, a);
}
`;

export default function LatentScene({
  variant = "about",
}: {
  variant?: "about" | "lab";
}) {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const theme = useUiStore((s) => s.theme);
  const colors = themes[theme];
  const count =
    gpuTier === "mobile"
      ? sceneParams.latent.mobilePoints
      : sceneParams.latent.points;

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => {
    const rng = mulberry32(7);
    const n = sceneParams.latent.clusters;
    const centers: THREE.Vector3[] = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.6;
      centers.push(
        new THREE.Vector3(Math.cos(a) * 3.1, Math.sin(a) * 2.1, (rng() - 0.5) * 1.4)
      );
    }
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const cluster = new Float32Array(count);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      /* start: loose gaussian-ish cloud */
      start[i3] = (rng() + rng() - 1) * 5.5;
      start[i3 + 1] = (rng() + rng() - 1) * 3.8;
      start[i3 + 2] = (rng() + rng() - 1) * 3.5;
      /* target: tight cluster per skill group */
      const k = i % n;
      const c = centers[k];
      target[i3] = c.x + (rng() + rng() - 1) * 0.9;
      target[i3 + 1] = c.y + (rng() + rng() - 1) * 0.7;
      target[i3 + 2] = c.z + (rng() + rng() - 1) * 0.6;
      cluster[i] = k;
      rand[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(start, 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    g.setAttribute("aCluster", new THREE.BufferAttribute(cluster, 1));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uActive: { value: -1 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uSize: { value: 2.6 },
      uColor: { value: new THREE.Color("#8b5cf6") },
      uColorActive: { value: new THREE.Color("#22d3ee") },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const store = useSceneStore.getState();
    const u = mat.uniforms;
    u.uTime.value += Math.min(delta, 0.05);

    /* theme/variant colors (cheap to set every frame) */
    u.uColor.value.set(variant === "lab" ? colors.accent2 : colors.accent3);
    u.uColorActive.value.set(colors.accent);

    const targetMorph = variant === "lab" ? 0 : store.progress;
    u.uMorph.value += (targetMorph - u.uMorph.value) * 0.06;

    const idx = skillGroups.findIndex((g) => g.id === store.activeSkillGroup);
    u.uActive.value = variant === "lab" ? -1 : idx;

    /* pointer in world space (plane z≈0) */
    const cam = state.camera;
    tmp.set(state.pointer.x, state.pointer.y, 0.5).unproject(cam);
    const dir = tmp.sub(cam.position).normalize();
    const k = dir.z !== 0 ? -cam.position.z / dir.z : 0;
    u.uPointer.value.copy(cam.position).addScaledVector(dir, k);

    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.12 + state.pointer.x * 0.05;
      groupRef.current.rotation.x = state.pointer.y * 0.03;
    }
    cam.position.x += (state.pointer.x * 0.4 - cam.position.x) * 0.03;
    cam.position.y += (state.pointer.y * 0.25 - cam.position.y) * 0.03;
    cam.position.z += (8.5 - cam.position.z) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
