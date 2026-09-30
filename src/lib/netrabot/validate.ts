/**
 * NetraBot definition validation, used when importing JSON from the studio.
 * Returns the first problem found as a readable message.
 */

import type { BotDefinition } from "@/types/netrabot";
import { DEFAULT_GAZE } from "./gaze";
import { SURFACE_KEYS } from "./surfaces";
import { samplePath } from "./svgPath";

export type ValidationResult = { ok: true; value: BotDefinition } | { ok: false; error: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

/** Every number under `node` must be finite; returns the path of the first that is not. */
function findBadNumber(node: unknown, path: string): string | null {
  if (typeof node === "number") return Number.isFinite(node) ? null : path;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const bad = findBadNumber(node[i], `${path}[${i}]`);
      if (bad) return bad;
    }
  } else if (isObject(node)) {
    for (const [key, child] of Object.entries(node)) {
      const bad = findBadNumber(child, `${path}.${key}`);
      if (bad) return bad;
    }
  }
  return null;
}

export function parseNetraBotDefinition(text: string): ValidationResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That is not valid JSON." };
  }
  if (!isObject(data) || data.schema !== "bimanetra/netrabot" || data.schemaVersion !== 1) {
    return { ok: false, error: "This file is not a NetraBot definition (schema bimanetra/netrabot v1)." };
  }
  const body = data.body;
  if (!isObject(body) || !SURFACE_KEYS.includes(body.surface as never)) {
    return { ok: false, error: "The body needs a known surface." };
  }
  if (!["width", "height", "depth"].every((key) => isFiniteNumber(body[key]) && (body[key] as number) > 0)) {
    return { ok: false, error: "The body width, height and depth must be positive numbers." };
  }
  if (!isFiniteNumber(body.bevel) || (body.bevel as number) < 0) {
    return { ok: false, error: "The body edge radius must be zero or more." };
  }
  try {
    samplePath(typeof body.outline === "string" ? body.outline : "");
  } catch (error) {
    return { ok: false, error: `The body outline is not usable: ${error instanceof Error ? error.message : "unknown problem"}` };
  }
  const { expressions, expressionOrder, animations, animationOrder } = data;
  if (!isObject(expressions) || !Array.isArray(expressionOrder) || expressionOrder.length === 0) {
    return { ok: false, error: "The definition needs at least one expression." };
  }
  if (!expressionOrder.every((key) => typeof key === "string" && isObject(expressions[key]))) {
    return { ok: false, error: "expressionOrder lists an expression that does not exist." };
  }
  for (const key of expressionOrder) {
    const values = (expressions[key as string] as Record<string, unknown>).values;
    if (!isObject(values) || !["left", "right", "nose"].every((feature) => isObject(values[feature]))) {
      return { ok: false, error: `Expression "${String(key)}" needs left, right and nose.` };
    }
  }
  if (!isObject(animations) || !Array.isArray(animationOrder)) {
    return { ok: false, error: "The definition needs an animations list." };
  }
  for (const key of animationOrder) {
    const animation = typeof key === "string" ? animations[key] : undefined;
    if (!isObject(animation) || !Array.isArray(animation.steps) || animation.steps.length === 0) {
      return { ok: false, error: `Animation "${String(key)}" needs at least one step.` };
    }
    for (const step of animation.steps) {
      if (!isObject(step) || typeof step.expression !== "string" || !isObject(expressions[step.expression])) {
        return { ok: false, error: `Animation "${String(key)}" uses an expression that does not exist.` };
      }
    }
  }
  data.gaze = { ...DEFAULT_GAZE, ...(isObject(data.gaze) ? data.gaze : {}) };
  const bad = findBadNumber(data, "definition");
  if (bad) return { ok: false, error: `${bad} is not a finite number.` };
  return { ok: true, value: data as unknown as BotDefinition };
}
