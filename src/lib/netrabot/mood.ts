/**
 * NetraBot emotion pad: faces placed by mood (valence: unhappy to happy) and
 * energy (calm to excited). A point on the pad becomes a face by blending the
 * few nearest presets, weighted by a soft falloff, so dragging across the pad
 * morphs smoothly from one mood into the next.
 */

import type { BotDefinition, Expression, MoodPoint } from "@/types/netrabot";
import { blendExpressions, withIntensity } from "./blend";
import { colorDefaults, neutralExpression } from "./playback";

/** How many faces a point blends. */
const NEAREST = 3;
/** Falloff width, in pad units (the pad runs -1 to 1). */
const SPREAD = 0.32;
/** Closer than this to a face and it is simply that face. */
const SNAP = 0.03;

export interface MoodFace {
  key: string;
  label: string;
  mood: MoodPoint;
}

/** Every face with a place on the pad. */
export function moodFaces(definition: BotDefinition): MoodFace[] {
  return definition.expressionOrder.flatMap((key) => {
    const named = definition.expressions[key];
    return named?.mood ? [{ key, label: named.label, mood: named.mood }] : [];
  });
}

const distance = (a: MoodPoint, b: MoodPoint) => Math.hypot(a.valence - b.valence, a.energy - b.energy);

/** The faces a point blends, nearest first, with weights that sum to 1. */
export function moodWeights(definition: BotDefinition, point: MoodPoint): { key: string; weight: number }[] {
  const nearest = moodFaces(definition)
    .map((face) => ({ key: face.key, d: distance(face.mood, point) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, NEAREST);
  if (nearest.length === 0) return [];
  if (nearest[0].d < SNAP) return [{ key: nearest[0].key, weight: 1 }];
  const raw = nearest.map(({ key, d }) => ({ key, weight: Math.exp(-(d * d) / (2 * SPREAD * SPREAD)) }));
  const total = raw.reduce((sum, { weight }) => sum + weight, 0) || 1;
  return raw.map(({ key, weight }) => ({ key, weight: weight / total }));
}

/** The face at a point on the pad, at an intensity (1 as blended, 0 neutral, up to 1.5). */
export function expressionAtMood(definition: BotDefinition, point: MoodPoint, intensity = 1): Expression {
  const weights = moodWeights(definition, point);
  const defaults = colorDefaults(definition);
  const neutral = neutralExpression(definition);
  if (weights.length === 0) return neutral;
  const blended = blendExpressions(
    weights.map(({ key, weight }) => [definition.expressions[key].values, weight] as const),
    defaults
  );
  return withIntensity(neutral, blended, intensity, defaults);
}
