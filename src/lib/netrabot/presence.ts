/**
 * NetraBot presence: how much of the bot is there. Turns an expression's
 * presence fields (plus any bob or breath from ambient motion) into one
 * transform, an opacity, a blur, a dither amount and a floor clip for the whole
 * drawing. Pure data; BotSvg applies it.
 */

import type { BotBody, BotPresenceFrame, Expression } from "@/types/netrabot";
import { clamp } from "./math";
import type { BodyMotionOffset } from "./motion";

/** The 4 x 4 ordered-dither (Bayer) matrix: the order cells drop out as the bot dissolves. */
export const DITHER_ORDER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;
export const DITHER_SIZE = 4;
/** CSS px per dither cell, the same grain as DitherWash and Sparks. */
export const DITHER_CELL_PX = 2;

/** Face units below the body's bottom edge where the floor clip cuts, so a resting bot is never trimmed. */
const FLOOR_MARGIN = 8;
const IDENTITY_EPSILON = 1e-3;

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** Whether dither cell `index` (0..15) still shows at this much dissolve. */
export const ditherCellShows = (index: number, dissolve: number) =>
  (DITHER_ORDER[index] + 0.5) / (DITHER_SIZE * DITHER_SIZE) > dissolve;

export function presenceFrame(body: BotBody, expression: Expression, sway: BodyMotionOffset): BotPresenceFrame {
  const bottom = body.height / 2;
  const scale = Math.max(0, expression.scale);
  const squashX = Math.max(0.02, expression.squashX * (1 - sway.stretch / 2));
  const squashY = Math.max(0.02, expression.squashY * (1 + sway.stretch));
  const lift = expression.lift + sway.lift;

  // Squash about the bottom edge, then size about the centre, then rise.
  const a = scale * squashX;
  const d = scale * squashY;
  const f = scale * bottom * (1 - squashY) - lift;
  const identity = Math.abs(a - 1) < IDENTITY_EPSILON && Math.abs(d - 1) < IDENTITY_EPSILON && Math.abs(f) < IDENTITY_EPSILON;

  return {
    transform: identity ? "" : `matrix(${round3(a)} 0 0 ${round3(d)} 0 ${round3(f)})`,
    opacity: clamp(expression.opacity, 0, 1),
    blur: Math.max(0, expression.blur),
    dissolve: clamp(expression.dissolve, 0, 1),
    grounded: expression.ground >= 0.5,
    floorY: bottom + FLOOR_MARGIN,
  };
}

/**
 * The same face, fully visible: no fade, blur, dither or floor clip. A frame
 * frozen for shaping (mid-appear, say) keeps its face and pose but is shown.
 */
export const settleVisibility = (expression: Expression): Expression => ({
  ...expression,
  opacity: 1,
  blur: 0,
  dissolve: 0,
  ground: 0,
});

/**
 * The same face, tamed for a still thumbnail: always somewhat visible and kept
 * inside its box, so hidden presets still read in a list.
 */
export function presenceForThumb(expression: Expression): Expression {
  return {
    ...expression,
    opacity: Math.max(0.3, expression.opacity),
    scale: clamp(expression.scale, 0.3, 1.2),
    lift: clamp(expression.lift, -30, 30),
    blur: Math.min(expression.blur, 2),
    dissolve: Math.min(expression.dissolve, 0.6),
    ground: 0,
  };
}
