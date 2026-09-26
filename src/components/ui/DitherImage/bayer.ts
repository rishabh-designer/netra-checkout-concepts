/** 16×16 Bayer matrix, built recursively from 2×2. */
export const BAYER_SIZE = 16;

/**
 * BAYER — ordered-dither thresholds centred on 0 (-0.5..0.5), row-major.
 * Added to the light at sub-pixel strength so soft gradients never band.
 */
export const BAYER: Float32Array = (() => {
  let m = [0];
  for (let n = 1; n < BAYER_SIZE; n *= 2) {
    const next: number[] = new Array(n * 2 * n * 2);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = m[y * n + x] * 4;
        next[y * 2 * n + x] = v;
        next[y * 2 * n + x + n] = v + 2;
        next[(y + n) * 2 * n + x] = v + 3;
        next[(y + n) * 2 * n + x + n] = v + 1;
      }
    }
    m = next;
  }
  return Float32Array.from(m, (v) => (v + 0.5) / (BAYER_SIZE * BAYER_SIZE) - 0.5);
})();
