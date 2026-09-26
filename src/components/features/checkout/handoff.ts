/**
 * One shared timeline for the step hand-off (Save & Continue / Back), so the
 * title cascade, the stepper and the progress bar move as one gesture instead
 * of three unrelated animations. Times are seconds from the new step's mount.
 *
 *   0.10  begin   old title letters lift away · finished pill pops green · bar starts filling
 *   0.30  land    new title letters start landing · next pill blooms · its label unfurls
 *   ~1.3  settle  last letter lands as the bar reaches its value; time-left rolls in mid-way
 */
export const HANDOFF = {
  ease: [0.22, 1, 0.36, 1] as const,
  begin: 0.1,
  land: 0.3,
  /** Title letters: exit / enter per-letter stagger and duration. */
  letterStagger: 0.05,
  letterExit: 0.4,
  letterEnter: 0.75,
  /** Stepper pill + glyph + label durations. */
  pill: 0.6,
  label: 0.75,
  /** Progress bar fill / count. */
  bar: 1.2,
  time: 0.55,
};
