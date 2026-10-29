import { EASE_EASY } from "@/lib/motion";

/* The scan's timing and physics (ResearchScan): a sweep of the bar per
   title, down, up, down…, with a flip of the page between sweeps. The bar
   runs on keyframes and each flip is a tween, both on easy ease; the paper
   bends with how fast it turns. */

/** A sweep of the bar down (or up) the page, and a flip. */
export const SWEEP_MS = 600;
export const FLIP_MS = 450;
/** The page (CSS --page-w, --page-h): the bar runs its height. It bends
 *  as SEGS hinged strips either side of its middle (CSS --seg-w). */
export const PAGE_W = 168;
export const PAGE_H = 230;
export const SEGS = 4;

/** The bend: each hinge folds this much (deg) per deg/s the page turns,
 *  up to BEND_MAX, the trailing edges lagging; the paper springs back
 *  (PAPER_SPRING, near critically damped), so the bend follows the turn a
 *  touch late and eases flat as the turn ends, without a flutter. */
export const BEND_PER = 0.012;
export const BEND_MAX = 10;
export const PAPER_SPRING = { stiffness: 300, damping: 26, mass: 0.6 } as const;

/** A flip: half a turn on easy ease, so the page gathers speed, turns and
 *  slows to a stop, inside FLIP_MS. */
export const FLIP = { duration: FLIP_MS / 1000, ease: EASE_EASY } as const;

/** Motion keyframes: values, and when each lands (0 to 1 of the loop). */
export interface Track {
  values: number[];
  times: number[];
}

/**
 * scanKeyframes — the loop for `n` titles: the bar's run (n sweeps, a hold
 * at each end while the page flips), when each flip starts (ms), and the
 * angle the page ends on.
 * Usage: const k = scanKeyframes(lines.length);
 */
export function scanKeyframes(n: number) {
  const total = n * SWEEP_MS + (n - 1) * FLIP_MS;
  const values = [0];
  const at = [0];
  const flips: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i * (SWEEP_MS + FLIP_MS);
    const down = i % 2 === 0;
    if (i > 0) {
      values.push(down ? 0 : PAGE_H);
      at.push(t0);
    }
    values.push(down ? PAGE_H : 0);
    at.push(t0 + SWEEP_MS);
    if (i < n - 1) flips.push(t0 + SWEEP_MS);
  }
  const bar: Track = { values, times: at.map((t) => t / total) };
  return { total, flips, end: (n - 1) * 180, bar };
}
