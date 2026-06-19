import * as THREE from "three";

/* one module-scoped scratch ray direction — these helpers run inside useFrame,
   so they must never allocate. Calls are synchronous within a frame, so a
   single shared vector is safe (no re-entrancy). */
const _dir = new THREE.Vector3();

/**
 * Project the screen-space pointer onto the world-space plane `z = planeZ`,
 * writing the hit point into `out` (and returning it). Allocation-free.
 *
 * Every scene that wants "where is the cursor in the world" was hand-rolling
 * this same unproject→ray→plane-intersection (cluster did it twice, latent
 * once); extracting it keeps the math identical across scenes so the pointer
 * reacts the same everywhere — part of making the four scenes one world.
 */
export function pointerToPlane(
  pointer: { x: number; y: number },
  camera: THREE.Camera,
  planeZ: number,
  out: THREE.Vector3
): THREE.Vector3 {
  _dir.set(pointer.x, pointer.y, 0.5).unproject(camera);
  _dir.sub(camera.position).normalize();
  /* ray.z is essentially never 0 (the camera looks down -z), but guard anyway:
     a parallel ray has no plane hit, so fall back to the camera position. */
  const k = _dir.z !== 0 ? (planeZ - camera.position.z) / _dir.z : 0;
  return out.copy(camera.position).addScaledVector(_dir, k);
}
