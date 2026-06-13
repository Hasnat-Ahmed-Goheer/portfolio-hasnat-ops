"use client";

/**
 * Module-level frame meter. A tiny <FrameMeter/> inside the canvas calls
 * tick() every frame; DOM readers (the telemetry strip, the `top` command)
 * poll getFps() / getStats(). Deliberately store-free — no React state, no
 * re-renders, no useFrame→store writes — just a mutated singleton.
 */
let fps = 60;
let frames = 0;
let last = typeof performance !== "undefined" ? performance.now() : 0;
let worst = 60;

export function tick(now: number) {
  frames++;
  const elapsed = now - last;
  if (elapsed >= 500) {
    fps = Math.round((frames * 1000) / elapsed);
    worst = Math.min(worst, fps);
    frames = 0;
    last = now;
  }
}

export function getFps() {
  return fps;
}

/** rolling worst frame-rate seen this session (reset by `top`) */
export function getWorstFps() {
  return worst;
}

export function resetWorst() {
  worst = fps;
}
