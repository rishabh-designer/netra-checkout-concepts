/* The scan's choreography (ResearchScan): a sweep of the bar per title,
   the page flipping between sweeps with some physics: tossed up and
   towards us, swinging past and settling, landing with a small bounce,
   its folded corner lifting in the air and dropping back, and its shadow
   narrowing as it goes edge-on and fading while it's in the air. */

/** A sweep of the bar down (or up) the page, and a flip between sweeps. */
export const SWEEP_MS = 1000;
export const FLIP_MS = 700;
/** How far into a flip the page is edge-on (the next title lands then). */
const EDGE_AT = 0.3;
/** The page's height (CSS --page-h), the bar's run. */
export const PAGE_H = 230;
/** The flip swings past by this much (deg), then settles. */
const OVERSHOOT = 8;
/** Mid-flip the page rises this far and comes this far towards us (px). */
const LIFT = 14;
const TOSS = 28;
/** The folded corner lifts this far in the air (deg). */
const FLUTTER = 40;
/** Edge-on the shadow is this narrow; in the air, this faint. */
const SHADOW_EDGE = 0.12;
const SHADOW_AIR = 0.45;

/** Motion keyframes: values, and when each lands (0 to 1 of the loop). */
export interface Track {
  values: number[];
  times: number[];
}

/** Values at times (ms) through the loop, holding the last to its end. */
function track(start: number) {
  const values = [start];
  const at = [0];
  return {
    to(ms: number, value: number) {
      values.push(value);
      at.push(ms);
    },
    done(total: number): Track {
      if (at[at.length - 1] < total) {
        values.push(values[values.length - 1]);
        at.push(total);
      }
      return { values, times: at.map((t) => t / total) };
    },
  };
}

/**
 * scanKeyframes — the whole loop for `n` titles: n sweeps (down, up, down…)
 * with a flip between each. `flips` are the edge-on moments (ms), when
 * each next title lands; `end` is where the page has turned to.
 * Usage: const k = scanKeyframes(lines.length);
 */
export function scanKeyframes(n: number) {
  const total = n * SWEEP_MS + (n - 1) * FLIP_MS;
  const bar = track(0);
  const turn = track(0);
  const rise = track(0);
  const toss = track(0);
  const fold = track(0);
  const shadowW = track(1);
  const shadowA = track(1);
  const flips: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i * (SWEEP_MS + FLIP_MS);
    const down = i % 2 === 0;
    if (i > 0) bar.to(t0, down ? 0 : PAGE_H);
    bar.to(t0 + SWEEP_MS, down ? PAGE_H : 0);
    if (i === n - 1) break;
    const face = i * 180;
    const f = (p: number) => t0 + SWEEP_MS + p * FLIP_MS;
    flips.push(f(EDGE_AT));
    turn.to(f(0), face);
    turn.to(f(0.6), face + 180 + OVERSHOOT);
    turn.to(f(0.82), face + 180 - OVERSHOOT / 3);
    turn.to(f(1), face + 180);
    rise.to(f(0), 0);
    rise.to(f(0.35), -LIFT);
    rise.to(f(0.7), 0);
    rise.to(f(0.82), -LIFT * 0.15);
    rise.to(f(1), 0);
    toss.to(f(0), 0);
    toss.to(f(0.35), TOSS);
    toss.to(f(0.7), 0);
    fold.to(f(0), 0);
    fold.to(f(0.4), FLUTTER);
    fold.to(f(0.72), 0);
    fold.to(f(0.86), FLUTTER * 0.2);
    fold.to(f(1), 0);
    shadowW.to(f(0), 1);
    shadowW.to(f(EDGE_AT), SHADOW_EDGE);
    shadowW.to(f(0.6), 1);
    shadowA.to(f(0), 1);
    shadowA.to(f(0.35), SHADOW_AIR);
    shadowA.to(f(0.7), 1);
  }
  return {
    total,
    flips,
    end: (n - 1) * 180,
    bar: bar.done(total),
    turn: turn.done(total),
    rise: rise.done(total),
    toss: toss.done(total),
    fold: fold.done(total),
    shadowW: shadowW.done(total),
    shadowA: shadowA.done(total),
  };
}
