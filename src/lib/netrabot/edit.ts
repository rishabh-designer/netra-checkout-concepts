/**
 * NetraBot studio edit helpers. Every function returns a new value and never
 * mutates its input, so React state updates stay simple.
 */

import type {
  AnimationKind,
  AnimationStep,
  BotDefinition,
  Expression,
  ExpressionCategory,
  MoodPoint,
  NamedExpression,
  NetraAnimation,
} from "@/types/netrabot";

/** Fields that flip sign when an edit is copied to the other eye, so a symmetrical face stays symmetrical. */
const MIRRORED_FIELDS = new Set(["angle", "skew"]);

export function getPath(target: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], target);
}

export function setPath<T>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const node = target as Record<string, unknown>;
  const next = rest.length === 0 ? value : setPath(node[head] ?? {}, rest.join("."), value);
  return { ...node, [head]: next } as T;
}

/**
 * Set one expression field. With `linked` on, an edit to one eye is copied to the
 * other; tilt and lean mirror so a symmetrical face stays symmetrical.
 */
export function setExpressionField(expression: Expression, path: string, value: unknown, linked: boolean): Expression {
  let next = setPath(expression, path, value);
  const match = /^(left|right)\.(.+)$/.exec(path);
  if (linked && match) {
    const other = match[1] === "left" ? "right" : "left";
    const mirrored = MIRRORED_FIELDS.has(match[2]) && typeof value === "number" ? -value : value;
    next = setPath(next, `${other}.${match[2]}`, mirrored);
  }
  return next;
}

export function uniqueKey(label: string, taken: string[]): string {
  const words = label.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const base =
    words.length === 0
      ? "item"
      : words.map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())).join("");
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}${n}`)) n++;
  return `${base}${n}`;
}

export function addExpression(
  definition: BotDefinition,
  label: string,
  values: Expression,
  details: { category?: ExpressionCategory; mood?: MoodPoint } = {}
) {
  const key = uniqueKey(label, definition.expressionOrder);
  const named: NamedExpression = {
    label,
    category: details.category ?? "mine",
    ...(details.mood ? { mood: { ...details.mood } } : {}),
    values: structuredClone(values),
  };
  return {
    key,
    definition: {
      ...definition,
      expressions: { ...definition.expressions, [key]: named },
      expressionOrder: [...definition.expressionOrder, key],
    },
  };
}

/** Removing an expression also drops the animation steps that used it (an animation keeps at least one). */
export function removeExpression(definition: BotDefinition, key: string): BotDefinition {
  if (definition.expressionOrder.length <= 1) return definition;
  const expressionOrder = definition.expressionOrder.filter((k) => k !== key);
  const { [key]: removed, ...expressions } = definition.expressions;
  void removed;
  const animations = Object.fromEntries(
    Object.entries(definition.animations).map(([animationKey, animation]) => {
      const steps = animation.steps.filter((step) => step.expression !== key);
      return [animationKey, { ...animation, steps: steps.length > 0 ? steps : [{ ...animation.steps[0], expression: expressionOrder[0] }] }];
    })
  );
  return { ...definition, expressions, expressionOrder, animations };
}

export function renameExpression(definition: BotDefinition, key: string, label: string): BotDefinition {
  return { ...definition, expressions: { ...definition.expressions, [key]: { ...definition.expressions[key], label } } };
}

export function updateExpression(definition: BotDefinition, key: string, values: Expression): BotDefinition {
  return { ...definition, expressions: { ...definition.expressions, [key]: { ...definition.expressions[key], values } } };
}

/** Change a face's label, category or place on the emotion pad (mood: null takes it off the pad). */
export function updateExpressionDetails(
  definition: BotDefinition,
  key: string,
  details: { category?: ExpressionCategory; mood?: MoodPoint | null }
): BotDefinition {
  const current = definition.expressions[key];
  const { mood, ...rest } = current;
  const next: NamedExpression = { ...rest, ...(details.category ? { category: details.category } : {}) };
  const nextMood = details.mood === undefined ? mood : details.mood;
  if (nextMood) next.mood = nextMood;
  return { ...definition, expressions: { ...definition.expressions, [key]: next } };
}

export function addAnimation(definition: BotDefinition, label: string, from?: NetraAnimation, kind: AnimationKind = "loop") {
  const key = uniqueKey(label, definition.animationOrder);
  const base: NetraAnimation = from
    ? structuredClone(from)
    : {
        label,
        group: "Custom",
        description: "",
        kind,
        playbackMode: kind === "loop" ? "loop" : "once",
        steps: [
          {
            expression: definition.expressionOrder[0],
            holdMs: 1500,
            transitionMs: 400,
            easing: "smooth",
            bounce: 0.3,
            intensity: 1,
            effect: "none",
          },
        ],
        blink: {
          enabled: true,
          initialDelayMs: 1800,
          minIntervalMs: 2800,
          maxIntervalMs: 5000,
          durationMs: 260,
          closedHeight: 4,
          doubleChance: 0.12,
        },
      };
  return {
    key,
    definition: {
      ...definition,
      animations: { ...definition.animations, [key]: { ...base, label } },
      animationOrder: [...definition.animationOrder, key],
    },
  };
}

export function removeAnimation(definition: BotDefinition, key: string): BotDefinition {
  if (definition.animationOrder.length <= 1) return definition;
  const { [key]: removed, ...animations } = definition.animations;
  void removed;
  return { ...definition, animations, animationOrder: definition.animationOrder.filter((k) => k !== key) };
}

export function updateAnimation(definition: BotDefinition, key: string, animation: NetraAnimation): BotDefinition {
  return { ...definition, animations: { ...definition.animations, [key]: animation } };
}

export function addStep(animation: NetraAnimation, expression: string): NetraAnimation {
  const last = animation.steps[animation.steps.length - 1];
  const step: AnimationStep = {
    ...(last ?? { holdMs: 1200, transitionMs: 400, easing: "smooth", bounce: 0.3, intensity: 1, effect: "none" }),
    effect: "none",
    expression,
  };
  return { ...animation, steps: [...animation.steps, step] };
}

export function removeStep(animation: NetraAnimation, index: number): NetraAnimation {
  if (animation.steps.length <= 1) return animation;
  return { ...animation, steps: animation.steps.filter((_, i) => i !== index) };
}

export function moveStep(animation: NetraAnimation, index: number, direction: -1 | 1): NetraAnimation {
  const target = index + direction;
  if (target < 0 || target >= animation.steps.length) return animation;
  const steps = [...animation.steps];
  [steps[index], steps[target]] = [steps[target], steps[index]];
  return { ...animation, steps };
}

export function updateStep(animation: NetraAnimation, index: number, path: string, value: unknown): NetraAnimation {
  return { ...animation, steps: animation.steps.map((step, i) => (i === index ? setPath(step, path, value) : step)) };
}

/** Key of the animation `withHeldExpression` adds. */
export const HELD_ANIMATION_KEY = "__held";

/**
 * The definition plus one loop that simply holds `expressionKey` (still
 * blinking, with its ambient motion), so any saved face can be a resting state:
 * <NetraBot expression="sceptical" />.
 */
export function withHeldExpression(definition: BotDefinition, expressionKey: string): BotDefinition {
  if (!definition.expressions[expressionKey]) return definition;
  const blink = definition.animations.idle?.blink ?? definition.animations[definition.animationOrder[0]]?.blink;
  const held: NetraAnimation = {
    label: definition.expressions[expressionKey].label,
    group: "Held face",
    description: "",
    kind: "loop",
    playbackMode: "loop",
    steps: [
      { expression: expressionKey, holdMs: 4000, transitionMs: 400, easing: "smooth", bounce: 0.3, intensity: 1, effect: "none" },
    ],
    blink: blink ?? {
      enabled: true,
      initialDelayMs: 1800,
      minIntervalMs: 2800,
      maxIntervalMs: 5000,
      durationMs: 260,
      closedHeight: 4,
      doubleChance: 0.12,
    },
  };
  return { ...definition, animations: { ...definition.animations, [HELD_ANIMATION_KEY]: held } };
}
