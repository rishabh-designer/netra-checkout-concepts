"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { CheckoutStepId } from "@/types/checkout";
import { HANDOFF } from "../handoff";
import { StepPill, type StepPillState } from "@/components/ui/StepPill";
import styles from "./CheckoutStepper.module.css";

export interface CheckoutStepperProps {
  steps: CheckoutStepId[];
  current: CheckoutStepId;
  labels: Record<CheckoutStepId, string>;
  ariaLabel: string;
  /** The step the user just left (null on arrival): pills that changed state
   *  animate from their previous look. */
  from?: CheckoutStepId | null;
  /** How far the current step's bar fills (0–100, live as the step is
   *  completed); done steps fill green. */
  barPercent: number;
  /** Finished steps link back to themselves. */
  hrefFor: (step: CheckoutStepId) => string;
  /** Tooltip on steps not reached yet. */
  upcomingTip?: string;
}

const stateAt = (i: number, at: number): StepPillState => (i < at ? "done" : i === at ? "current" : "upcoming");
const EASE = HANDOFF.ease as unknown as [number, number, number, number];

/**
 * CheckoutStepper — four equal columns under the title (Figma 638:18119): a
 * StepPill (done green with a tick, current lilac with a purple dot, upcoming
 * grey) over a 3px bar. Done steps' bars run full green; the current step's
 * fills purple to its `barPercent`; upcoming bars are empty. Done pills link
 * back to their step. On Save & Continue the step just finished pops green,
 * then the next pill blooms and its bar fills.
 * Usage: <CheckoutStepper steps={…} current="company" labels={…} from="billing" barPercent={50} hrefFor={(s) => …} />
 */
export function CheckoutStepper({ steps, current, labels, ariaLabel, from = null, barPercent, hrefFor, upcomingTip }: CheckoutStepperProps) {
  const reduced = useReducedMotion();
  const at = steps.indexOf(current);
  const was = from ? steps.indexOf(from) : -1;
  return (
    <ol className={styles.stepper} aria-label={ariaLabel}>
      {steps.map((s, i) => {
        const state = stateAt(i, at);
        const changed = !reduced && stateAt(i, was) !== state;
        const justCurrent = changed && state === "current";
        const fill = state === "done" ? 100 : state === "current" ? barPercent : 0;
        const pill = <StepPill state={state} label={labels[s]} from={stateAt(i, was)} tip={state === "upcoming" ? upcomingTip : undefined} />;
        return (
          <li key={s} className={styles.step} aria-current={state === "current" ? "step" : undefined}>
            {state === "done" ? (
              <Link href={hrefFor(s)} className={styles.pillLink}>
                {pill}
              </Link>
            ) : (
              pill
            )}
            <span className={styles.track} aria-hidden>
              <motion.span
                className={styles.fill}
                data-state={state}
                initial={changed || !from ? { width: 0 } : false}
                animate={{ width: `${fill}%` }}
                transition={{ type: "tween", duration: reduced ? 0 : HANDOFF.bar, ease: EASE, delay: justCurrent || !from ? HANDOFF.land : HANDOFF.begin }}
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
