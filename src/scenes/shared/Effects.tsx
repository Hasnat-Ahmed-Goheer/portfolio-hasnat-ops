"use client";

import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import { fx } from "@/config/theme";

/** Shared post pipeline — first knobs dropped under load (see PLAN §E). */
export default function Effects() {
  return (
    /* multisampling 0: MSAA on the composer's buffers is the single most
       expensive default here and invisible on glow-field scenes */
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={fx.bloomIntensity}
        luminanceThreshold={fx.bloomThreshold}
      />
      <Noise opacity={fx.grainOpacity} />
      <Vignette darkness={fx.vignetteDarkness} eskil={false} />
    </EffectComposer>
  );
}
