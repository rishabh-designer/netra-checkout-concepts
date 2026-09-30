/**
 * Motion tokens: one curve per job, shared by every Motion animation. The CSS
 * twins live in styles/globals.css (--ease-out, --ease-standard,
 * --ease-smooth, --ease-hold, --ease-engine); keep the two in step.
 */

/** Strong ease-out (expo): things arriving, sheets rising, chevrons turning. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Standard ease-in-out: scrims, fades, layout shifts. */
export const EASE_STD = [0.4, 0, 0.2, 1] as const;

/** Soft ease-out: height tweens, counting numbers, page hand-offs. */
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

/** Slow start, slow end: the CTA sheen. */
export const EASE_HOLD = [1, 0, 0, 1] as const;

/** The quote sheet's engine card: a soft in-out (quint) with no dead start. */
export const EASE_ENGINE = [0.83, 0, 0.17, 1] as const;
