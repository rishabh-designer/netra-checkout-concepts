import { Fragment } from "react";
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
 * Usage: <ProofRow stats={content.stats} />
 */
export function ProofRow({ stats, align = "center", markColor = "var(--color-brand-secondary-deep)" }: ProofRowProps) {
  return (
    <div className={styles.proof} data-align={align}>
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
