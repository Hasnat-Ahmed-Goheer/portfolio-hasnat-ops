"use client";

import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { fx } from "@/config/theme";
import { useUiStore } from "@/stores/uiStore";

/** Shared post pipeline — first knobs dropped under load (see PLAN §E).
 *
 * The whole composer stays mounted whenever the tier allows post; only the
 * expensive bloom is dialled down under sustained low FPS (`degraded`). It is
 * deliberately NOT torn down on `degraded`, because unmounting/remounting the
 * composer made the film grain visibly pop in and out on the first-load FPS
 * dip (grain shows → degrade fires → grain vanishes → recovers → grain back).
 * The real perf lever under load is the DPR drop to 1, handled in CanvasRoot. */
export default function Effects({ degraded = false }: { degraded?: boolean }) {
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
        intensity={degraded ? fx.bloomIntensity * 0.4 : fx.bloomIntensity}
        luminanceThreshold={fx.bloomThreshold}
      />
      {/* premultiply: the grain is MODULATED by scene luminance instead of
          screen-blended as a flat layer. A plain screen blend lifts pure
          blacks toward grey, veiling the near-black scene with a "whiter
          shade" the moment sceneReady gates it on; premultiply keeps the
          dark field genuinely dark and only textures the lit nodes/field. */}
      <Noise premultiply opacity={sceneReady ? fx.grainOpacity : 0} />
      <Vignette darkness={fx.vignetteDarkness} eskil={false} />
    </EffectComposer>
  );
}
