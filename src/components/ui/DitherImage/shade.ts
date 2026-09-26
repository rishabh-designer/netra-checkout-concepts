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
  /** Sparkle-cluster field on a coarse grid, CELL px apart. */
  cluster: Float32Array;
  GW: number;
  CELL: number;
}

/** This frame's light: where the sheen sits, how it leans, how bright it is. */
export interface ShadeFrame {
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
 * shade — one frame of the shimmer, written into `out`: a Gaussian sheen band
 * plus clustered device-pixel glints, lerping the source colour toward warm
 * light. Energy brightens the sheen and makes the glints faster and denser
 * (a burst at 1).
 */
export function shade(out: Uint8ClampedArray, b: ShadeBuffers, f: ShadeFrame): void {
  const { W, H, source, nx, ny, dither, glintPhase, glintSpeed, cluster, GW, CELL } = b;
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

      const glint = Math.pow(0.5 + 0.5 * Math.sin(pace * glintSpeed[k] + glintPhase[k]), power);
      let light = sheen * glow + glint * dense * (0.3 + sheen * 0.7) * sparkle + dither[k] / 48;
      light = light < 0 ? 0 : light > 1 ? 1 : light;
      for (let c = 0; c < 3; c++) {
        const base = source[i + c];
        out[i + c] = base + (LIGHT[c] - base) * light;
      }
      out[i + 3] = a;
    }
  }
}

