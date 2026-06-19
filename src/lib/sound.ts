"use client";

/**
 * sound.ts — a tiny, zero-asset Web Audio synth for the operations console.
 *
 * Everything is generated live from oscillators + gain + filters (no audio
 * files, no npm dependency — bundle is a budget item). The whole layer is
 * MUTE BY DEFAULT and degrades to silent no-ops when:
 *   - sound is disabled (the common case),
 *   - the browser has no Web Audio (`AudioContext` undefined),
 *   - the context can't be created/resumed.
 *
 * Autoplay policy: browsers refuse to start an AudioContext until a real user
 * gesture. We therefore create/resume the context lazily, inside the first cue
 * that fires after a gesture — never at import time and never from the store's
 * enable action (which can run during a post-mount hydrate, outside a gesture,
 * and would log a console warning). Voices are short-lived: each cue spins up
 * its own oscillator(s), schedules an envelope, and is `stop()`ped so the nodes
 * are released and garbage-collected — nothing accumulates, no per-frame work.
 */

type Ctx = AudioContext & { _master?: GainNode };

let ctx: Ctx | null = null;
let unavailable = false;
/** mirror of consoleStore.soundEnabled — set via setSoundEnabled, read on every cue */
let enabled = false;

/** master bus level — deliberately low; this is texture, not a soundtrack */
const MASTER = 0.18;

/** keep the singleton context in sync with the store toggle */
export function setSoundEnabled(on: boolean) {
  enabled = on;
  /* turning OFF: drop the master to silence immediately. Don't close() the
     context — re-creating it later needs a fresh gesture; we just mute. */
  if (!on && ctx && ctx._master) {
    try {
      ctx._master.gain.cancelScheduledValues(ctx.currentTime);
      ctx._master.gain.setValueAtTime(0, ctx.currentTime);
    } catch {
      /* ignore */
    }
  } else if (on && ctx && ctx._master) {
    try {
      ctx._master.gain.setValueAtTime(MASTER, ctx.currentTime);
    } catch {
      /* ignore */
    }
  }
}

/** lazily create (and resume) the context — only ever called from inside a cue,
    i.e. after a user gesture. Returns null when audio is unavailable. */
function getCtx(): Ctx | null {
  if (unavailable) return null;
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  }
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) {
    unavailable = true;
    return null;
  }
  try {
    const c = new AC() as Ctx;
    const master = c.createGain();
    master.gain.value = MASTER;
    master.connect(c.destination);
    c._master = master;
    ctx = c;
    if (c.state === "suspended") void c.resume().catch(() => {});
    return c;
  } catch {
    unavailable = true;
    return null;
  }
}

/** common guard: bail unless enabled AND a context is available + running.
    `onlyExisting` cues (ambient/boot) never *create* a context — they only play
    when one already exists from a prior gesture, so they can't trigger a browser
    autoplay warning when fired at load time outside a gesture. */
function bus(onlyExisting = false): { c: Ctx; master: GainNode; t: number } | null {
  if (!enabled) return null;
  if (onlyExisting && !ctx) return null;
  const c = getCtx();
  if (!c || !c._master || c.state === "closed") return null;
  return { c, master: c._master, t: c.currentTime };
}

/**
 * One short voice: an oscillator through its own gain envelope into the master
 * bus. Auto-disconnects on `ended` so nodes don't pile up.
 */
function voice(
  freq: number,
  {
    type = "sine",
    dur = 0.08,
    gain = 0.5,
    decay,
    glide,
    filter,
    onlyExisting,
  }: {
    type?: OscillatorType;
    dur?: number;
    gain?: number;
    /** end frequency for a quick pitch glide (e.g. confirm rises) */
    glide?: number;
    /** attack→decay shaping; defaults to a fast pluck */
    decay?: number;
    /** optional low/high-pass to soften the timbre */
    filter?: { type: BiquadFilterType; freq: number };
    /** ambient cue: don't create a context, only play if one already exists */
    onlyExisting?: boolean;
  } = {}
) {
  const b = bus(onlyExisting);
  if (!b) return;
  const { c, master, t } = b;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glide), t + dur);

  const attack = Math.min(0.006, dur * 0.2);
  const d = decay ?? dur;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + d);

  let tail: AudioNode = g;
  if (filter) {
    const f = c.createBiquadFilter();
    f.type = filter.type;
    f.frequency.setValueAtTime(filter.freq, t);
    osc.connect(f);
    f.connect(g);
    tail = g;
  } else {
    osc.connect(g);
  }
  tail.connect(master);

  const stopAt = t + attack + d + 0.02;
  osc.start(t);
  osc.stop(stopAt);
  osc.onended = () => {
    try {
      osc.disconnect();
      g.disconnect();
    } catch {
      /* already gone */
    }
  };
}

/* ----------------------------- cue vocabulary ----------------------------- */

/** very soft keystroke tick — cheap, high, near-instant */
export function tick() {
  voice(1180 + Math.random() * 90, {
    type: "triangle",
    dur: 0.03,
    gain: 0.05,
    decay: 0.025,
    filter: { type: "highpass", freq: 600 },
  });
}

/** a soft UI click — nav links, primary buttons */
export function click() {
  voice(560, {
    type: "sine",
    dur: 0.05,
    gain: 0.09,
    decay: 0.05,
    filter: { type: "lowpass", freq: 2200 },
  });
}

/** confirm / blip — command executed, egg discovered (a small rising two-note) */
export function confirm() {
  voice(420, { type: "sine", dur: 0.07, gain: 0.1, glide: 620, decay: 0.07 });
  voice(630, { type: "sine", dur: 0.12, gain: 0.07, glide: 840, decay: 0.12 });
}

/** low uplink hum swell — scene disturb / egg pulse (optional, kept subtle).
    Ambient: only plays if a context already exists (won't unlock audio itself). */
export function hum() {
  voice(110, {
    type: "sine",
    dur: 0.5,
    gain: 0.07,
    decay: 0.45,
    onlyExisting: true,
    filter: { type: "lowpass", freq: 400 },
  });
  voice(165, {
    type: "sine",
    dur: 0.45,
    gain: 0.04,
    decay: 0.4,
    onlyExisting: true,
    filter: { type: "lowpass", freq: 500 },
  });
}

/** one subtle uplink tone — boot complete. Ambient: only plays if a context
    already exists (a returning visitor who has since interacted), never creates
    one at load time outside a gesture (would log an autoplay warning). */
export function uplink() {
  voice(330, { type: "sine", dur: 0.18, gain: 0.09, glide: 494, decay: 0.18, onlyExisting: true });
  voice(494, { type: "sine", dur: 0.4, gain: 0.06, glide: 660, decay: 0.36, onlyExisting: true });
}
