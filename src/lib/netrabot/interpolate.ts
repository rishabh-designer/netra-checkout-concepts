/**
 * NetraBot tweening: easing curves and expression blending.
 */

import type { EyeGeometry, Expression, StepEasing } from "@/types/netrabot";
import { clamp, lerp } from "./math";

/** progress 0..1 in, eased progress out (may overshoot 1 for snappy and spring). */
export function ease(kind: StepEasing, progress: number, bounce: number): number {
  const p = clamp(progress, 0, 1);
  if (p >= 1) return 1;
  if (kind === "smooth") return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  if (kind === "snappy") {
    const overshoot = 1 + bounce * 2.2;
    const q = p - 1;
    return 1 + (overshoot + 1) * q * q * q + overshoot * q * q;
  }
  // Spring: a damped oscillation. Bounce 0 is a soft ease-out with no overshoot.
  const frequency = Math.PI / 2 + bounce * 3 * Math.PI;
  return 1 - Math.exp(-7 * p) * Math.cos(frequency * p);
}

const parseHex = (hex: string): [number, number, number] | null => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export function lerpColor(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return t < 0.5 ? from : to;
  const k = clamp(t, 0, 1);
  const channel = (i: number) => Math.round(lerp(a[i], b[i], k)).toString(16).padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}

const lerpEye = (a: EyeGeometry, b: EyeGeometry, t: number): EyeGeometry => ({
  width: lerp(a.width, b.width, t),
  height: lerp(a.height, b.height, t),
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  angle: lerp(a.angle, b.angle, t),
});

export interface ColorDefaults {
  body: string;
  eye: string;
}

/**
 * Blend two expressions. `t` may overshoot 0..1 (spring). Motion modes switch at
 * the midpoint; while they differ, the motion fades out and back in so it never pops.
 */
export function lerpExpression(a: Expression, b: Expression, t: number, defaults: ColorDefaults): Expression {
  const eyeModesDiffer = a.eyeMotion !== b.eyeMotion;
  const bodyModesDiffer = a.bodyMotion !== b.bodyMotion;
  const dip = Math.abs(1 - 2 * clamp(t, 0, 1));
  const colour = (from: string | undefined, to: string | undefined, fallback: string) =>
    from === undefined && to === undefined
      ? undefined
      : lerpColor(from ?? fallback, to ?? fallback, clamp(t, 0, 1));
  return {
    yaw: lerp(a.yaw, b.yaw, t),
    pitch: lerp(a.pitch, b.pitch, t),
    roll: lerp(a.roll, b.roll, t),
    perspective: clamp(lerp(a.perspective, b.perspective, t), 0, 1),
    spacing: lerp(a.spacing, b.spacing, t),
    eyeRoundness: clamp(lerp(a.eyeRoundness, b.eyeRoundness, t), 0, 1),
    left: lerpEye(a.left, b.left, t),
    right: lerpEye(a.right, b.right, t),
    nose: lerpEye(a.nose, b.nose, t),
    eyeMotion: t < 0.5 ? a.eyeMotion : b.eyeMotion,
    eyeMotionAmount: lerp(a.eyeMotionAmount, b.eyeMotionAmount, clamp(t, 0, 1)) * (eyeModesDiffer ? dip : 1),
    bodyMotion: t < 0.5 ? a.bodyMotion : b.bodyMotion,
    bodyMotionAmount: lerp(a.bodyMotionAmount, b.bodyMotionAmount, clamp(t, 0, 1)) * (bodyModesDiffer ? dip : 1),
    motionSpeed: lerp(a.motionSpeed, b.motionSpeed, clamp(t, 0, 1)),
    bodyColor: colour(a.bodyColor, b.bodyColor, defaults.body),
    eyeColor: colour(a.eyeColor, b.eyeColor, defaults.eye),
  };
}
