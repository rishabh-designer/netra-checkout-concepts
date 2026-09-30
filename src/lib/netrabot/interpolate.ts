/**
 * NetraBot tweening: easing curves and expression blending.
 *
 * Every numeric field of an expression is listed once in FIELD_RULES /
 * FEATURE_RULES, with how it mixes and the range it must stay in. Tweening
 * (lerpExpression) and blending (blend.ts) both read these tables, so a new
 * field animates and blends the moment it is added here.
 */

import type { EyeGeometry, Expression, StepEasing } from "@/types/netrabot";
import { clamp, lerp } from "./math";

/** progress 0..1 in, eased progress out (may overshoot 0..1 for snappy, spring and anticipate). */
export function ease(kind: StepEasing, progress: number, bounce: number): number {
  const p = clamp(progress, 0, 1);
  if (p >= 1) return 1;
  switch (kind) {
    case "linear":
      return p;
    case "accelerate":
      return p * p * p;
    case "decelerate":
      return 1 - Math.pow(1 - p, 3);
    case "smooth":
      return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    case "snappy": {
      const overshoot = 1 + bounce * 2.2;
      const q = p - 1;
      return 1 + (overshoot + 1) * q * q * q + overshoot * q * q;
    }
    case "anticipate": {
      // Winds back first (a little, or a lot with bounce), then goes.
      const pull = 0.5 + bounce * 2.5;
      return (pull + 1) * p * p * p - pull * p * p;
    }
    default: {
      // Spring: a damped oscillation. Bounce 0 is a soft ease-out with no overshoot.
      const frequency = Math.PI / 2 + bounce * 3 * Math.PI;
      return 1 - Math.exp(-7 * p) * Math.cos(frequency * p);
    }
  }
}

const parseHex = (hex: string): [number, number, number] | null => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (channels: number[]) =>
  `#${channels.map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0")).join("")}`;

export function lerpColor(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return t < 0.5 ? from : to;
  const k = clamp(t, 0, 1);
  return toHex([0, 1, 2].map((i) => lerp(a[i], b[i], k)));
}

/** Weighted average of #rrggbb colours; the heaviest wins when one is not a hex colour. */
export function mixColors(entries: [string, number][]): string {
  const parsed = entries.map(([colour, weight]) => [parseHex(colour), weight] as const);
  if (parsed.some(([rgb]) => !rgb)) return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const total = parsed.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return toHex([0, 1, 2].map((i) => parsed.reduce((sum, [rgb, weight]) => sum + rgb![i] * weight, 0) / total));
}

/**
 * How one number mixes. "free" follows t past 0..1, so springs overshoot it
 * (a pop in size, a bounce in lift); "settled" uses t clamped to 0..1;
 * "latch" holds the larger end for the whole move and lands on the target,
 * so a floor clip is on before the bot sinks and stays on until it is up.
 */
export interface FieldRule<K extends string> {
  key: K;
  mix: "free" | "settled" | "latch";
  min?: number;
  max?: number;
}

type NumericKey<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T] & string;
export type ExpressionNumberKey = NumericKey<Expression>;
export type FeatureNumberKey = NumericKey<EyeGeometry>;

export const FIELD_RULES: FieldRule<ExpressionNumberKey>[] = [
  { key: "yaw", mix: "free" },
  { key: "pitch", mix: "free" },
  { key: "roll", mix: "free" },
  { key: "perspective", mix: "free", min: 0, max: 1 },
  { key: "spacing", mix: "free" },
  { key: "eyeRoundness", mix: "free", min: 0, max: 1 },
  { key: "eyeMotionAmount", mix: "settled", min: 0 },
  { key: "bodyMotionAmount", mix: "settled", min: 0 },
  { key: "motionSpeed", mix: "settled", min: 0.05 },
  { key: "opacity", mix: "free", min: 0, max: 1 },
  { key: "scale", mix: "free", min: 0 },
  { key: "lift", mix: "free" },
  { key: "blur", mix: "settled", min: 0 },
  { key: "dissolve", mix: "settled", min: 0, max: 1 },
  { key: "ground", mix: "latch", min: 0, max: 1 },
  { key: "squashX", mix: "free", min: 0.02 },
  { key: "squashY", mix: "free", min: 0.02 },
];

export const FEATURE_RULES: FieldRule<FeatureNumberKey>[] = [
  { key: "width", mix: "free" },
  { key: "height", mix: "free" },
  { key: "x", mix: "free" },
  { key: "y", mix: "free" },
  { key: "angle", mix: "free" },
  { key: "bend", mix: "free", min: -1, max: 1 },
  { key: "taper", mix: "free", min: -1, max: 1 },
  { key: "skew", mix: "free", min: -1, max: 1 },
];

export const FEATURE_KEYS = ["left", "right", "nose"] as const;

/** Keep a mixed value inside its rule's range. */
export const bound = <K extends string>(rule: FieldRule<K>, value: number) =>
  clamp(value, rule.min ?? -Infinity, rule.max ?? Infinity);

/** One field at tween progress t (which may overshoot 0..1). */
export const mixField = <K extends string>(rule: FieldRule<K>, from: number, to: number, t: number) => {
  if (rule.mix === "latch") return bound(rule, t >= 1 ? to : Math.max(from, to));
  return bound(rule, lerp(from, to, rule.mix === "free" ? t : clamp(t, 0, 1)));
};

const lerpFeature = (a: EyeGeometry, b: EyeGeometry, t: number): EyeGeometry => {
  const next = { ...b };
  for (const rule of FEATURE_RULES) next[rule.key] = mixField(rule, a[rule.key], b[rule.key], t);
  return next;
};

export interface ColorDefaults {
  body: string;
  eye: string;
}

/**
 * Blend two expressions. `t` may overshoot 0..1 (spring). Motion modes switch at
 * the midpoint; while they differ, the motion fades out and back in so it never pops.
 */
export function lerpExpression(a: Expression, b: Expression, t: number, defaults: ColorDefaults): Expression {
  const settled = clamp(t, 0, 1);
  const dip = Math.abs(1 - 2 * settled);
  const colour = (from: string | undefined, to: string | undefined, fallback: string) =>
    from === undefined && to === undefined ? undefined : lerpColor(from ?? fallback, to ?? fallback, settled);

  const next: Expression = {
    ...b,
    left: lerpFeature(a.left, b.left, t),
    right: lerpFeature(a.right, b.right, t),
    nose: lerpFeature(a.nose, b.nose, t),
    eyeMotion: t < 0.5 ? a.eyeMotion : b.eyeMotion,
    bodyMotion: t < 0.5 ? a.bodyMotion : b.bodyMotion,
    bodyColor: colour(a.bodyColor, b.bodyColor, defaults.body),
    eyeColor: colour(a.eyeColor, b.eyeColor, defaults.eye),
  };
  for (const rule of FIELD_RULES) next[rule.key] = mixField(rule, a[rule.key], b[rule.key], t);
  if (a.eyeMotion !== b.eyeMotion) next.eyeMotionAmount *= dip;
  if (a.bodyMotion !== b.bodyMotion) next.bodyMotionAmount *= dip;
  return next;
}
