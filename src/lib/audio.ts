"use client";

/**
 * Tiny WebAudio synth — the console's ambient feedback. No asset files (zero
 * bundle cost): every sound is a short oscillator blip with a gain envelope,
 * routed through a quiet master bus. Off by default; the AudioContext is
 * created lazily on first enable (which is always a user gesture, so autoplay
 * policies are satisfied). Store-free singleton, mirrors perfMeter's pattern.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

type Win = Window & { webkitAudioContext?: typeof AudioContext };

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as Win).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.16; // the whole engine stays deliberately quiet
    master.connect(ctx.destination);
  }
  /* a suspended context (tab refocus, gesture timing) needs a nudge */
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setAudioEnabled(v: boolean) {
  /* flag only — never create the AudioContext here. Enabling can run from a
     post-mount hydrate effect (no user gesture), and creating a context
     outside a gesture logs a console warning. The context is created lazily
     inside blip(), which only ever fires from gesture-driven events. */
  enabled = v;
}

export function isAudioEnabled() {
  return enabled;
}

/** one oscillator blip with an exponential decay envelope */
function blip(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 1,
  delay = 0
) {
  if (!enabled) return;
  const ac = ensure();
  if (!ac || !master) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/* ── named cues (all no-ops when disabled) ───────────────────────────────── */

/** terminal/palette keypress — a barely-there tick, slightly detuned each time */
export function playKey() {
  blip(1500 + Math.random() * 220, 0.05, "square", 0.12);
}

/** palette selection move — soft cursor blip */
export function playMove() {
  blip(880, 0.06, "sine", 0.18);
}

/** navigation / command accepted — a confident two-note rise */
export function playNav() {
  blip(523.25, 0.09, "triangle", 0.3);
  blip(783.99, 0.12, "triangle", 0.3, 0.06);
}

/** uplink ping — a clean sonar sine */
export function playPing() {
  blip(1318.51, 0.18, "sine", 0.32);
  blip(659.25, 0.26, "sine", 0.2, 0.04);
}

/** palette/terminal open — a low confirming thunk */
export function playOpen() {
  blip(330, 0.12, "sine", 0.28);
}
