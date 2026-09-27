import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./QuotesSkeleton.module.css";

export interface QuotesSkeletonProps {
  /** Number of cards to mirror (incl. Case B's ghost card). */
  cardCount: number;
  /** Details rail collapsed → the rail narrows to 70px. */
  collapsed?: boolean;
  /** Details rows to mirror (label/value pairs). */
  rowCount?: number;
}

/** Stagger step (ms) — each block draws in and shimmers a beat after the last. */
const STEP = 40;
const MAX_DELAY = 640;
const d = (n: number) => Math.min(n * STEP, MAX_DELAY);

/**
 * QuotesSkeleton — the Quotes body while results "load", shaped like the
 * 2-column page (sidebar 280 | feed): the details rail with its banner pinned
 * to the bottom, and the feed — its top section (breadcrumb, title, the Need
 * Help card, rule), the controls row and card placeholders in the feed's
 * grid. The 1 / 2 / 3-up choice is made in CSS (container queries on the
 * feed's width), so the grid is right from the first server paint.
 * Blocks stagger in top-left → bottom-right and the shimmer cascades.
 * Usage: <QuotesSkeleton cardCount={7} collapsed={false} />
 */
export function QuotesSkeleton({ cardCount, collapsed = false, rowCount = 7 }: QuotesSkeletonProps) {
  return (
    <div className={styles.body} data-collapsed={collapsed || undefined} role="status" aria-label="Loading your quotes">
      {/* Your Details rail */}
      <aside className={styles.rail}>
        {!collapsed && (
          <>
            <div className={styles.railTop}>
              <div className={styles.railHead}>
                <Skeleton width="42%" height={16} delay={d(0)} />
                <Skeleton variant="rounded" width={80} height={28} delay={d(1)} />
              </div>
              <div className={styles.rows}>
                {Array.from({ length: rowCount }, (_, i) => (
                  <div key={i} className={styles.row}>
                    <Skeleton width="64%" height={14} delay={d(2 + i)} />
                    <Skeleton width={i % 3 === 1 ? "44%" : "80%"} height={16} delay={d(2 + i) + 20} />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton variant="rounded" height={95} delay={d(rowCount + 2)} className={styles.full} />
          </>
        )}
      </aside>

      {/* Feed: top section, controls, grid */}
      <div className={styles.feed}>
        <div className={styles.top}>
          <div className={styles.topRow}>
            <div className={styles.heading}>
              <Skeleton width={336} height={12} delay={d(1)} />
              <Skeleton width={446} height={32} delay={d(2)} />
            </div>
            <Skeleton variant="rounded" width={307} height={116} delay={d(3)} className={styles.help} />
          </div>
          <Skeleton height={4} delay={d(4)} className={styles.full} />
        </div>
        <div className={styles.controls}>
          <div className={styles.fields}>
            <Skeleton variant="rounded" width={260} height={56} delay={d(5)} />
            <Skeleton variant="rounded" width={260} height={56} delay={d(5) + 20} />
          </div>
          <Skeleton variant="rounded" width={200} height={32} delay={d(6)} />
        </div>
        <div className={styles.stack}>
          {Array.from({ length: cardCount }, (_, i) => {
            const base = d(7) + i * 80;
            return (
              <div key={i} className={styles.card}>
                <div className={styles.cardHead}>
                  <Skeleton variant="rounded" width={56} height={32} delay={base} />
                  <Skeleton width="58%" height={18} delay={base + 20} />
                  <Skeleton width="42%" height={18} delay={base + 40} />
                </div>
                <Skeleton variant="rounded" height={64} delay={base + 60} className={styles.full} />
                <Skeleton height={2} delay={base + 80} className={styles.full} />
                <Skeleton variant="rounded" height={40} delay={base + 100} className={styles.full} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
