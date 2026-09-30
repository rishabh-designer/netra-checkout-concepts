/**
 * NetraBot body surfaces. A surface is the body as a solid in model space: a
 * mesh the renderer can turn and shade, plus a way to lay the flat face (eyes
 * and nose, in "face units": u right, v up, 1 unit = 1px at natural size) onto
 * its front. Every expression works on any surface added here later.
 *
 * Today's one surface is a rounded slab: the SVG outline (the ikkat) extruded
 * to a uniform thickness, with flat front and back faces and an edge rounded to
 * one constant radius all the way round, like a soft coin or a button. The
 * front and back are flat, so the eyes and nose sit on a plane; the rounded
 * edge is what turning reveals. The outline can be any simple shape. Keep the
 * edge radius under the outline's tightest corner radius, or the inner ring
 * folds over itself.
 *
 * To add a kind of body: add its key to SurfaceKey (types/netrabot.ts) and a
 * factory below.
 */

import type { BotBody, SurfaceKey } from "@/types/netrabot";
import { clamp, type Vec2, type Vec3 } from "./math";
import { samplePath } from "./svgPath";

export interface SurfaceSample {
  point: Vec3;
  normal: Vec3;
}

export interface BodyMesh {
  /** grid[level][ring]: model-space vertices, from the back face (0) to the front face (levels - 1). */
  grid: Vec3[][];
  /** normals[level][ring]: smooth outward unit normal at each vertex. */
  normals: Vec3[][];
  levels: number;
  rings: number;
  /** The two levels that bound the straight side wall: the renderer always keeps both. */
  wallLevels: [number, number];
}

export interface Surface {
  /** A point on the front face and its outward normal, for face coordinates (u, v). */
  faceSample(u: number, v: number): SurfaceSample;
  mesh: BodyMesh;
  /** Largest distance from the centre; sets the camera distance and view box. */
  radius: number;
}

/** Steps around each rounded edge. */
const BEVEL_STEPS = 8;
const GRADIENT_STEP = 1;
/** Points closer than this along the outline are the same point. */
const MERGE_DISTANCE = 0.05;
/** Keeps the bevel slope finite exactly on the outline. */
const EDGE_GUARD = 1e-3;

function roundedSlab(body: BotBody): Surface {
  const half = body.depth / 2;
  const bevel = clamp(body.bevel, 0, half);

  // Fit the outline's bounding box to width x height, centred, y flipped to face-up.
  const raw = samplePath(body.outline);
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX || 1;
  const spanY = Math.max(...ys) - minY || 1;
  const fitted = raw.map(
    ([x, y]): Vec2 => [((x - minX) / spanX - 0.5) * body.width, (0.5 - (y - minY) / spanY) * body.height]
  );
  const ring = fitted.filter((point, i) => {
    const previous = fitted[(i - 1 + fitted.length) % fitted.length];
    return Math.hypot(point[0] - previous[0], point[1] - previous[1]) > MERGE_DISTANCE;
  });
  const count = ring.length;

  // Which way is "out" depends on the path's winding; the shoelace sum tells us.
  let area = 0;
  ring.forEach(([x, y], i) => {
    const [nextX, nextY] = ring[(i + 1) % count];
    area += x * nextY - nextX * y;
  });
  const side = area >= 0 ? 1 : -1;
  const edgeNormals = ring.map(([x, y], i): Vec2 => {
    const [nextX, nextY] = ring[(i + 1) % count];
    const length = Math.hypot(nextX - x, nextY - y) || 1;
    return [(side * (nextY - y)) / length, (-side * (nextX - x)) / length];
  });
  // A vertex faces the average of the two edges that meet at it.
  const outward = ring.map((_, i): Vec2 => {
    const before = edgeNormals[(i - 1 + count) % count];
    const after = edgeNormals[i];
    const length = Math.hypot(before[0] + after[0], before[1] + after[1]) || 1;
    return [(before[0] + after[0]) / length, (before[1] + after[1]) / length];
  });

  /** Distance from (u, v) to the nearest part of the outline. */
  const distanceToOutline = (u: number, v: number) => {
    let best = Infinity;
    for (let i = 0; i < count; i++) {
      const [ax, ay] = ring[i];
      const [bx, by] = ring[(i + 1) % count];
      const dx = bx - ax;
      const dy = by - ay;
      const t = clamp(((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
      best = Math.min(best, Math.hypot(u - (ax + t * dx), v - (ay + t * dy)));
    }
    return best;
  };

  /** Front height at (u, v): flat at `half`, rounding off within `bevel` of the outline. */
  const frontHeight = (u: number, v: number) => {
    if (bevel <= 0) return half;
    const inset = Math.max(EDGE_GUARD * bevel, distanceToOutline(u, v));
    if (inset >= bevel) return half;
    const cosine = 1 - inset / bevel;
    return half - bevel + bevel * Math.sqrt(1 - cosine * cosine);
  };

  const faceSample = (u: number, v: number): SurfaceSample => {
    const z = frontHeight(u, v);
    if (z >= half) return { point: [u, v, half], normal: [0, 0, 1] };
    const slopeU = (frontHeight(u + GRADIENT_STEP, v) - frontHeight(u - GRADIENT_STEP, v)) / (2 * GRADIENT_STEP);
    const slopeV = (frontHeight(u, v + GRADIENT_STEP) - frontHeight(u, v - GRADIENT_STEP)) / (2 * GRADIENT_STEP);
    const length = Math.hypot(slopeU, slopeV, 1);
    return { point: [u, v, z], normal: [-slopeU / length, -slopeV / length, 1 / length] };
  };

  // Levels run back face -> back edge -> straight wall -> front edge -> front face. Each ring of
  // vertices steps inward by `inset` while z follows a quarter circle of radius `bevel`.
  const profile: { inset: number; z: number; horizontal: number; vertical: number }[] = [];
  for (let step = BEVEL_STEPS; step >= 0; step--) {
    const angle = (step / BEVEL_STEPS) * (Math.PI / 2);
    profile.push({
      inset: bevel * (1 - Math.cos(angle)),
      z: -(half - bevel + bevel * Math.sin(angle)),
      horizontal: Math.cos(angle),
      vertical: -Math.sin(angle),
    });
  }
  for (let step = 0; step <= BEVEL_STEPS; step++) {
    const angle = (step / BEVEL_STEPS) * (Math.PI / 2);
    profile.push({
      inset: bevel * (1 - Math.cos(angle)),
      z: half - bevel + bevel * Math.sin(angle),
      horizontal: Math.cos(angle),
      vertical: Math.sin(angle),
    });
  }

  const grid = profile.map(({ inset, z }) =>
    ring.map(([u, v], i): Vec3 => [u - outward[i][0] * inset, v - outward[i][1] * inset, z])
  );
  const normals = profile.map(({ horizontal, vertical }) =>
    ring.map((_, i): Vec3 => [outward[i][0] * horizontal, outward[i][1] * horizontal, vertical])
  );

  const reach = Math.max(...ring.map(([u, v]) => Math.hypot(u, v)), half);
  return {
    faceSample,
    mesh: { grid, normals, levels: profile.length, rings: count, wallLevels: [BEVEL_STEPS, BEVEL_STEPS + 1] },
    radius: reach,
  };
}

const SURFACE_FACTORIES: Record<SurfaceKey, (body: BotBody) => Surface> = { outline: roundedSlab };

export const SURFACE_KEYS = Object.keys(SURFACE_FACTORIES) as SurfaceKey[];

const CACHE_LIMIT = 8;
const cache = new Map<string, Surface>();

/** Surfaces are rebuilt only when the body's shape numbers or outline change. */
export function getSurface(body: BotBody): Surface {
  const key = `${body.surface}:${body.width}:${body.height}:${body.depth}:${body.bevel}:${body.outline}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const surface = SURFACE_FACTORIES[body.surface](body);
  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
  cache.set(key, surface);
  return surface;
}
