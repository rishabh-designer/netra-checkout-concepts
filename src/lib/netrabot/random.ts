/**
 * NetraBot randomness: a small seeded generator, so a replay (seeking the
 * studio timeline) or a "Surprise me" can be reproduced from its seed.
 */

/** A source of numbers in [0, 1). */
export type Random = () => number;

/** Mulberry32: fast, tiny, and plenty for blinks and jitter. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh seed for a new run. */
export const randomSeed = () => Math.floor(Math.random() * 4294967296);
