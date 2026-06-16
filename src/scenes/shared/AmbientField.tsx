"use client";

/**
 * Shared ambient particle field — the connective tissue that makes every
 * route feel like the SAME world. A sparse, slow-drifting dust of points in
 * the theme accent sits behind each scene's distinct foreground (cluster /
 * starfield / pipeline / pods), so navigating reads as moving through one
 * continuous latent space rather than swapping between unrelated set pieces.
 *
 * Cheap by construction: one `snoise` eval per point at a low count (≈1600
 * full / 600 mobile), additive, depthWrite off. Reacts to sceneStore.disturb
 * with the same shock decay as the foregrounds, so terminal eggs pulse the
 * whole world in one motion language. Colour is read from the active theme
 * every frame so the `theme` command restyles it live (no hardcoded hex).
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { themes } from "@/config/theme";
import { useUiStore } from "@/stores/uiStore";
import { useSceneStore } from "@/stores/sceneStore";
import { mulberry32 } from "./rng";

const VERT = /* glsl */ `
uniform float uTime;
uniform float uShock;
uniform float uOpacity;
attribute float aRand;
varying float vAlpha;
void main() {
  vec3 p = position;
  /* cheap trig drift — no per-vertex simplex. This field renders behind EVERY
     scene, so it has to be nearly free; at dust density a couple of sin/cos
     read the same as a noise field for a fraction of the cost */
  float t = uTime + aRand * 6.2831;
  p += vec3(
    sin(p.y * 0.4 + t * 0.30),
    cos(p.z * 0.4 + t * 0.25),
    sin(p.x * 0.4 + t * 0.28)
  ) * (0.16 + aRand * 0.30);
  /* shared shockwave: the dust breathes outward with the foreground */
  p += normalize(p + 0.0001) * uShock * (0.4 + aRand * 0.6);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vAlpha = (0.18 + 0.42 * aRand) * (1.0 + uShock * 0.6) * uOpacity;
  gl_PointSize = (0.5 + aRand * 1.3) * (18.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

/**
 * @param radius  half-extent of the dust cloud (world units)
 * @param opacity overall multiplier (scenes with denser foregrounds dim it)
 * @param pulse   if >0, the dust breathes outward on this period (seconds) in
 *                addition to disturb — used by /contact so the ambient world
 *                pulses in sync with the cluster's uplink beacon
 */
export default function AmbientField({
  radius = 9,
  opacity = 1,
  pulse = 0,
}: {
  radius?: number;
  opacity?: number;
  pulse?: number;
}) {
  const gpuTier = useUiStore((s) => s.gpuTier);
  const theme = useUiStore((s) => s.theme);
  const colors = themes[theme];
  const count = gpuTier === "mobile" ? 550 : 1400;

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const shock = useRef(0);
  const lastDisturb = useRef(0);
  const pulseClock = useRef(0);

  const geometry = useMemo(() => {
    const rng = mulberry32(19);
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      /* gaussian-ish shell so the dust thins toward the edges */
      pos[i3] = (rng() + rng() - 1) * radius;
      pos[i3 + 1] = (rng() + rng() - 1) * radius * 0.7;
      pos[i3 + 2] = (rng() + rng() - 1) * radius * 0.7;
      rand[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, [count, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShock: { value: 0 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(colors.accent) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  /* keep the opacity uniform in sync if a parent retunes it */
  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uOpacity.value = opacity;
  }, [opacity]);

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const dt = Math.min(delta, 0.05);
    const u = mat.uniforms;
    u.uTime.value += dt;
    u.uColor.value.set(colors.accent);

    const store = useSceneStore.getState();
    if (store.disturb !== lastDisturb.current) {
      lastDisturb.current = store.disturb;
      shock.current = 1;
    }
    /* optional beacon: re-arm the shock on a fixed period (uplink ping) */
    if (pulse > 0) {
      pulseClock.current += dt;
      if (pulseClock.current >= pulse) {
        pulseClock.current -= pulse;
        shock.current = Math.max(shock.current, 0.8);
      }
    }
    shock.current *= Math.exp(-2.2 * dt);
    u.uShock.value = shock.current;
  });

  return (
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
  );
}
