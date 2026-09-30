/**
 * NetraBot design migration: brings a saved or imported design up to the
 * current schema before it is validated, so nothing anyone made is lost.
 *
 *  - Schema 1 designs get every newer field at its "no change" value (no bend,
 *    fully shown, no squash, intensity 1, no effect), and each animation gets a
 *    kind ("once" animations become reactions).
 *  - Unknown choice values fall back to a safe default instead of failing.
 *  - Built-in presets the design has never been offered are added once, by
 *    preset revision: edits stay as they are, and a preset deleted after that
 *    stays deleted.
 */

import type { BotDefinition } from "@/types/netrabot";

export const SCHEMA_VERSION = 2;
export const SUPPORTED_SCHEMAS = [1, 2];

export const EYE_MOTIONS = ["none", "microSaccades", "shake", "scan", "roll"] as const;
export const BODY_MOTIONS = ["none", "slowDrift", "shake", "breathe", "bob", "nod", "tremble", "sway"] as const;
export const EASINGS = ["smooth", "snappy", "spring", "accelerate", "decelerate", "linear", "anticipate"] as const;
export const PLAYBACK_MODES = ["loop", "once", "pingPong"] as const;
export const ANIMATION_KINDS = ["loop", "reaction", "enter", "exit"] as const;
export const STEP_EFFECTS = ["none", "sparks"] as const;
export const EXPRESSION_CATEGORIES = [
  "everyday",
  "happy",
  "sad",
  "angry",
  "fear",
  "surprise",
  "thinking",
  "social",
  "energy",
  "presence",
  "mine",
] as const;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const FEATURE_DEFAULTS = { bend: 0, taper: 0, skew: 0 };
const PRESENCE_DEFAULTS = { opacity: 1, scale: 1, lift: 0, blur: 0, dissolve: 0, ground: 0, squashX: 1, squashY: 1 };
const STEP_DEFAULTS = { intensity: 1, effect: "none" };
const BLINK_DEFAULTS = { doubleChance: 0 };

const oneOf = <T extends string>(options: readonly T[], value: unknown, fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

/** Fill missing keys from `defaults` (existing values always win). */
const withDefaults = (node: Json, defaults: Json): Json => ({ ...defaults, ...node });

function migrateValues(values: Json): Json {
  const next = withDefaults(values, PRESENCE_DEFAULTS);
  for (const feature of ["left", "right", "nose"]) {
    if (isObject(next[feature])) next[feature] = withDefaults(next[feature] as Json, FEATURE_DEFAULTS);
  }
  next.eyeMotion = oneOf(EYE_MOTIONS, next.eyeMotion, "none");
  next.bodyMotion = oneOf(BODY_MOTIONS, next.bodyMotion, "none");
  return next;
}

function migrateExpression(key: string, named: Json, presets?: BotDefinition): Json {
  const preset = presets?.expressions[key];
  const next: Json = { ...named, category: oneOf(EXPRESSION_CATEGORIES, named.category, preset?.category ?? "mine") };
  if (!isObject(named.mood) && preset?.mood) next.mood = { ...preset.mood };
  if (isObject(named.values)) next.values = migrateValues(named.values);
  return next;
}

function migrateAnimation(key: string, animation: Json, presets?: BotDefinition): Json {
  const playbackMode = oneOf(PLAYBACK_MODES, animation.playbackMode, "loop");
  const fallbackKind = presets?.animations[key]?.kind ?? (playbackMode === "once" ? "reaction" : "loop");
  return {
    ...animation,
    playbackMode,
    kind: oneOf(ANIMATION_KINDS, animation.kind, fallbackKind),
    steps: Array.isArray(animation.steps)
      ? animation.steps.map((step) =>
          isObject(step)
            ? {
                ...withDefaults(step, STEP_DEFAULTS),
                easing: oneOf(EASINGS, step.easing, "smooth"),
                effect: oneOf(STEP_EFFECTS, step.effect, "none"),
              }
            : step
        )
      : animation.steps,
    blink: isObject(animation.blink) ? withDefaults(animation.blink, BLINK_DEFAULTS) : animation.blink,
  };
}

/** Add the built-in faces and animations this design has not been offered yet. */
function mergePresets(data: Json, presets: BotDefinition): Json {
  const revision = typeof data.presetRevision === "number" ? data.presetRevision : 1;
  if (revision >= presets.presetRevision) return data;
  const expressions = { ...(data.expressions as Json) };
  const animations = { ...(data.animations as Json) };
  const expressionOrder = [...(data.expressionOrder as string[])];
  const animationOrder = [...(data.animationOrder as string[])];
  for (const key of presets.expressionOrder) {
    if (expressions[key]) continue;
    expressions[key] = structuredClone(presets.expressions[key]);
    expressionOrder.push(key);
  }
  for (const key of presets.animationOrder) {
    if (animations[key]) continue;
    animations[key] = structuredClone(presets.animations[key]);
    animationOrder.push(key);
  }
  return { ...data, expressions, animations, expressionOrder, animationOrder, presetRevision: presets.presetRevision };
}

/**
 * Bring `data` (parsed JSON, any supported schema) up to the current schema.
 * Structure problems are left for validation to report.
 */
export function migrateDefinition(data: Json, presets?: BotDefinition): Json {
  let next: Json = { ...data, schemaVersion: SCHEMA_VERSION };
  next.presetRevision = typeof data.presetRevision === "number" && data.presetRevision >= 1 ? data.presetRevision : 1;
  if (isObject(data.expressions)) {
    next.expressions = Object.fromEntries(
      Object.entries(data.expressions).map(([key, named]) => [key, isObject(named) ? migrateExpression(key, named, presets) : named])
    );
  }
  if (isObject(data.animations)) {
    next.animations = Object.fromEntries(
      Object.entries(data.animations).map(([key, animation]) => [
        key,
        isObject(animation) ? migrateAnimation(key, animation, presets) : animation,
      ])
    );
  }
  const listsReady =
    isObject(next.expressions) && isObject(next.animations) && Array.isArray(next.expressionOrder) && Array.isArray(next.animationOrder);
  if (presets && listsReady) next = mergePresets(next, presets);
  return next;
}
