"use client";

/**
 * Data-pipeline scene: glowing tubes with a scrolling dash shader and
 * packet sprites flowing along them. Hovering a project row on /work
 * (sceneStore.activeProject) routes brightness to one stream.
 * "dim" variant backs the experience timeline.
 */
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneParams } from "@/config/console";
import { themes } from "@/config/theme";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { mulberry32 } from "../shared/rng";

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uBoost;
uniform float uOpacity;
uniform float uSpeed;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  float dash = smoothstep(0.42, 0.0, abs(fract(vUv.x * 22.0 - uTime * uSpeed) - 0.5));
  float a = dash * uOpacity * (0.35 + uBoost * 0.9);
  gl_FragColor = vec4(uColor * (0.7 + uBoost * 0.8), a);
}
`;

const TUBES = sceneParams.pipeline.tubes;
const PACKETS = sceneParams.pipeline.packetsPerTube;

export default function PipelineScene({ dim = false }: { dim?: boolean }) {
  const theme = useUiStore((s) => s.theme);
  const colors = themes[theme];
  const packetsRef = useRef<THREE.InstancedMesh>(null);
  const boosts = useRef(new Float32Array(TUBES));

  const { curves, geos, mats } = useMemo(() => {
    const rng = mulberry32(11);
    const curves: THREE.CatmullRomCurve3[] = [];
    const geos: THREE.TubeGeometry[] = [];
    const mats: THREE.ShaderMaterial[] = [];
    for (let k = 0; k < TUBES; k++) {
      const y0 = (k - (TUBES - 1) / 2) * 1.05;
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 4; s++) {
        pts.push(
          new THREE.Vector3(
            -8.5 + (17 * s) / 4,
            y0 + (rng() - 0.5) * 1.5,
            -1.2 + (rng() - 0.5) * 2
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      curves.push(curve);
      geos.push(new THREE.TubeGeometry(curve, 96, 0.022, 8, false));
      mats.push(
        new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uBoost: { value: 0 },
            uOpacity: { value: 1 },
            uSpeed: { value: 0.45 + k * 0.08 },
            uColor: { value: new THREE.Color("#22d3ee") },
          },
        })
      );
    }
    return { curves, geos, mats };
  }, []);

  useEffect(
    () => () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
    [geos, mats]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const active = useSceneStore.getState().activeProject;
    const activeTube = active >= 0 ? active % TUBES : -1;

    for (let k = 0; k < TUBES; k++) {
      const target = k === activeTube ? 1 : 0;
      boosts.current[k] += (target - boosts.current[k]) * 0.1;
      const u = mats[k].uniforms;
      u.uTime.value += dt * (dim ? 0.45 : 1);
      u.uBoost.value = boosts.current[k];
      u.uOpacity.value = dim ? 0.35 : 0.95;
      const c = k % 4 === 3 ? colors.accent3 : colors.accent;
      (u.uColor.value as THREE.Color).set(c);
    }

    /* packets riding the streams */
    const mesh = packetsRef.current;
    if (mesh) {
      let i = 0;
      for (let k = 0; k < TUBES; k++) {
        for (let p = 0; p < PACKETS; p++) {
          const speed = (dim ? 0.018 : 0.045) * (1 + k * 0.13);
          const at = (t * speed + p / PACKETS + k * 0.21) % 1;
          const pos = curves[k].getPointAt(at);
          dummy.position.copy(pos);
          const s = 0.05 * (1 + boosts.current[k] * 1.2);
          dummy.scale.setScalar(s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    const cam = state.camera;
    cam.position.x += (state.pointer.x * 0.5 - cam.position.x) * 0.04;
    cam.position.y += (state.pointer.y * 0.3 - cam.position.y) * 0.04;
    cam.position.z += (8 - cam.position.z) * 0.04;
    cam.lookAt(0, 0, 0);
  });

  return (
    <group rotation={[0.06, 0, -0.06]}>
      {geos.map((g, k) => (
        <mesh key={k} geometry={g} material={mats[k]} />
      ))}
      <instancedMesh ref={packetsRef} args={[undefined, undefined, TUBES * PACKETS]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial
          color={colors.accent}
          toneMapped={false}
          transparent
          opacity={dim ? 0.5 : 1}
        />
      </instancedMesh>
    </group>
  );
}
