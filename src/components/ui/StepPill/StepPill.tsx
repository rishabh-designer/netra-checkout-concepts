"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { HANDOFF } from "@/lib/handoff";
import styles from "./StepPill.module.css";

export type StepPillState = "done" | "current" | "upcoming";

export interface StepPillProps {
  state: StepPillState;
  label: string;
  /** The state it had before this step change (undefined on arrival): a pill
   *  whose state changed pops into its new look. */
  from?: StepPillState;
  /** Tooltip (e.g. on steps not reached yet). */
  tip?: string;
  className?: string;
}

const EASE = HANDOFF.ease as unknown as [number, number, number, number];
const POP = [0.34, 1.4, 0.64, 1] as const;

/** 12px glyphs (Figma 484:25864): done tick in a green ring, current purple
 *  dot in a lilac ring, upcoming grey dot. */
function Glyph({ state }: { state: StepPillState }) {
  if (state === "done") {
    return (
      <span className={styles.ring}>
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 5a5 5 0 1 1 10 0A5 5 0 0 1 0 5Zm7.4-1.24a.34.34 0 0 0-.48-.48L4.2 6 3.08 4.87a.34.34 0 1 0-.48.48l1.36 1.37c.13.13.35.13.48 0L7.4 3.76Z"
            fill="var(--color-success)"
          />
        </svg>
      </span>
    );
  }
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden className={styles.dot} data-state={state}>
      <rect x="0.27" y="0.27" width="11.47" height="11.47" rx="5.73" fill="none" strokeWidth="0.53" />
      <circle cx="6" cy="6" r="5" />
    </svg>
  );
}

/**
 * StepPill — one step of a stepper (Figma 638:18119): done green with a tick,
 * current lilac with a purple dot, upcoming grey. When the step changes, the
 * step just finished pops green and the next one blooms, its label unfurling
 * (the HANDOFF timeline). Shared by the checkout stepper (over its bars) and
 * the quote form's Profile / Business / Risk pills.
 * Usage: <StepPill state="current" from="upcoming" label="Business" />
 */
export function StepPill({ state, label, from, tip, className }: StepPillProps) {
  const reduced = useReducedMotion();
  const changed = !reduced && from !== undefined && from !== state;
  const justDone = changed && state === "done";
  const justCurrent = changed && state === "current";
  const delay = justCurrent ? HANDOFF.land : HANDOFF.begin;
  return (
    <motion.span
      className={cn(styles.pill, className)}
      data-state={state}
      data-tooltip={tip}
      initial={justDone ? { scale: 0.9 } : justCurrent ? { scale: 0.85, opacity: 0.6 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "tween", duration: HANDOFF.pill, ease: POP, delay }}
    >
      <motion.span
        className={styles.glyph}
        initial={justDone || justCurrent ? { scale: 0, rotate: justDone ? -90 : 0 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "tween", duration: HANDOFF.pill, ease: POP, delay: delay + 0.08 }}
      >
        <Glyph state={state} />
      </motion.span>
      <motion.span
        className={styles.label}
        initial={justCurrent ? { opacity: 0.4 } : false}
        animate={{ opacity: 1 }}
        transition={{ type: "tween", duration: HANDOFF.label, ease: EASE, delay: HANDOFF.land + 0.1 }}
      >
        {label}
      </motion.span>
    </motion.span>
  );
}
