/**
 * NetraBot feature shapes: the outline of an eye or the nose, in the feature's
 * own flat coordinates (x right, y up, centred on the origin), before it is
 * tilted and laid onto the body.
 *
 * Every feature starts as a rounded rectangle. Three warps then reshape it
 * without adding lids: taper (a wider top or bottom), skew (a lean) and bend
 * (the shape curved along a true circle, so its thickness stays even - a thin,
 * wide eye with a bend becomes a ^ crescent). A bent edge is sampled more
 * finely so the curve stays smooth; unbent shapes cost what they always did.
 */

import { DEG, clamp, type Vec2 } from "./math";

export interface FeatureWarp {
  bend: number;
  taper: number;
  skew: number;
  /** The length the bend runs along: across for eyes, up and down for the nose. */
  bendAxis: "x" | "y";
}

const CORNER_STEPS = 6;
const EDGE_STEPS = 3;
/** Face units between samples along an edge that bends. */
const BENT_EDGE_SPACING = 2.5;
const MAX_EDGE_STEPS = 24;
/** A bend never tightens past this multiple of the shape's half-thickness, or it would fold over. */
const MIN_BEND_RADIUS = 1.08;
const NARROWEST_TAPER = 0.02;
const BEND_EPSILON = 1e-3;

/** A rounded rectangle as a closed loop, with `edgeSteps(length)` points along each straight edge. */
function roundedRectangle(hw: number, hh: number, roundness: number, edgeSteps: (length: number) => number): Vec2[] {
  const radius = clamp(roundness, 0, 1) * Math.min(hw, hh);
  const corners: [number, number, number][] = [
    [hw - radius, -hh + radius, -90],
    [hw - radius, hh - radius, 0],
    [-hw + radius, hh - radius, 90],
    [-hw + radius, -hh + radius, 180],
  ];
  const arcs = corners.map(([cx, cy, start]) =>
    Array.from({ length: CORNER_STEPS + 1 }, (_, i): Vec2 => {
      const angle = (start + (90 * i) / CORNER_STEPS) * DEG;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    })
  );
  const loop: Vec2[] = [];
  arcs.forEach((arc, index) => {
    loop.push(...arc);
    const from = arc[arc.length - 1];
    const to = arcs[(index + 1) % arcs.length][0];
    // Edges alternate: right, top, left, bottom.
    const steps = edgeSteps(index % 2 === 0 ? 2 * (hh - radius) : 2 * (hw - radius));
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      loop.push([from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]);
    }
  });
  return loop;
}

/**
 * Curve (along, across) around a circle of signed radius `radius`, keeping
 * the middle in place and re-centring by half the sag so the shape bends where
 * it is rather than drifting.
 */
function bendPoint(along: number, across: number, radius: number, sag: number): Vec2 {
  const angle = along / radius;
  return [(radius + across) * Math.sin(angle), (radius + across) * Math.cos(angle) - radius + sag / 2];
}

export function featureOutline(width: number, height: number, roundness: number, warp: FeatureWarp): Vec2[] {
  const hw = width / 2;
  const hh = height / 2;
  const bent = Math.abs(warp.bend) > BEND_EPSILON;
  const edgeSteps = (length: number) =>
    bent ? clamp(Math.ceil(length / BENT_EDGE_SPACING), EDGE_STEPS, MAX_EDGE_STEPS) : EDGE_STEPS;
  const loop = roundedRectangle(hw, hh, roundness, edgeSteps);
  const taper = clamp(warp.taper, -1, 1);
  const skew = clamp(warp.skew, -1, 1);
  if (!bent && taper === 0 && skew === 0) return loop;

  // Bend: the sweep of the arc is bend x 180 degrees along the chosen length.
  const alongHalf = warp.bendAxis === "x" ? hw : hh;
  const acrossHalf = warp.bendAxis === "x" ? hh : hw;
  let radius = bent ? (2 * alongHalf) / (clamp(warp.bend, -1, 1) * Math.PI) : 0;
  if (bent && Math.abs(radius) < MIN_BEND_RADIUS * acrossHalf) radius = Math.sign(radius) * MIN_BEND_RADIUS * acrossHalf;
  const sag = bent ? radius * (1 - Math.cos(alongHalf / radius)) : 0;

  return loop.map(([x0, y0]): Vec2 => {
    let x = x0 * Math.max(NARROWEST_TAPER, 1 + (hh > 0 ? taper * (y0 / hh) : 0));
    x += skew * y0;
    let y = y0;
    if (bent) {
      if (warp.bendAxis === "x") [x, y] = bendPoint(x, y, radius, sag);
      else [y, x] = bendPoint(y, x, radius, sag);
    }
    return [x, y];
  });
}
