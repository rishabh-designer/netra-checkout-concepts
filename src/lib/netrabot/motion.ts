/**
 * NetraBot ambient motion: the small always-on movement that keeps the bot alive
 * between expressions. Deterministic in time, so a frame is reproducible.
 */

import type { BodyMotion, EyeMotion } from "@/types/netrabot";
import { smoothstep, type Vec2 } from "./math";

/** Stable pseudo-random value in [-1, 1] for an integer seed. */
const hash = (seed: number) => {
  const raw = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (raw - Math.floor(raw)) * 2 - 1;
};

const SACCADE_INTERVAL_MS = 1100;
const SACCADE_TRAVEL_MS = 140;
const EYE_SACCADE_REACH = 6;
const EYE_SHAKE_REACH = 2.5;

/** Eye offset in face units. */
export function eyeMotionOffset(
  mode: EyeMotion,
  amount: number,
  speed: number,
  timeMs: number
): Vec2 {
  if (mode === "none" || amount <= 0) return [0, 0];
  const clock = timeMs * speed;
  if (mode === "shake") {
    return [
      Math.sin(clock * 0.06) * EYE_SHAKE_REACH * amount,
      Math.cos(clock * 0.071) * EYE_SHAKE_REACH * 0.6 * amount,
    ];
  }
  const step = Math.floor(clock / SACCADE_INTERVAL_MS);
  const blend = smoothstep(0, 1, ((clock % SACCADE_INTERVAL_MS) / SACCADE_TRAVEL_MS));
  const axis = (offset: number) => {
    const previous = hash((step - 1) * 2 + offset);
    const next = hash(step * 2 + offset);
    return (previous + (next - previous) * blend) * EYE_SACCADE_REACH * amount;
  };
  return [axis(0), axis(1) * 0.6];
}

export interface BodyMotionOffset {
  yaw: number;
  pitch: number;
  roll: number;
}

const DRIFT_REACH = 8;
const BODY_SHAKE_REACH = 3;

/** Extra head rotation in degrees. */
export function bodyMotionOffset(
  mode: BodyMotion,
  amount: number,
  speed: number,
  timeMs: number
): BodyMotionOffset {
  if (mode === "none" || amount <= 0) return { yaw: 0, pitch: 0, roll: 0 };
  const clock = timeMs * speed;
  if (mode === "shake") {
    return {
      yaw: Math.sin(clock * 0.05) * BODY_SHAKE_REACH * amount,
      pitch: 0,
      roll: Math.sin(clock * 0.063) * BODY_SHAKE_REACH * 0.5 * amount,
    };
  }
  return {
    yaw: Math.sin(clock * 0.0007) * DRIFT_REACH * amount,
    pitch: Math.sin(clock * 0.0011 + 1.3) * DRIFT_REACH * 0.6 * amount,
    roll: Math.sin(clock * 0.0005 + 2.1) * DRIFT_REACH * 0.25 * amount,
  };
}
