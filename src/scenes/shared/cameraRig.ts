/**
 * Shared camera rig. Every lerping scene applies the same cursor-parallax law,
 * the same look target, and converges toward the same resting eye distance
 * (`cameraRig.restZ`) — so a route hop reads as one continuous camera, not a
 * cut between worlds. A scene expresses its own character purely through the
 * `targetZ` it passes (e.g. cluster's scroll-driven dive) and an optional
 * per-scene z-gain; the x/y parallax and lookAt stay identical everywhere.
 *
 * Pure, allocation-free, mutates the camera in place — safe to call every frame
 * from a scene's useFrame (CLAUDE.md pitfall #4).
 */
import type { RootState } from "@react-three/fiber";
import { cameraRig } from "@/config/console";

const { parallaxX, parallaxY, gain } = cameraRig;

/** Apply cursor parallax + z lerp toward `targetZ` + lookAt origin.
 *  `zGain` defaults to the shared parallax gain (cluster overrides it slightly
 *  for a snappier scroll dive). */
export function applyCameraRig(state: RootState, targetZ: number, zGain: number = gain) {
  const cam = state.camera;
  cam.position.x += (state.pointer.x * parallaxX - cam.position.x) * gain;
  cam.position.y += (state.pointer.y * parallaxY - cam.position.y) * gain;
  cam.position.z += (targetZ - cam.position.z) * zGain;
  cam.lookAt(0, 0, 0);
}
