/** Which micro-animation the shimmer is showing. */
export type ShimmerMode = "sunrise" | "strokes" | "tilt" | "spill";

/** Per-pixel buffers built once per image (see DitherImage). */
export interface ShadeBuffers {
  W: number;
  H: number;
  source: Uint8ClampedArray;
  nx: Float32Array;
  ny: Float32Array;
  dither: Float32Array;
  glintPhase: Float32Array;
  glintSpeed: Float32Array;
  /** 0..1 along the artwork's stroke lines (Sobel of alpha × luminance). */
  edge: Float32Array;
  /** Sparkle-cluster field on a coarse grid, CELL px apart. */
  cluster: Float32Array;
  GW: number;
  CELL: number;
}

/** This frame's light: where the sheen sits, how it leans, how bright it is. */
export interface ShadeFrame {
  mode: ShimmerMode;
  seconds: number;
  centre: number;
  ax: number;
  ay: number;
  band: number;
  strength: number;
  /** 0..1 excitement from the form (typing, submit) and the sunrise ignition. */
  energy: number;
}

// Warm white of the highlight (a sunlit brass tone rather than pure white).
const LIGHT = [255, 246, 228] as const;
// Glitter: how sparse the sparkles are (higher = rarer, sharper glints).
const GLINT_POWER = 14;

/**
 * shade — one frame of the shimmer, written into `out`. The base look in every
 * mode is a Gaussian sheen band plus clustered device-pixel glints, lerping
 * the source colour toward warm light. Energy brightens the sheen and makes
 * the glints faster and denser (a burst at 1). "strokes" weights all light by
 * the edge map so it rides the artwork's lines; "tilt" is foil-like, with a
 * stronger sheen and the side away from it deepened slightly.
 */
export function shade(out: Uint8ClampedArray, b: ShadeBuffers, f: ShadeFrame): void {
  const { W, H, source, nx, ny, dither, glintPhase, glintSpeed, edge, cluster, GW, CELL } = b;
  const strokes = f.mode === "strokes";
  // Tilt reads like foil: the lit side flares, the far side deepens a touch.
  const foil = f.mode === "tilt";
  const power = GLINT_POWER * (1 - 0.55 * f.energy);
  const pace = f.seconds * (1 + f.energy * 0.8);
  const glow = f.strength * (1 + 0.25 * f.energy);
  const sparkle = 1 + f.energy * 1.5;

  for (let y = 0; y < H; y++) {
    const fy = y / CELL;
    const gy = fy | 0;
    const ty = fy - gy;
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      const a = source[i + 3];
      if (a === 0) {
        out[i + 3] = 0;
        continue;
      }
      const off = (nx[k] * f.ax + ny[k] * f.ay - f.centre) / f.band;
      const sheen = Math.exp(-off * off);

      const fx = x / CELL;
      const gx = fx | 0;
      const tx = fx - gx;
      const r0 = gy * GW + gx;
      const top = cluster[r0] + (cluster[r0 + 1] - cluster[r0]) * tx;
      const bot = cluster[r0 + GW] + (cluster[r0 + GW + 1] - cluster[r0 + GW]) * tx;
      const bunch = top + (bot - top) * ty;
      const dense = bunch + (1 - bunch) * f.energy;

      let glint = Math.pow(0.5 + 0.5 * Math.sin(pace * glintSpeed[k] + glintPhase[k]), power);
      let wash = sheen * glow * (foil ? 1.5 : 1);
      const deepen = foil ? (1 - sheen) * 0.12 : 0;
      if (strokes) {
        const e = edge[k];
        wash *= 0.15 + 1.1 * e;
        glint *= e;
      }
      let light = wash + glint * dense * (0.3 + sheen * 0.7) * sparkle + dither[k] / 48;
      light = light < 0 ? 0 : light > 1 ? 1 : light;
      for (let c = 0; c < 3; c++) {
        const base = source[i + c] * (1 - deepen);
        out[i + c] = base + (LIGHT[c] - base) * light;
      }
      out[i + 3] = a;
    }
  }
}

/**
 * edgeMap — where the artwork's stroke lines are: a Sobel gradient over
 * alpha × luminance, normalised to 0..1 and softened (sqrt) so the light
 * hugs the grooves without looking like a hard outline.
 */
export function edgeMap(source: Uint8ClampedArray, W: number, H: number): Float32Array {
  const lum = new Float32Array(W * H);
  for (let k = 0; k < W * H; k++) {
    const i = k * 4;
    lum[k] = ((0.3 * source[i] + 0.59 * source[i + 1] + 0.11 * source[i + 2]) / 255) * (source[i + 3] / 255);
  }
  const edge = new Float32Array(W * H);
  let max = 0;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const k = y * W + x;
      const gx = lum[k - W + 1] + 2 * lum[k + 1] + lum[k + W + 1] - lum[k - W - 1] - 2 * lum[k - 1] - lum[k + W - 1];
      const gy = lum[k + W - 1] + 2 * lum[k + W] + lum[k + W + 1] - lum[k - W - 1] - 2 * lum[k - W] - lum[k - W + 1];
      const g = Math.hypot(gx, gy);
      edge[k] = g;
      if (g > max) max = g;
    }
  }
  if (max > 0) for (let k = 0; k < edge.length; k++) edge[k] = Math.sqrt(edge[k] / max);
  return edge;
}
