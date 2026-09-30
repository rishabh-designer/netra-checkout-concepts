/**
 * NetraBot timeline maths: an animation laid out in time. The order steps play
 * in (ping-pong walks back through the middle), when each one starts, how
 * long it travels and holds, and where any moment falls. Playback, seeking and
 * the studio's timeline strip all read this, so they always agree.
 */

import type { NetraAnimation } from "@/types/netrabot";

const MIN_STEP_MS = 1;

/** Step indices in play order. */
export function buildSequence(animation: NetraAnimation): number[] {
  const indices = animation.steps.map((_, index) => index);
  if (animation.playbackMode !== "pingPong" || indices.length < 3) return indices;
  return [...indices, ...indices.slice(1, -1).reverse()];
}

export const stepDuration = (animation: NetraAnimation, stepIndex: number) => {
  const step = animation.steps[stepIndex];
  return Math.max(MIN_STEP_MS, step.transitionMs + step.holdMs);
};

export interface TimelineSegment {
  /** Index into the play order. */
  position: number;
  stepIndex: number;
  /** ms from the start of the lap. */
  start: number;
  travel: number;
  hold: number;
  end: number;
  /** A step ping-pong plays again on the way back. */
  returning: boolean;
}

export interface TimelineLayout {
  segments: TimelineSegment[];
  /** One lap, ms. */
  total: number;
}

export function layoutTimeline(animation: NetraAnimation): TimelineLayout {
  const sequence = buildSequence(animation);
  let cursor = 0;
  const segments = sequence.map((stepIndex, position): TimelineSegment => {
    const duration = stepDuration(animation, stepIndex);
    const step = animation.steps[stepIndex];
    const travel = Math.min(Math.max(0, step.transitionMs), duration);
    const segment = {
      position,
      stepIndex,
      start: cursor,
      travel,
      hold: duration - travel,
      end: cursor + duration,
      returning: position >= animation.steps.length,
    };
    cursor += duration;
    return segment;
  });
  return { segments, total: Math.max(MIN_STEP_MS, cursor) };
}

export interface TimelinePlace {
  lap: number;
  position: number;
  /** ms from the animation's first start to when this position began. */
  positionStart: number;
  finished: boolean;
}

/** Where `ms` after the animation began falls. "once" stops at the end; everything else wraps. */
export function locate(animation: NetraAnimation, ms: number): TimelinePlace {
  const { segments, total } = layoutTimeline(animation);
  const time = Math.max(0, ms);
  if (animation.playbackMode === "once" && time >= total) {
    return { lap: 0, position: segments.length - 1, positionStart: total, finished: true };
  }
  const lap = animation.playbackMode === "once" ? 0 : Math.floor(time / total);
  const within = time - lap * total;
  const segment = segments.find((s) => within < s.end) ?? segments[segments.length - 1];
  return { lap, position: segment.position, positionStart: lap * total + segment.start, finished: false };
}
