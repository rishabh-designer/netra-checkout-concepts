"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CheckoutStepId } from "@/types/checkout";
import { HANDOFF } from "../handoff";
import styles from "./CheckoutStepper.module.css";

export interface CheckoutStepperProps {
  steps: CheckoutStepId[];
  current: CheckoutStepId;
  labels: Record<CheckoutStepId, string>;
  ariaLabel: string;
  /** The step the user just left (null on arrival): pills that changed state
   *  animate from their previous look. */
  from?: CheckoutStepId | null;
}

type PillState = "done" | "current" | "upcoming";
const stateAt = (i: number, at: number): PillState => (i < at ? "done" : i === at ? "current" : "upcoming");
const EASE = HANDOFF.ease as unknown as [number, number, number, number];
const POP = [0.34, 1.4, 0.64, 1] as const;

/** 12px glyphs (Figma 484:25864): done tick in a green ring, current purple
 *  dot in a lilac ring, upcoming grey dot. */
function Glyph({ state }: { state: PillState }) {
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
 * CheckoutStepper — the four-step pill row beside the page title (Figma
 * 484:25864 / 613:65314): done steps green with a tick, the current step
 * lilac with a purple dot, upcoming steps grey with their label.
 * On Save & Continue the step just finished pops green with its tick, then the
 * next pill blooms: its dot grows and its label brightens.
 * Usage: <CheckoutStepper steps={…} current="company" labels={…} from="billing" />
 */
export function CheckoutStepper({ steps, current, labels, ariaLabel, from = null }: CheckoutStepperProps) {
  const reduced = useReducedMotion();
  const at = steps.indexOf(current);
  const was = from ? steps.indexOf(from) : -1;
  return (
    <ol className={styles.stepper} aria-label={ariaLabel}>
      {steps.map((s, i) => {
        const state = stateAt(i, at);
        const changed = !reduced && stateAt(i, was) !== state;
        const justDone = changed && state === "done";
        const justCurrent = changed && state === "current";
        return (
          <motion.li
            key={s}
            className={styles.pill}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
            initial={justDone ? { scale: 0.9 } : justCurrent ? { scale: 0.85, opacity: 0.6 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "tween", duration: HANDOFF.pill, ease: POP, delay: justCurrent ? HANDOFF.land : HANDOFF.begin }}
          >
            <motion.span
              className={styles.glyph}
              initial={justDone || justCurrent ? { scale: 0, rotate: justDone ? -90 : 0 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "tween", duration: HANDOFF.pill, ease: POP, delay: (justCurrent ? HANDOFF.land : HANDOFF.begin) + 0.08 }}
            >
              <Glyph state={state} />
            </motion.span>
            <motion.span
              className={styles.label}
              initial={justCurrent ? { opacity: 0.4 } : false}
              animate={{ opacity: 1 }}
              transition={{ type: "tween", duration: HANDOFF.label, ease: EASE, delay: HANDOFF.land + 0.1 }}
            >
              {labels[s]}
            </motion.span>
          </motion.li>
        );
      })}
    </ol>
  );
}
