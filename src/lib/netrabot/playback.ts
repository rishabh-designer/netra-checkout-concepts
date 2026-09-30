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

import type { AnimationStep, BotDefinition, Expression, NetraAnimation } from "@/types/netrabot";
import { withIntensity } from "./blend";
import { ease, lerpExpression, type ColorDefaults } from "./interpolate";
import { lerp } from "./math";
import type { Random } from "./random";
import { buildSequence, layoutTimeline, locate, stepDuration } from "./timeline";

export { buildSequence } from "./timeline";
export type { Random } from "./random";

export interface PlaybackState {
  animation: string;
  /** Index into the play order (ping-pong bounces back through the middle). */
  position: number;
  lap: number;
  positionStartedAt: number;
  /** Where the bot was when this animation began (the first lap's "previous"). */
  entryFrom: Expression;
  /** The play-order position the animation began at (0 unless it skipped ahead). */
  entryPosition: number;
  finished: boolean;
  blinkDueAt: number;
  blinkStartedAt: number | null;
  /** The next blink is the quick second half of a pair. */
  blinkPaired: boolean;
}

/** Gap between the two blinks of a pair. */
const DOUBLE_BLINK_GAP_MS = 120;
/** Most blinks caught up in one call (after a long pause or a seek). */
const MAX_BLINK_CATCH_UP = 64;
const NEUTRAL_KEY = "neutral";

export function resolveExpression(definition: BotDefinition, key: string): Expression {
  const named = definition.expressions[key] ?? definition.expressions[definition.expressionOrder[0]];
  return named.values;
}

/** The face intensity scales from: "neutral" when the design has one, otherwise its first face. */
export function neutralExpression(definition: BotDefinition): Expression {
  return resolveExpression(definition, definition.expressions[NEUTRAL_KEY] ? NEUTRAL_KEY : definition.expressionOrder[0]);
}

export const colorDefaults = (definition: BotDefinition): ColorDefaults => ({
  body: definition.body.color,
  eye: definition.eyeColor,
});

/** A step's face, at the step's intensity. */
export function stepExpression(definition: BotDefinition, step: AnimationStep): Expression {
  const values = resolveExpression(definition, step.expression);
  const intensity = step.intensity ?? 1;
  if (Math.abs(intensity - 1) < 1e-4) return values;
  return withIntensity(neutralExpression(definition), values, intensity, colorDefaults(definition));
}

const nextBlinkGap = (animation: NetraAnimation, random: Random) => {
  const { minIntervalMs, maxIntervalMs } = animation.blink;
  return lerp(minIntervalMs, Math.max(minIntervalMs, maxIntervalMs), random());
};

/**
 * Begin an animation at `now`. `from` is where the bot is (null starts on the
 * first step's face). `position` skips ahead in the play order, e.g. past an
 * appear animation's "start hidden" step when it interrupts a disappear.
 */
export function startPlayback(
  definition: BotDefinition,
  animationKey: string,
  now: number,
  from: Expression | null,
  position = 0
): PlaybackState {
  const animation = definition.animations[animationKey];
  const start = Math.min(Math.max(0, position), animation.steps.length - 1);
  return {
    animation: animationKey,
    position: start,
    lap: 0,
    positionStartedAt: now,
    entryFrom: from ?? stepExpression(definition, animation.steps[start]),
    entryPosition: start,
    finished: false,
    blinkDueAt: now + animation.blink.initialDelayMs,
    blinkStartedAt: null,
    blinkPaired: false,
  };
}

/** Jump to `ms` after the animation began, as if it had played from the top. */
export function seekPlayback(definition: BotDefinition, state: PlaybackState, now: number, ms: number): PlaybackState {
  const animation = definition.animations[state.animation];
  if (!animation) return state;
  const origin = now - Math.max(0, ms);
  const place = locate(animation, ms);
  return {
    ...state,
    position: place.position,
    lap: place.lap,
    positionStartedAt: origin + place.positionStart,
    entryPosition: 0,
    finished: place.finished,
    blinkDueAt: origin + animation.blink.initialDelayMs,
    blinkStartedAt: null,
    blinkPaired: false,
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
  if (!blink.enabled) {
    next.blinkStartedAt = null;
    return next;
  }
  for (let guard = 0; guard < MAX_BLINK_CATCH_UP; guard++) {
    if (next.blinkStartedAt === null) {
      if (now < next.blinkDueAt) break;
      next.blinkStartedAt = next.blinkDueAt;
    }
    const endsAt = next.blinkStartedAt + blink.durationMs;
    if (now < endsAt) break;
    const pair = !next.blinkPaired && (blink.doubleChance ?? 0) > 0 && random() < blink.doubleChance;
    next.blinkDueAt = endsAt + (pair ? DOUBLE_BLINK_GAP_MS : nextBlinkGap(animation, random));
    next.blinkPaired = pair;
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

/** A once-through animation has played to its end (loops and ping-pong count one full lap). */
export const playedThrough = (state: PlaybackState) => state.finished || state.lap > 0;

/** ms into the current lap, for a playhead. */
export function playbackElapsed(definition: BotDefinition, state: PlaybackState, now: number): number {
  const animation = definition.animations[state.animation];
  if (!animation) return 0;
  const { segments, total } = layoutTimeline(animation);
  if (state.finished) return total;
  const segment = segments[Math.min(state.position, segments.length - 1)];
  return Math.min(total, segment.start + Math.max(0, Math.min(now - state.positionStartedAt, segment.end - segment.start)));
}

export interface PlaybackSample {
  expression: Expression;
  blink: number;
}

export function samplePlayback(definition: BotDefinition, state: PlaybackState, now: number): PlaybackSample {
  const animation = definition.animations[state.animation];
  const sequence = buildSequence(animation);
  const position = Math.min(state.position, sequence.length - 1);
  const step = animation.steps[sequence[position]];
  const target = stepExpression(definition, step);

  let previous: Expression;
  if (state.lap === 0 && position === (state.entryPosition ?? 0)) {
    previous = state.entryFrom;
  } else if (position > 0) {
    previous = stepExpression(definition, animation.steps[sequence[position - 1]]);
  } else {
    previous = stepExpression(definition, animation.steps[sequence[sequence.length - 1]]);
  }

  const elapsed = now - state.positionStartedAt;
  const expression =
    step.transitionMs > 0 && elapsed < step.transitionMs && !state.finished
      ? lerpExpression(previous, target, ease(step.easing, elapsed / step.transitionMs, step.bounce), colorDefaults(definition))
      : target;
  return { expression, blink: blinkAt(animation, state, now) };
}
