"use client";

/**
 * tour.ts — the guided-tour ("demo"/"tour" command) beat script + runner.
 *
 * A guided tour is a scripted sequence of timed "beats" that walks a first-time
 * visitor through the whole console: it navigates routes, drives scene state via
 * sceneStore (progress / disturb / activeProject / motif / activeSkillGroup —
 * the DOM→3D one-way contract; scenes READ this, we only WRITE it), and shows a
 * caption per beat. It then returns control cleanly to the user.
 *
 * Why a plain runner and not a component: the timing + side effects need to be
 * cancellable from anywhere (Esc, any navigation, opening the terminal) and must
 * never leak a timer. The runner owns one timeout chain; stop() clears it and
 * releases every sceneStore value the tour touched. The overlay component is a
 * thin view over consoleStore's tour state.
 */
import type { CmdCtx } from "@/lib/commands";
import { lexicon } from "@/config/console";
import { useSceneStore } from "@/stores/sceneStore";
import { useUiStore } from "@/stores/uiStore";
import { useConsoleStore } from "@/stores/consoleStore";

export interface TourBeat {
  /** caption headline — kept in the ops-console lexicon */
  title: string;
  /** one-line description of the beat */
  body: string;
  /** dwell time before advancing to the next beat (ms) */
  hold: number;
  /** route this beat parks on (used to detect a user navigating away) */
  route: string;
  /** side effects fired when the beat begins (navigation + scene writes) */
  enter?: (ctx: CmdCtx) => void;
}

/**
 * The script. Total dwell ≈ 20s. Each beat narrates a real surface of the
 * console and drives the scene that route shows, so the camera/field actually
 * reacts as the caption claims. Scene writes go through sceneStore actions only.
 */
export const tourBeats: TourBeat[] = [
  {
    title: `${lexicon.sectionPrefix}CLUSTER`,
    body: "Booting the guided tour. This is the operator console — every page is a live scene. Watch the cluster.",
    hold: 3400,
    route: "/",
    enter: (ctx) => {
      ctx.navigate("/");
      const s = useSceneStore.getState();
      s.setProgress(0);
      s.bumpDisturb();
    },
  },
  {
    title: "kubectl scale",
    body: "Commands drive the world. Scaling the deployment up — the hive thickens with new replicas in real time.",
    hold: 3200,
    route: "/",
    enter: () => {
      const s = useSceneStore.getState();
      s.scaleReplicas(220);
      s.bumpDisturb();
    },
  },
  {
    title: "scroll dive",
    body: "Scrolling pushes the camera into the cluster. The whole field responds to one shared progress signal.",
    hold: 2800,
    route: "/",
    enter: () => {
      useSceneStore.getState().setProgress(0.6);
    },
  },
  {
    title: `${lexicon.sectionPrefix}OPERATOR`,
    body: "The operator profile. Hovering a skill cluster excites its constellation in the latent field behind the copy.",
    hold: 3200,
    route: "/about",
    enter: (ctx) => {
      const s = useSceneStore.getState();
      s.scaleReplicas(100); // release the cluster scale before leaving home
      s.setProgress(0);
      ctx.navigate("/about");
      s.setActiveSkillGroup("cloud");
      s.bumpDisturb();
    },
  },
  {
    title: `${lexicon.sectionPrefix}REGISTRY`,
    body: "The deployment registry. Each project is a node on the pipeline; selecting one lights its stream.",
    hold: 3000,
    route: "/work",
    enter: (ctx) => {
      const s = useSceneStore.getState();
      s.setActiveSkillGroup("");
      ctx.navigate("/work");
      s.setActiveProject(0);
      s.bumpDisturb();
    },
  },
  {
    title: `${lexicon.sectionPrefix}UPLINK`,
    body: "The uplink. That's the loop — run `help` in the terminal (~), or ⌘K for the palette. The console is yours.",
    hold: 3400,
    route: "/contact",
    enter: (ctx) => {
      const s = useSceneStore.getState();
      s.setActiveProject(-1);
      ctx.navigate("/contact");
      s.bumpDisturb();
    },
  },
];

/** Restore every sceneStore value the tour may have written. */
function releaseScene() {
  const s = useSceneStore.getState();
  s.setProgress(0);
  s.setActiveSkillGroup("");
  s.setActiveProject(-1);
  s.scaleReplicas(100);
}

let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

/**
 * Run beat `i`: fire its side effects, publish the index to the store, and
 * schedule the next beat (or finish). Reduced-motion / no-canvas tiers get a
 * gentler dwell and never rely on the camera flying — the captions ARE the
 * tour, the scene writes are harmless no-ops when there's no scene.
 */
function runBeat(i: number, ctx: CmdCtx) {
  if (i >= tourBeats.length) {
    stopTour();
    return;
  }
  const beat = tourBeats[i];
  useConsoleStore.getState().setTourBeat(i);
  beat.enter?.(ctx);

  const { reducedMotion, gpuTier } = useUiStore.getState();
  const calm = reducedMotion || gpuTier === "off";
  /* reduced-motion: hold a touch longer so the caption can be read without the
     scene motion carrying the beat */
  const hold = calm ? Math.round(beat.hold * 1.15) : beat.hold;

  clearTimer();
  timer = setTimeout(() => runBeat(i + 1, ctx), hold);
}

/** Begin the guided tour from beat 0. Idempotent — restarts cleanly.
 *
 * Beat 0 is deferred a tick on purpose: the `demo` command launches the tour in
 * the SAME synchronous handler that closes the terminal, and beat 0 immediately
 * navigates (`router.push`). Firing that navigation in the same tick raced the
 * `setTourActive(true)` commit under React's concurrent rendering — the overlay
 * render got abandoned and never mounted (it appeared only from ⌘K, which
 * doesn't navigate-on-start). Letting the active state + the launcher's close
 * commit first, then running beat 0, makes it deterministic from every entry. */
export function startTour(ctx: CmdCtx) {
  clearTimer();
  useConsoleStore.getState().setTourActive(true);
  timer = setTimeout(() => runBeat(0, ctx), 0);
}

/** Stop the tour: clear the pending timer and release the scene. Safe to call
    when no tour is running (used by interrupts: Esc, navigation, terminal). */
export function stopTour() {
  clearTimer();
  releaseScene();
  const console = useConsoleStore.getState();
  if (console.tourActive) console.setTourActive(false);
  console.setTourBeat(0);
}
