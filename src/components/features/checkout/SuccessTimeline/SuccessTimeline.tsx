"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./SuccessTimeline.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { IconButton } from "@/components/ui/IconButton";
import { EASE_OUT as EASE } from "@/lib/motion";

export type SuccessStepState = "done" | "active" | "pending";

export interface SuccessTimelineItem {
  pill: string;
  state: SuccessStepState;
  title: string;
  body: ReactNode;
  /** Beside the title when there's no tag: what finished, and how long it took. */
  status?: { label: string; time: string };
  /** Beside the row's title (Immediate Purchase, Secured with BimaNetra). */
  tag?: ReactNode;
  /** Under the copy: a plain underlined text link. */
  link?: { label: string; onClick?: () => void };
  /** Under the copy: the row's next action (disabled while pending). */
  /** `pendingTip`: the tooltip while the row is still pending. */
  action?: { label: string; onClick?: () => void; onHover?: () => void; pendingTip?: string };
}

export interface SuccessTimelineProps {
  items: SuccessTimelineItem[];
  /** Seconds before the first row starts drawing in. */
  delay?: number;
  /** The chevron's labels (screen readers and tooltip). */
  toggleLabels: { show: string; hide: string };
}

const STEP = 0.14;

/** Rail pill mark: a green tick (done), a purple dot (active), a grey dot. */
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
 * SuccessTimeline — the journey on the success page (Figma 692:58221): each
 * step is its pill (Profiling → Policy Issuance), then, beside a dashed rail
 * line, the step's title (with its tag, or its status and time), its copy
 * and, under the copy, its action (a text link or a button). Pending rows are
 * greyed. Rows draw in one after another: the pill pops, its tick draws, the
 * rail line grows down, then the text rises.
 * Usage: <SuccessTimeline items={rows} delay={0.5} />
 */
export function SuccessTimeline({ items, delay = 0, toggleLabels }: SuccessTimelineProps) {
  const reduced = useReducedMotion();
  // Only the step in progress starts open; done and pending ones start
  // folded to their pill.
  const [open, setOpen] = useState(() => new Set(items.filter((it) => it.state === "active").map((it) => it.pill)));
  // Only the steps open on arrival rise in with the page; once toggled, a
  // step just unfolds.
  const [openedOnArrival, setOpenedOnArrival] = useState(open);
  const toggle = (pill: string) => {
    setOpenedOnArrival((s) => {
      const next = new Set(s);
      next.delete(pill);
      return next;
    });
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(pill)) next.delete(pill);
      else next.add(pill);
      return next;
    });
  };
  const rise = (d: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: d, ease: EASE } };

  return (
    <ol className={styles.list}>
      {items.map((it, i) => {
        const d = delay + i * STEP;
        const isOpen = open.has(it.pill);
        const label = isOpen ? toggleLabels.hide : toggleLabels.show;
        return (
          <li key={it.pill} className={styles.step} data-state={it.state} data-open={isOpen || undefined}>
            <div className={styles.head}>
              {/* chevron.controls (713:59196), before the pill: folds the step's copy away. */}
              <IconButton size="sm" label={label} open={isOpen} aria-expanded={isOpen} onClick={() => toggle(it.pill)}>
                <Chevron size={12} />
              </IconButton>
            <motion.span
              className={styles.pill}
              data-state={it.state}
              initial={reduced ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 24, delay: d }}
            >
              <PillMark state={it.state} delay={d} />
              {it.pill}
            </motion.span>
            </div>
            <div className={styles.row}>
              <span className={styles.gutter} aria-hidden>
                <motion.span
                  className={styles.line}
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.45, delay: d + 0.15, ease: EASE }}
                />
              </span>
              {/* Not initial={false}: that would also skip the copy's own rise-in,
                  which must wait for its pill. Open-on-arrival folds skip the
                  height tween instead. */}
              <AnimatePresence>
              {isOpen && (
              <motion.div
                key="body"
                className={styles.fold}
                initial={reduced || openedOnArrival.has(it.pill) ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
              <motion.div className={styles.body} {...(openedOnArrival.has(it.pill) ? rise(d + 0.25) : {})}>
                <div className={styles.titleRow}>
                  <p className={styles.title}>{it.title}</p>
                  {it.tag ??
                    (it.status && (
                      <span className={styles.status}>
                        <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden>
                          <circle cx="7" cy="7" r="6.2" stroke="var(--color-brand-primary)" strokeWidth="1" />
                          <path d="m4.4 7.1 1.8 1.8 3.4-3.6" stroke="var(--color-brand-primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.statusLabel}>{it.status.label}</span>
                        <span className={styles.statusTime}>{it.status.time}</span>
                      </span>
                    ))}
                </div>
                <p className={styles.copy}>{it.body}</p>
                {(it.link || it.action) && (
                  <div className={styles.actions}>
                    {it.link && (
                      <button type="button" className={styles.link} onClick={it.link.onClick}>
                        {it.link.label}
                      </button>
                    )}
                    {it.action && (
                      <button type="button" className={styles.action} disabled={it.state === "pending"} data-tooltip={it.state === "pending" ? it.action.pendingTip : undefined} onClick={it.action.onClick} onMouseEnter={it.action.onHover}>
                        {it.action.label}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
