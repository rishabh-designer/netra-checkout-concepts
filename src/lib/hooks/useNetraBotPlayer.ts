"use client";

import { useEffect, useRef } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot/BotSvg";
import {
  sampleDirector,
  startDirector,
  stepDirector,
  type DirectorEvent,
  type DirectorInput,
  type DirectorPhase,
  type DirectorState,
} from "@/lib/netrabot/director";
import { applyGaze, smoothGaze, type GazeTarget } from "@/lib/netrabot/gaze";
import { playbackElapsed, seekPlayback, stepExpression } from "@/lib/netrabot/playback";
import { createRandom, randomSeed } from "@/lib/netrabot/random";
import { layoutTimeline } from "@/lib/netrabot/timeline";
import type { BotDefinition, Expression } from "@/types/netrabot";

export interface PlayerFrameInfo {
  /** The animation on screen (the base, a reaction, an appear or a disappear). */
  animation: string;
  phase: DirectorPhase;
  /** ms into the current lap. */
  elapsedMs: number;
  /** One lap, ms. */
  totalMs: number;
}

export interface NetraBotPlayerOptions {
  definition: BotDefinition | null;
  /** The resting animation. Falls back to the first loop (then the first animation) if missing. */
  animation: string | null;
  /** When set, the bot shows this expression instead of playing (live editing). */
  pose?: Expression | null;
  /** Freezes the clock: playback, blinking and ambient motion all hold still. */
  paused?: boolean;
  /** Clock multiplier. 1 = real time. */
  speed?: number;
  /** Change this number to restart the resting animation from the top. */
  restartToken?: number;
  /** Omit (or true) and the bot is simply there; false plays `exit` and stays gone. */
  visible?: boolean;
  /** Appear and disappear animations. */
  enter?: string | null;
  exit?: string | null;
  /** Change this number to play the appear again while the bot is shown. */
  enterToken?: number;
  /** Replay a resting animation that plays once after this gap (the studio preview). */
  replayGapMs?: number | null;
  /** Where the bot should look, read fresh each frame. Null (or omitted) means straight ahead. */
  getGaze?: () => GazeTarget | null;
  /** Every bot the player should draw into; read fresh each frame. */
  getHandles: () => (BotSvgHandle | null | undefined)[];
  /** Steps starting (for effects), appear finished, disappear finished. */
  onEvent?: (event: DirectorEvent) => void;
  /** Every frame: what is playing and how far in (the studio timeline's playhead). */
  onFrame?: (frame: PlayerFrameInfo) => void;
}

const MAX_FRAME_MS = 100;
const FALLBACK_CLOSED_HEIGHT = 4;
/** Under reduced motion, appearing and disappearing are a plain fade this long. */
const REDUCED_FADE_MS = 200;

/** The resting animation to use: the one asked for, else the first loop, else the first animation. */
export function resolveBase(definition: BotDefinition, key: string | null): string | null {
  if (key && definition.animations[key]) return key;
  const loop = definition.animationOrder.find((k) => definition.animations[k]?.kind === "loop");
  return loop ?? definition.animationOrder[0] ?? null;
}

const known = (definition: BotDefinition, key: string | null | undefined) =>
  key && definition.animations[key] ? key : null;

/**
 * useNetraBotPlayer - one requestAnimationFrame loop that plays the bot and
 * draws it into any number of BotSvg handles. A director (lib/netrabot/
 * director.ts) decides what plays: appear, the resting animation, reactions,
 * disappear. Honours prefers-reduced-motion by holding the resting face and
 * fading in and out. Returns `getCurrent()` (the expression on screen, so a
 * caller can freeze the bot and keep editing from exactly what the user saw),
 * `react(key)` (play once, then return) and `seek(ms)` (jump the current
 * animation, for the timeline).
 */
export function useNetraBotPlayer(options: NetraBotPlayerOptions) {
  const latest = useRef(options);
  const current = useRef<Expression | null>(null);
  const reaction = useRef<{ key: string; token: number } | null>(null);
  const pendingSeek = useRef<number | null>(null);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    let raf = 0;
    let lastReal = performance.now();
    let clock = 0;
    let gaze: GazeTarget = { x: 0, y: 0 };
    let director: DirectorState | null = null;
    /** The face before gaze: what a new animation tweens from. */
    let lastSample: Expression | null = null;
    let mounted = false;
    let random = createRandom(randomSeed());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let fade = latest.current.visible === false ? 0 : 1;
    let fadeReported = fade === 0;

    const emit = (events: DirectorEvent[]) => {
      const onEvent = latest.current.onEvent;
      if (!onEvent) return;
      for (const event of events) {
        // Under reduced motion the fade decides when the bot has gone.
        if (reduced.matches && event.type === "exited") continue;
        onEvent(event);
      }
    };

    const frame = (real: number) => {
      raf = requestAnimationFrame(frame);
      const opts = latest.current;
      const delta = Math.min(MAX_FRAME_MS, real - lastReal);
      lastReal = real;
      const definition = opts.definition;
      if (!definition) return;
      if (!opts.paused) clock += delta * (opts.speed ?? 1);
      const base = resolveBase(definition, opts.animation);
      if (!base) return;

      const motionless = reduced.matches;
      const input: DirectorInput = {
        base,
        restartToken: opts.restartToken ?? 0,
        visible: opts.visible ?? true,
        enter: motionless ? null : known(definition, opts.enter),
        exit: motionless ? null : known(definition, opts.exit),
        reaction: reaction.current,
        enterToken: opts.enterToken ?? 0,
        replayGapMs: opts.replayGapMs ?? null,
      };

      let expression: Expression;
      let blink = 1;
      let blank = false;

      if (opts.pose) {
        // Shaping a pose by hand: the director restarts from it afterwards, with no appear.
        director = null;
        expression = opts.pose;
      } else {
        if (director && !definition.animations[director.playback.animation]) director = null;
        if (!director) {
          // Only the very first start plays the appear animation.
          const started = startDirector(definition, mounted ? { ...input, enter: null } : input, clock, lastSample);
          director = started.state;
          emit(started.events);
          random = createRandom(randomSeed());
        } else {
          if (pendingSeek.current !== null) {
            director = { ...director, playback: seekPlayback(definition, director.playback, clock, pendingSeek.current) };
            random = createRandom(Math.round(pendingSeek.current));
          }
          const from = lastSample ?? sampleDirector(definition, director, clock).expression;
          const stepped = stepDirector(definition, director, input, clock, random, from);
          director = stepped.state;
          emit(stepped.events);
        }
        pendingSeek.current = null;
        mounted = true;

        const sample = sampleDirector(definition, director, clock);
        expression = sample.expression;
        blink = sample.blink;
        blank = sample.blank;

        if (motionless) {
          // Hold the resting animation's last face, still, and fade presence in and out.
          const animation = definition.animations[base];
          const last = animation.steps[animation.steps.length - 1];
          const target = input.visible ? 1 : 0;
          fade = target > fade ? Math.min(1, fade + delta / REDUCED_FADE_MS) : Math.max(0, fade - delta / REDUCED_FADE_MS);
          const face = stepExpression(definition, last);
          expression = { ...face, eyeMotion: "none", bodyMotion: "none", opacity: face.opacity * fade };
          blink = 1;
          blank = false;
          if (fade === 0 && !fadeReported) {
            fadeReported = true;
            opts.onEvent?.({ type: "exited" });
          } else if (fade > 0) {
            fadeReported = false;
          }
        }
      }
      lastSample = expression;

      // Looking at the pointer rides on top of playback, but never while a pose is being shaped by hand.
      if (opts.pose || motionless) {
        gaze = { x: 0, y: 0 };
      } else {
        // Real time, not the animation clock: following the pointer stays live while the animation is paused.
        gaze = smoothGaze(gaze, opts.getGaze?.() ?? null, delta, definition.gaze.smoothingMs);
        expression = applyGaze(expression, gaze, definition.gaze);
      }

      current.current = expression;
      const playing = director ? definition.animations[director.playback.animation] : undefined;
      const closedHeight = playing?.blink.closedHeight ?? FALLBACK_CLOSED_HEIGHT;
      for (const handle of opts.getHandles()) handle?.draw({ expression, blink, timeMs: clock, closedHeight, blank });

      if (opts.onFrame && director && playing) {
        opts.onFrame({
          animation: director.playback.animation,
          phase: director.phase,
          elapsedMs: playbackElapsed(definition, director.playback, clock),
          totalMs: layoutTimeline(playing).total,
        });
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return {
    getCurrent: () => current.current,
    /** Play `key` once, then go back to the resting animation. */
    react: (key: string) => {
      reaction.current = { key, token: (reaction.current?.token ?? 0) + 1 };
    },
    /** Jump the animation on screen to `ms` after its start. */
    seek: (ms: number) => {
      pendingSeek.current = ms;
    },
  };
}
