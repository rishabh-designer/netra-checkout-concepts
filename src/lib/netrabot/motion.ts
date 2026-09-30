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
/** Reading: one line across, then a quick return to the start of the next. */
const SCAN_LINE_MS = 1500;
const SCAN_RETURN_SHARE = 0.14;
const SCAN_REACH = 7;
const SCAN_LINES = 3;
const SCAN_LINE_DROP = 1.6;
const ROLL_REACH = 5;
const ROLL_SPEED = 0.0042;

/** Eye offset in face units. */
export function eyeMotionOffset(mode: EyeMotion, amount: number, speed: number, timeMs: number): Vec2 {
  if (mode === "none" || amount <= 0) return [0, 0];
  const clock = timeMs * speed;
  if (mode === "shake") {
    return [
      Math.sin(clock * 0.06) * EYE_SHAKE_REACH * amount,
      Math.cos(clock * 0.071) * EYE_SHAKE_REACH * 0.6 * amount,
    ];
  }
  if (mode === "scan") {
    const line = Math.floor(clock / SCAN_LINE_MS);
    const progress = (clock % SCAN_LINE_MS) / SCAN_LINE_MS;
    const across =
      progress < 1 - SCAN_RETURN_SHARE
        ? progress / (1 - SCAN_RETURN_SHARE)
        : 1 - smoothstep(1 - SCAN_RETURN_SHARE, 1, progress);
    const drop = (line % SCAN_LINES) - (SCAN_LINES - 1) / 2;
    return [(across * 2 - 1) * SCAN_REACH * amount, -drop * SCAN_LINE_DROP * amount];
  }
  if (mode === "roll") {
    return [
      Math.cos(clock * ROLL_SPEED) * ROLL_REACH * amount,
      Math.sin(clock * ROLL_SPEED) * ROLL_REACH * 0.8 * amount,
    ];
  }
  const step = Math.floor(clock / SACCADE_INTERVAL_MS);
  const blend = smoothstep(0, 1, (clock % SACCADE_INTERVAL_MS) / SACCADE_TRAVEL_MS);
  const axis = (offset: number) => {
    const previous = hash((step - 1) * 2 + offset);
    const next = hash(step * 2 + offset);
    return (previous + (next - previous) * blend) * EYE_SACCADE_REACH * amount;
  };
  return [axis(0), axis(1) * 0.6];
}

export interface BodyMotionOffset {
  /** Extra head rotation, degrees. */
  yaw: number;
  pitch: number;
  roll: number;
  /** Extra rise, face units. */
  lift: number;
  /** Extra stretch: positive grows taller and a little narrower. */
  stretch: number;
}

const STILL: BodyMotionOffset = { yaw: 0, pitch: 0, roll: 0, lift: 0, stretch: 0 };
const DRIFT_REACH = 8;
const BODY_SHAKE_REACH = 3;
const BREATHE_STRETCH = 0.03;
const BOB_LIFT = 5;
const NOD_REACH = 7;
const TREMBLE_REACH = 1.4;
const SWAY_REACH = 7;

/** Extra head rotation, rise and stretch. */
export function bodyMotionOffset(mode: BodyMotion, amount: number, speed: number, timeMs: number): BodyMotionOffset {
  if (mode === "none" || amount <= 0) return STILL;
  const clock = timeMs * speed;
  switch (mode) {
    case "shake":
      return {
        ...STILL,
        yaw: Math.sin(clock * 0.05) * BODY_SHAKE_REACH * amount,
        roll: Math.sin(clock * 0.063) * BODY_SHAKE_REACH * 0.5 * amount,
      };
    case "breathe": {
      const breath = Math.sin(clock * 0.0021);
      return { ...STILL, stretch: breath * BREATHE_STRETCH * amount, lift: breath * 0.8 * amount };
    }
    case "bob":
      return { ...STILL, lift: Math.abs(Math.sin(clock * 0.0045)) * BOB_LIFT * amount, pitch: Math.sin(clock * 0.009) * 1.5 * amount };
    case "nod":
      return { ...STILL, pitch: Math.sin(clock * 0.0055) * NOD_REACH * amount };
    case "tremble":
      return {
        ...STILL,
        yaw: Math.sin(clock * 0.09) * TREMBLE_REACH * amount,
        roll: Math.sin(clock * 0.113 + 1.1) * TREMBLE_REACH * 0.7 * amount,
        lift: Math.sin(clock * 0.131 + 0.4) * 0.8 * amount,
      };
    case "sway":
      return {
        ...STILL,
        roll: Math.sin(clock * 0.0017) * SWAY_REACH * amount,
        yaw: Math.sin(clock * 0.0017 + 0.6) * SWAY_REACH * 0.45 * amount,
      };
    default:
      return {
        ...STILL,
        yaw: Math.sin(clock * 0.0007) * DRIFT_REACH * amount,
        pitch: Math.sin(clock * 0.0011 + 1.3) * DRIFT_REACH * 0.6 * amount,
        roll: Math.sin(clock * 0.0005 + 2.1) * DRIFT_REACH * 0.25 * amount,
      };
  }
}
