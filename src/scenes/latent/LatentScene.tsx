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
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { mulberry32 } from "../shared/rng";
import { glslSimplexNoise } from "../shared/noise.glsl";
import { clusterAccent } from "@/lib/color";
import AmbientField from "../shared/AmbientField";

const SKILL_GROUP_IDS = ["frontend", "backend", "cloud", "ai-data", "architecture"];

/* simplex flow field (full tier): organic drift while loose, settling into the
   clusters as uMorph→1. A single snoiseVec3 (3 noise evals) — rich, but real
   GPU only. */
const FLOW_NOISE = /* glsl */ `
  float drift = 1.0 - uMorph * 0.72;
  /* single snoise eval (was snoiseVec3 = 3 evals). At this point density the
     scalar-driven displacement is visually indistinguishable, for ~3x less
     vertex-noise cost — the main 60fps lever on the about page. */
  float n = snoise(pos * 0.3 + vec3(0.0, 0.0, uTime * 0.06));
  vec3 flow = vec3(n, n * 0.8, n * 0.5);
  vFlow = clamp(abs(n) * 0.7, 0.0, 1.0);
  pos += flow * (0.4 + aRand * 0.28) * drift;
`;

/* cheap trig drift (mobile / software renderers): same loose→settled feel and
   amplitude with zero noise evals, so weak GPUs match main's speed. */
const FLOW_CHEAP = /* glsl */ `
  float drift = 1.0 - uMorph * 0.72;
  vec3 flow = vec3(
    sin(pos.y * 0.6 + uTime * 0.5 + aRand * 6.2831),
    cos(pos.z * 0.6 + uTime * 0.4 + aRand * 6.2831),
    sin(pos.x * 0.6 + uTime * 0.45 + aRand * 6.2831)
  ) * 0.4;
  vFlow = clamp(length(flow.xy) * 0.5, 0.0, 1.0);
  pos += flow * (0.4 + aRand * 0.28) * drift;
`;

/* the noise chunks are only compiled into the full-tier variant */
const makeVert = (useNoise: boolean) => /* glsl */ `
${useNoise ? glslSimplexNoise : ""}
uniform float uTime;
uniform float uMorph;
uniform float uActive;
uniform float uShock;
uniform vec3 uPointer;
uniform float uSize;
attribute vec3 aTarget;
attribute float aCluster;
attribute float aRand;
varying float vActive;
varying float vFade;
varying float vTwinkle;
varying float vDepth;
varying float vFlow;

void main() {
  vTwinkle = 0.72 + 0.28 * sin(uTime * 1.6 + aRand * 40.0);
  vec3 pos = mix(position, aTarget, uMorph);

${useNoise ? FLOW_NOISE : FLOW_CHEAP}

  vec3 d = pos - uPointer;
  float dist = length(d);
  pos += normalize(d + 0.0001) * smoothstep(1.6, 0.0, dist) * 0.85;

  /* terminal-egg shockwave: the whole field breathes outward, then settles */
  pos += normalize(pos + 0.0001) * uShock * (0.3 + aRand * 0.5);

  /* "active" is a reserved word in GLSL ES — using it kills compilation */
  float sel = uActive < -0.5 ? 0.0 : step(abs(aCluster - uActive), 0.4);
  vActive = sel;
  vFade = uActive < -0.5 ? 1.0 : mix(0.22, 1.0, sel);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  /* depth atmosphere: 0 near → 1 far (frag dims distant points, DoF-ish) */
  vDepth = clamp((-mv.z - 4.0) / 9.0, 0.0, 1.0);
  /* 26/-z ⇒ ~2–7px points at the resting camera (z≈8.5). The original
     220/-z constant meant 30–90px additive points — a full-screen washout
     that was never caught because the shader didn't compile until now. */
  gl_PointSize = uSize * (0.5 + aRand) * (1.0 + sel * 0.9 + uShock * 0.6) * (26.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uActiveColor;
varying float vActive;
varying float vFade;
varying float vTwinkle;
varying float vDepth;
varying float vFlow;

void main() {
  float d = length(gl_PointCoord - 0.5);
  /* two-stop sprite: soft halo + a hot core that feeds bloom — a luminous
     point instead of a flat additive disc */
  float halo = smoothstep(0.5, 0.06, d);
  float core = pow(smoothstep(0.32, 0.0, d), 1.6);
  float a = (halo * 0.5 + core * 0.85) * vFade * vTwinkle;
  /* far points recede into the void for depth */
  a *= mix(1.0, 0.35, vDepth);
  if (a < 0.01) discard;
  /* the queried cluster shifts to its OWN tint and intensifies; everything
     else stays in the base hue. Fast flow adds energy as brightness. */
  vec3 base = mix(uColor, uActiveColor, vActive);
  vec3 col = base * (1.0 + vActive * 1.1);
  col *= 1.0 + vFlow * 0.45 * (1.0 - vActive);
  col += core * 0.25;
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

  /* full tier gets the simplex flow field; mobile/software gets the cheap
     trig drift (matches main's speed). Keyed below so it recompiles on tier
     change rather than silently keeping the first variant. */
  const useNoise = gpuTier === "full";
  const vert = useMemo(() => makeVert(useNoise), [useNoise]);

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const shock = useRef(0);
  const lastDisturb = useRef(0);

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
      uShock: { value: 0 },
      uPointer: { value: new THREE.Vector3(99, 99, 99) },
      uSize: { value: 1.6 },
      uColor: { value: new THREE.Color("#8b5cf6") },
      uActiveColor: { value: new THREE.Color("#8b5cf6") },
    }),
    []
  );

  const colorTarget = variant === "lab" ? colors.accent2 : colors.accent3;
  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uColor.value.set(colorTarget);
  }, [colorTarget]);

  /* per-cluster tints (theme-derived hue band) so the queried cluster glows in
     its OWN colour — the same hues the About rail dots use, tying DOM ↔ 3D */
  const clusterColors = useMemo(
    () =>
      SKILL_GROUP_IDS.map(
        (_, i) =>
          new THREE.Color(clusterAccent(colorTarget, i, SKILL_GROUP_IDS.length))
      ),
    [colorTarget]
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const store = useSceneStore.getState();
    const u = mat.uniforms;
    u.uTime.value += Math.min(delta, 0.05);

    const targetMorph = variant === "lab" ? 0 : store.progress;
    u.uMorph.value += (targetMorph - u.uMorph.value) * 0.06;

    /* terminal eggs ripple the field */
    if (store.disturb !== lastDisturb.current) {
      lastDisturb.current = store.disturb;
      shock.current = 1;
    }
    shock.current *= Math.exp(-2 * Math.min(delta, 0.05));
    u.uShock.value = shock.current;

    const activeId = store.activeSkillGroup;
    const targetActive = variant === "about" && activeId
      ? SKILL_GROUP_IDS.indexOf(activeId)
      : -1;
    u.uActive.value += (targetActive - u.uActive.value) * 0.12;
    /* point the active-tint uniform at whichever cluster is currently nearest
       (no alloc — copy into the existing Color) */
    const idx = Math.round(u.uActive.value);
    if (idx >= 0 && idx < clusterColors.length) {
      (u.uActiveColor.value as THREE.Color).copy(clusterColors[idx]);
    }

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
    /* shared cursor-parallax feel across scenes (see PipelineScene) */
    cam.position.x += (state.pointer.x * 0.5 - cam.position.x) * 0.04;
    cam.position.y += (state.pointer.y * 0.3 - cam.position.y) * 0.04;
    cam.position.z += (8.5 - cam.position.z) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <AmbientField opacity={variant === "lab" ? 0.4 : 0.35} radius={11} />
      <points geometry={geometry}>
        <shaderMaterial
          key={useNoise ? "flow-noise" : "flow-cheap"}
          ref={matRef}
          vertexShader={vert}
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
