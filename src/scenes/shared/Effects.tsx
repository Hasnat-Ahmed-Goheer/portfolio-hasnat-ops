"use client";

import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { fx } from "@/config/theme";
import { useUiStore } from "@/stores/uiStore";

/** Shared post pipeline — first knobs dropped under load (see PLAN §E). */
export default function Effects() {
  /* Hold the film grain off until the scene is actually settled. The Noise
     pass is SCREEN-blended random static; over the dark, near-empty frames of
     a still-converging scene it reads as "the renders are loading" (TV snow).
     Gating it on sceneReady means it only ever composites over real content,
     so it arrives as deliberate texture, never as a first-load artifact. */
  const sceneReady = useUiStore((s) => s.sceneReady);
  return (
    /* multisampling 0: MSAA on the composer's buffers is the single most
       expensive default here and invisible on glow-field scenes */
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={fx.bloomIntensity}
        luminanceThreshold={fx.bloomThreshold}
      />
      <Noise opacity={sceneReady ? fx.grainOpacity : 0} />
      <Vignette darkness={fx.vignetteDarkness} eskil={false} />
    </EffectComposer>
  );
}
