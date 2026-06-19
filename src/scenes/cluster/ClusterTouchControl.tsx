"use client";

/**
 * Long-press-to-grab driver for touch dragging the cluster (home hero).
 *
 * The scroll/drag conflict that disabled touch dragging is resolved by INTENT,
 * not by stealing events: a scroll gesture moves the finger immediately, so it
 * never arms; a drag is a brief hold-still THEN move. We start a short timer on
 * touchstart; any real movement before it fires cancels it (that was a scroll,
 * left untouched). If the finger holds still past the threshold we arm a drag —
 * publish the finger position to `clusterTouch` (read by ClusterScene), pause
 * Lenis via dragLock, and preventDefault subsequent moves so the page can't
 * scroll under the drag. Releasing flings the node (handled in the scene).
 *
 * Mounted only on the home route and only for coarse (touch) pointers; desktop
 * uses cursor magnetism instead. Reduced motion opts out (no fling physics).
 */
import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";
import { clusterTouch } from "./clusterTouch";

const HOLD_MS = 200;
const MOVE_CANCEL_PX = 12;

export default function ClusterTouchControl() {
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) return; // mouse → magnetism
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (useUiStore.getState().gpuTier === "off") return; // no canvas to drag

    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;
    let dragging = false;
    let sx = 0;
    let sy = 0;

    const toNdc = (clientX: number, clientY: number) => {
      clusterTouch.x = (clientX / window.innerWidth) * 2 - 1;
      clusterTouch.y = -(clientY / window.innerHeight) * 2 + 1;
    };

    const clearTimer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const end = () => {
      clearTimer();
      pending = false;
      if (dragging) {
        dragging = false;
        clusterTouch.active = false;
        useUiStore.getState().setDragLock(false);
      }
    };

    const onStart = (e: TouchEvent) => {
      if (dragging || e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      /* never hijack a tap meant for a link/button/field (guard `closest`:
         it's missing when the event target isn't an Element, e.g. window) */
      if (
        target &&
        typeof target.closest === "function" &&
        target.closest("a, button, input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      pending = true;
      clearTimer();
      timer = setTimeout(() => {
        if (!pending) return;
        dragging = true;
        pending = false;
        toNdc(sx, sy);
        clusterTouch.active = true;
        useUiStore.getState().setDragLock(true);
      }, HOLD_MS);
    };

    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (dragging) {
        e.preventDefault(); // own the gesture — no page scroll under the drag
        toNdc(t.clientX, t.clientY);
        return;
      }
      if (pending) {
        const moved = Math.hypot(t.clientX - sx, t.clientY - sy);
        if (moved > MOVE_CANCEL_PX) {
          /* that was a scroll, not a hold — stand down and let it scroll */
          clearTimer();
          pending = false;
        }
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      end();
    };
  }, []);

  return null;
}
