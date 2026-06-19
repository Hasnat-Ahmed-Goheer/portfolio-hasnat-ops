/**
 * Mutable, non-reactive bridge for touch-dragging the cluster.
 *
 * Touch coordinates change ~60×/s during a drag; routing them through zustand
 * would re-render every subscriber each frame. Instead the long-press handler
 * (ClusterTouchControl) WRITES this singleton and ClusterScene READS it inside
 * useFrame — same DOM→3D one-way contract as sceneStore, just allocation- and
 * render-free for the hot per-frame channel.
 *
 * x/y are normalized device coordinates (-1..1, y up), matching three's
 * `state.pointer`, so the scene can reuse pointerToPlane unchanged.
 */
export const clusterTouch = {
  /** a long-press has armed a drag (vs. a scroll gesture, which never arms) */
  active: false,
  /** finger position in NDC */
  x: 0,
  y: 0,
};
