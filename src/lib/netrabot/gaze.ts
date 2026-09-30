/**
 * NetraBot gaze: making the bot look at a point (the pointer). The target is
 * normalised: x from -1 (far left) to 1 (far right), y from -1 (top) to 1
 * (bottom), 0 at the bot. The player eases toward it and adds a little head
 * turn, nod and face slide on top of whatever expression is playing.
 */

import type { Expression, EyeGeometry, GazeSettings } from "@/types/netrabot";

export interface GazeTarget {
  x: number;
  y: number;
}

/** Used when an imported definition predates gaze settings. */
export const DEFAULT_GAZE: GazeSettings = {
  headYaw: 22,
  headPitch: 14,
  faceShift: 10,
  smoothingMs: 140,
};

/** Ease `current` toward `target` (or back to centre when there is none). Frame-rate independent. */
export function smoothGaze(
  current: GazeTarget,
  target: GazeTarget | null,
  deltaMs: number,
  smoothingMs: number
): GazeTarget {
  const goal = target ?? { x: 0, y: 0 };
  const k = smoothingMs <= 0 ? 1 : 1 - Math.exp(-deltaMs / smoothingMs);
  return { x: current.x + (goal.x - current.x) * k, y: current.y + (goal.y - current.y) * k };
}

/** The expression with the gaze laid over it: the head turns toward the point and the face slides that way. */
export function applyGaze(expression: Expression, gaze: GazeTarget, settings: GazeSettings): Expression {
  if (Math.abs(gaze.x) < 1e-4 && Math.abs(gaze.y) < 1e-4) return expression;
  const slideX = gaze.x * settings.faceShift;
  const slideY = -gaze.y * settings.faceShift;
  const slide = (feature: EyeGeometry): EyeGeometry => ({ ...feature, x: feature.x + slideX, y: feature.y + slideY });
  return {
    ...expression,
    yaw: expression.yaw + gaze.x * settings.headYaw,
    pitch: expression.pitch - gaze.y * settings.headPitch,
    left: slide(expression.left),
    right: slide(expression.right),
    nose: slide(expression.nose),
  };
}
