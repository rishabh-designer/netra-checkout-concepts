"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./SuccessTimeline.module.css";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { DownloadIcon } from "@/components/icons/DownloadIcon";
import { EASE_OUT as EASE } from "@/lib/motion";

export type SuccessStepState = "done" | "active" | "pending";

export interface SuccessStep {
  label: string;
  state: SuccessStepState;
}

export interface SuccessTimelineItem {
  /** Over the rail: when it happens ("Next Action", "After 7 Working Days"). */
  label: string;
  state: SuccessStepState;
  title: string;
  /** Copy under the title (optional: the row can be its title and action). */
  body?: ReactNode;
  /** Under the copy: the step's action (disabled while pending; `pendingTip`
   *  explains why). `download` leads with a download mark, else an arrow trails. */
  action?: { label: string; onClick?: () => void; onHover?: () => void; pendingTip?: string; download?: boolean };
}

/** Pill mark: a green tick (done), a purple dot (active), a grey dot. */
function PillMark({ state, delay }: { state: SuccessStepState; delay: number }) {
  const reduced = useReducedMotion();
  if (state !== "done") return <span className={styles.dot} data-state={state} aria-hidden />;
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden className={styles.tick}>
      <circle cx="6" cy="6" r="6" fill="var(--color-success)" />
      <motion.path
        d="m3.4 6.2 1.8 1.8 3.4-3.6"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: delay + 0.2, ease: EASE }}
      />
    </svg>
  );
}

/**
 * SuccessSteps — the journey as a row of pills over the success page (Figma
 * 692:58157): Profiling, Quotes, Checkout ticked; the step in progress with a
 * purple dot. They pop in one after another, each tick drawing.
 * Usage: <SuccessSteps steps={[{ label: "Profiling", state: "done" }, …]} />
 */
export function SuccessSteps({ steps, delay = 0 }: { steps: SuccessStep[]; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <ol className={styles.steps}>
      {steps.map((st, i) => (
        <motion.li
          key={st.label}
          className={styles.pill}
          data-state={st.state}
          aria-current={st.state === "active" ? "step" : undefined}
          initial={reduced ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 24, delay: delay + i * 0.1 }}
        >
          <PillMark state={st.state} delay={delay + i * 0.1} />
          {st.label}
        </motion.li>
      ))}
    </ol>
  );
}

export interface SuccessTimelineProps {
  items: SuccessTimelineItem[];
  /** Seconds before the first item starts drawing in. */
  delay?: number;
}

/**
 * SuccessTimeline — what comes next on the success page (Figma 692:58157):
 * each item's label ("Next Action", "After 7 Working Days"), then, beside a
 * dashed rail, its title, copy and action. Pending items are greyed. Items
 * draw in one after another: the label, the rail growing down, then the text.
 * Usage: <SuccessTimeline items={next} delay={0.5} />
 */
export function SuccessTimeline({ items, delay = 0 }: SuccessTimelineProps) {
  const reduced = useReducedMotion();
  const rise = (d: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d, ease: EASE } };
  return (
    <ol className={styles.list}>
      {items.map((it, i) => {
        const d = delay + i * 0.16;
        return (
          <li key={it.label} className={styles.step} data-state={it.state}>
            <motion.p className={styles.label} {...rise(d)}>
              {it.label}
            </motion.p>
            <div className={styles.row}>
              <span className={styles.gutter} aria-hidden>
                <motion.span
                  className={styles.line}
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.45, delay: d + 0.1, ease: EASE }}
                />
              </span>
              <motion.div className={styles.body} {...rise(d + 0.2)}>
                <p className={styles.title}>{it.title}</p>
                {it.body && <p className={styles.copy}>{it.body}</p>}
                {it.action && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.action}
                      disabled={it.state === "pending"}
                      data-tooltip={it.state === "pending" ? it.action.pendingTip : undefined}
                      onClick={it.action.onClick}
                      onMouseEnter={it.action.onHover}
                    >
                      {it.action.download && <DownloadIcon size={12} />}
                      {it.action.label}
                      {!it.action.download && <ArrowRight size={12} />}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
