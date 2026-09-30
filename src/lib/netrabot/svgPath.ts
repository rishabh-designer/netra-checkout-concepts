/**
 * A small SVG path reader for body outlines. Supports the absolute commands
 * M, L, H, V, C and Z (what Figma exports for a flat vector) and samples
 * curves into points. Anything else is rejected with a readable message.
 */

import type { Vec2 } from "./math";

const TOKEN = /([a-zA-Z])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/g;
const ARGUMENT_COUNT: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, Z: 0 };
const CURVE_STEPS = 6;

export function samplePath(d: string): Vec2[] {
  const tokens = [...d.matchAll(TOKEN)].map((match) => (match[1] ? match[1] : parseFloat(match[2])));
  const points: Vec2[] = [];
  let current: Vec2 = [0, 0];
  let i = 0;

  while (i < tokens.length) {
    const command = tokens[i++];
    if (typeof command !== "string" || !(command in ARGUMENT_COUNT)) {
      throw new Error(`Only absolute M, L, H, V, C and Z path commands are supported (found "${String(command)}").`);
    }
    const count = ARGUMENT_COUNT[command];
    const args = tokens.slice(i, i + count);
    if (args.length < count || args.some((value) => typeof value !== "number")) {
      throw new Error(`The path command "${command}" is missing numbers.`);
    }
    i += count;
    const n = args as number[];

    if (command === "M" || command === "L") {
      current = [n[0], n[1]];
      points.push(current);
    } else if (command === "H") {
      current = [n[0], current[1]];
      points.push(current);
    } else if (command === "V") {
      current = [current[0], n[0]];
      points.push(current);
    } else if (command === "C") {
      const [x0, y0] = current;
      for (let step = 1; step <= CURVE_STEPS; step++) {
        const t = step / CURVE_STEPS;
        const u = 1 - t;
        points.push([
          u * u * u * x0 + 3 * u * u * t * n[0] + 3 * u * t * t * n[2] + t * t * t * n[4],
          u * u * u * y0 + 3 * u * u * t * n[1] + 3 * u * t * t * n[3] + t * t * t * n[5],
        ]);
      }
      current = [n[4], n[5]];
    }
  }
  if (points.length < 3) throw new Error("The outline needs at least three points.");
  return points;
}
