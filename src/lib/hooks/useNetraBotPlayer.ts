"use client";

import { useEffect, useRef } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot/BotSvg";
import {
  advancePlayback,
  resolveExpression,
  samplePlayback,
  startPlayback,
  type PlaybackState,
} from "@/lib/netrabot/playback";
import { applyGaze, smoothGaze, type GazeTarget } from "@/lib/netrabot/gaze";
import type { BotDefinition, Expression } from "@/types/netrabot";

export interface NetraBotPlayerOptions {
  definition: BotDefinition | null;
  /** Animation key to play. Falls back to the first animation if missing. */
  animation: string | null;
  /** When set, the bot shows this expression instead of playing (live editing). */
  pose?: Expression | null;
  /** Freezes the clock: playback, blinking and ambient motion all hold still. */
  paused?: boolean;
  /** Clock multiplier. 1 = real time. */
  speed?: number;
  /** Change this number to restart the current animation from the top. */
  restartToken?: number;
  /** Where the bot should look, read fresh each frame. Null (or omitted) means straight ahead. */
  getGaze?: () => GazeTarget | null;
  /** Every bot the player should draw into; read fresh each frame. */
  getHandles: () => (BotSvgHandle | null | undefined)[];
}

const MAX_FRAME_MS = 100;
const FALLBACK_CLOSED_HEIGHT = 4;

/**
 * useNetraBotPlayer - one requestAnimationFrame loop that plays an animation
 * (or holds a live pose) and draws it into any number of BotSvg handles.
 * Honours prefers-reduced-motion by holding the animation's final expression.
 * Returns `getCurrent()`: the expression on screen right now, so a caller can
 * freeze the bot and keep editing from exactly what the user saw.
 */
export function useNetraBotPlayer(options: NetraBotPlayerOptions) {
  const latest = useRef(options);
  const current = useRef<Expression | null>(null);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    let raf = 0;
    let lastReal = performance.now();
    let clock = 0;
    let gaze: GazeTarget = { x: 0, y: 0 };
    let state: PlaybackState | null = null;
    let runKey = "";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const frame = (real: number) => {
      raf = requestAnimationFrame(frame);
      const opts = latest.current;
      const delta = Math.min(MAX_FRAME_MS, real - lastReal);
      lastReal = real;
      const definition = opts.definition;
      if (!definition) return;
      if (!opts.paused) clock += delta * (opts.speed ?? 1);

      const animationKey =
        opts.animation && definition.animations[opts.animation] ? opts.animation : definition.animationOrder[0];
      const animation = definition.animations[animationKey];
      let expression: Expression;
      let blink = 1;

      if (opts.pose) {
        state = null;
        expression = opts.pose;
      } else if (!animation) {
        return;
      } else {
        const key = `${animationKey}:${opts.restartToken ?? 0}`;
        if (!state || key !== runKey) {
          runKey = key;
          state = startPlayback(definition, animationKey, clock, current.current);
        }
        state = advancePlayback(definition, state, clock, Math.random);
        const sample = samplePlayback(definition, state, clock);
        expression = sample.expression;
        blink = sample.blink;
        if (reduced.matches) {
          const last = animation.steps[animation.steps.length - 1];
          expression = { ...resolveExpression(definition, last.expression), eyeMotion: "none", bodyMotion: "none" };
          blink = 1;
        }
      }

      // Looking at the pointer rides on top of playback, but never while a pose is being shaped by hand.
      if (opts.pose || reduced.matches) {
        gaze = { x: 0, y: 0 };
      } else {
        // Real time, not the animation clock: following the pointer stays live while the animation is paused.
        gaze = smoothGaze(gaze, opts.getGaze?.() ?? null, delta, definition.gaze.smoothingMs);
        expression = applyGaze(expression, gaze, definition.gaze);
      }

      current.current = expression;
      const closedHeight = animation?.blink.closedHeight ?? FALLBACK_CLOSED_HEIGHT;
      for (const handle of opts.getHandles()) handle?.draw({ expression, blink, timeMs: clock, closedHeight });
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { getCurrent: () => current.current };
}
