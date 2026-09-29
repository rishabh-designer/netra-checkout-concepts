"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import type { TrustStat } from "@/types/productPage";
import { IkkatMark } from "@/components/ui/IkkatMark";
import styles from "./ProofRow.module.css";

export interface ProofRowProps {
  stats: TrustStat[];
  /** center (default): equal columns, centred. start: packed from the left,
   *  flush with the text above (the classic hero's left column). */
  align?: "center" | "start";
  /** Bead mark colour between the stats (default: deep orange). */
  markColor?: string;
}

/**
 * ProofRow — proof at the point of action (Figma 626:15669): serif orange
 * figures over small labels in three equal columns, split by bead marks.
 * If one label has to wrap, they all go to two lines (the row reads as one
 * unit): the labels that would fit on one line are narrowed to break too.
 * Usage: <ProofRow stats={content.stats} />
 */
export function ProofRow({ stats, align = "center", markColor = "var(--color-brand-secondary-deep)" }: ProofRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  // Measured at the natural layout on every resize: any label on 2+ lines
  // turns the row uniform (`data-two-line`), the one-liners marked to break.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const sync = () => {
      const labels = [...row.querySelectorAll<HTMLElement>(`.${styles.statLabel}`)];
      delete row.dataset.twoLine;
      labels.forEach((l) => delete l.dataset.single);
      const lines = labels.map((l) => Math.round(l.getBoundingClientRect().height / parseFloat(getComputedStyle(l).lineHeight)));
      if (!lines.some((n) => n > 1)) return;
      row.dataset.twoLine = "";
      labels.forEach((l, i) => {
        if (lines[i] === 1) l.dataset.single = "";
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(row);
    return () => ro.disconnect();
  }, [stats]);

  return (
    <div ref={rowRef} className={styles.proof} data-align={align}>
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 && <IkkatMark pattern={3} width={12} color={markColor} />}
          <span className={styles.stat}>
            <strong className={styles.statValue}>{stat.value}</strong>
            <span className={styles.statLabel}>{stat.label}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
