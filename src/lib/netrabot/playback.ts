/**
 * NetraBot playback: a pure state machine for one animation. Driven by a
 * monotonic clock (ms) and an injected random source, so it is testable and
 * has no timers of its own. Pausing is the caller's job: stop advancing the clock.
 *
 * Each step is "transition into the step's expression, then hold". Starting an
 * animation mid-flight tweens from wherever the bot currently is. The step
 * order is derived from the animation on every call, so live edits to the
 * animation (the studio) take effect without a restart.
 */

import type { BotDefinition, Expression, NetraAnimation } from "@/types/netrabot";
import { ease, lerpExpression } from "./interpolate";
import { lerp } from "./math";

export interface PlaybackState {
  animation: string;
  /** Index into the play order (ping-pong bounces back through the middle). */
  position: number;
  lap: number;
  positionStartedAt: number;
  /** Where the bot was when this animation began (the first lap's "previous"). */
  entryFrom: Expression;
  finished: boolean;
  blinkDueAt: number;
  blinkStartedAt: number | null;
}

export type Random = () => number;

const MIN_STEP_MS = 1;

export function resolveExpression(definition: BotDefinition, key: string): Expression {
  const named = definition.expressions[key] ?? definition.expressions[definition.expressionOrder[0]];
  return named.values;
}

/** Step indices in play order. */
export function buildSequence(animation: NetraAnimation): number[] {
  const indices = animation.steps.map((_, index) => index);
  if (animation.playbackMode !== "pingPong" || indices.length < 3) return indices;
  return [...indices, ...indices.slice(1, -1).reverse()];
}

const stepDuration = (animation: NetraAnimation, stepIndex: number) => {
  const step = animation.steps[stepIndex];
  return Math.max(MIN_STEP_MS, step.transitionMs + step.holdMs);
};

const nextBlinkGap = (animation: NetraAnimation, random: Random) => {
  const { minIntervalMs, maxIntervalMs } = animation.blink;
  return lerp(minIntervalMs, Math.max(minIntervalMs, maxIntervalMs), random());
};

export function startPlayback(
  definition: BotDefinition,
  animationKey: string,
  now: number,
  from: Expression | null
): PlaybackState {
  const animation = definition.animations[animationKey];
  return {
    animation: animationKey,
    position: 0,
    lap: 0,
    positionStartedAt: now,
    entryFrom: from ?? resolveExpression(definition, animation.steps[0].expression),
    finished: false,
    blinkDueAt: now + animation.blink.initialDelayMs,
    blinkStartedAt: null,
  };
}

export function advancePlayback(
  definition: BotDefinition,
  state: PlaybackState,
  now: number,
  random: Random
): PlaybackState {
  const animation = definition.animations[state.animation];
  if (!animation) return state;
  const sequence = buildSequence(animation);
  const next = { ...state, position: Math.min(state.position, sequence.length - 1) };

  while (!next.finished) {
    const duration = stepDuration(animation, sequence[next.position]);
    if (now < next.positionStartedAt + duration) break;
    next.positionStartedAt += duration;
    if (next.position + 1 < sequence.length) {
      next.position += 1;
    } else if (animation.playbackMode === "once") {
      next.finished = true;
    } else {
      next.position = 0;
      next.lap += 1;
    }
  }

  const { blink } = animation;
  if (blink.enabled) {
    if (next.blinkStartedAt === null && now >= next.blinkDueAt) next.blinkStartedAt = next.blinkDueAt;
    if (next.blinkStartedAt !== null && now >= next.blinkStartedAt + blink.durationMs) {
      next.blinkDueAt = next.blinkStartedAt + blink.durationMs + nextBlinkGap(animation, random);
      next.blinkStartedAt = null;
    }
  } else {
    next.blinkStartedAt = null;
  }
  return next;
}

/** 1 = open, 0 = shut. */
export function blinkAt(animation: NetraAnimation, state: PlaybackState, now: number): number {
  if (!animation.blink.enabled || state.blinkStartedAt === null) return 1;
  const progress = (now - state.blinkStartedAt) / Math.max(1, animation.blink.durationMs);
  return progress <= 0 || progress >= 1 ? 1 : 1 - Math.sin(Math.PI * progress);
}

export interface PlaybackSample {
  expression: Expression;
  blink: number;
}

export function samplePlayback(definition: BotDefinition, state: PlaybackState, now: number): PlaybackSample {
  const animation = definition.animations[state.animation];
  const sequence = buildSequence(animation);
  const position = Math.min(state.position, sequence.length - 1);
  const defaults = { body: definition.body.color, eye: definition.eyeColor };
  const step = animation.steps[sequence[position]];
  const target = resolveExpression(definition, step.expression);

  let previous: Expression;
  if (position > 0) {
    previous = resolveExpression(definition, animation.steps[sequence[position - 1]].expression);
  } else if (state.lap === 0) {
    previous = state.entryFrom;
  } else {
    previous = resolveExpression(definition, animation.steps[sequence[sequence.length - 1]].expression);
  }

  const elapsed = now - state.positionStartedAt;
  const expression =
    step.transitionMs > 0 && elapsed < step.transitionMs && !state.finished
      ? lerpExpression(previous, target, ease(step.easing, elapsed / step.transitionMs, step.bounce), defaults)
      : target;
  return { expression, blink: blinkAt(animation, state, now) };
}
