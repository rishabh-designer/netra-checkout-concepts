/**
 * NetraBot blending: many faces into one, a face at an intensity, a mirrored
 * face, and a random variation of a face. Pure functions on expressions,
 * reading the same field tables as tweening (interpolate.ts).
 */

import type { EyeGeometry, Expression } from "@/types/netrabot";
import {
  FEATURE_KEYS,
  FEATURE_RULES,
  FIELD_RULES,
  bound,
  lerpExpression,
  mixColors,
  type ColorDefaults,
} from "./interpolate";
import { clamp } from "./math";
import type { Random } from "./random";

export type Weighted = readonly [Expression, number];

/**
 * A weighted average of faces: every number is averaged, the heaviest face
 * picks the motion modes, and colours mix when any face overrides them.
 */
export function blendExpressions(entries: Weighted[], defaults: ColorDefaults): Expression {
  const live = entries.filter(([, weight]) => weight > 0);
  if (live.length === 0) return entries[0][0];
  if (live.length === 1) return live[0][0];
  const total = live.reduce((sum, [, weight]) => sum + weight, 0);
  const heaviest = live.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const mean = (read: (e: Expression) => number) => live.reduce((sum, [e, w]) => sum + read(e) * w, 0) / total;

  const feature = (key: (typeof FEATURE_KEYS)[number]): EyeGeometry => {
    const next = { ...heaviest[key] };
    for (const rule of FEATURE_RULES) next[rule.key] = bound(rule, mean((e) => e[key][rule.key]));
    return next;
  };
  const colour = (read: (e: Expression) => string | undefined, fallback: string) =>
    live.every(([e]) => read(e) === undefined) ? undefined : mixColors(live.map(([e, w]) => [read(e) ?? fallback, w]));

  const next: Expression = {
    ...heaviest,
    left: feature("left"),
    right: feature("right"),
    nose: feature("nose"),
    bodyColor: colour((e) => e.bodyColor, defaults.body),
    eyeColor: colour((e) => e.eyeColor, defaults.eye),
  };
  for (const rule of FIELD_RULES) next[rule.key] = bound(rule, mean((e) => e[rule.key]));
  return next;
}

/** Intensity 0 is the neutral face, 1 the face as saved; above 1 exaggerates it. */
export function withIntensity(neutral: Expression, expression: Expression, intensity: number, defaults: ColorDefaults) {
  if (Math.abs(intensity - 1) < 1e-4) return expression;
  return lerpExpression(neutral, expression, intensity, defaults);
}

const mirrorFeature = (feature: EyeGeometry, ownRest: EyeGeometry, otherRest: EyeGeometry): EyeGeometry => ({
  ...feature,
  // Mirror about the resting spot, so an off-centre artwork stays put.
  x: otherRest.x + (ownRest.x - feature.x),
  angle: -feature.angle,
  skew: -feature.skew,
});

/**
 * The face flipped left to right: the eyes swap, turns and tilts reverse.
 * `rest` is the neutral face, whose offsets are the resting spots.
 */
export function mirrorExpression(expression: Expression, rest: Expression): Expression {
  return {
    ...expression,
    yaw: -expression.yaw,
    roll: -expression.roll,
    left: mirrorFeature(expression.right, rest.right, rest.left),
    right: mirrorFeature(expression.left, rest.left, rest.right),
    nose: { ...mirrorFeature(expression.nose, rest.nose, rest.nose), bend: -expression.nose.bend },
  };
}

/** A tasteful random variation of a face ("Surprise me"). `amount` 1 is a clear change, 0.3 a nudge. */
export function varyExpression(expression: Expression, random: Random, amount = 1): Expression {
  const jitter = (reach: number) => (random() * 2 - 1) * reach * amount;
  const size = () => 1 + jitter(0.18);
  const eyeWidth = size();
  const eyeHeight = size();
  const lift = jitter(4);
  const tilt = jitter(10);
  const bend = jitter(0.25);
  const eye = (feature: EyeGeometry, side: -1 | 1): EyeGeometry => ({
    ...feature,
    width: Math.max(4, feature.width * eyeWidth * (1 + jitter(0.06))),
    height: Math.max(2, feature.height * eyeHeight * (1 + jitter(0.06))),
    y: feature.y + lift,
    angle: feature.angle + side * tilt,
    bend: clamp(feature.bend + bend, -1, 1),
  });
  return {
    ...expression,
    yaw: expression.yaw + jitter(12),
    pitch: expression.pitch + jitter(8),
    roll: expression.roll + jitter(7),
    left: eye(expression.left, -1),
    right: eye(expression.right, 1),
    nose: { ...expression.nose, height: Math.max(0, expression.nose.height * (1 + jitter(0.15))), angle: expression.nose.angle + jitter(6) },
  };
}
