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
 * 3-column page (sidebar 280 | feed | help desk 290): the details rail with its
 * banner pinned to the bottom, the feed's fixed top (breadcrumb, controls,
 * rule) over a 480-wide vertical stack of card placeholders, and the help card.
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

      {/* Feed: fixed top + vertical stack */}
      <div className={styles.feed}>
        <div className={styles.top}>
          <div className={styles.crumbRow}>
            <Skeleton width={330} height={12} delay={d(1)} />
            <Skeleton width={170} height={24} delay={d(2)} />
          </div>
          <div className={styles.controls}>
            <Skeleton variant="rounded" width={226} height={32} delay={d(2)} />
            <Skeleton variant="rounded" width={226} height={32} delay={d(3)} />
            <Skeleton variant="rounded" width={215} height={32} delay={d(4)} />
          </div>
          <Skeleton height={4} delay={d(5)} className={styles.full} />
        </div>
        <div className={styles.stack}>
          {Array.from({ length: cardCount }, (_, i) => {
            const base = d(6) + i * 80;
            return (
              <div key={i} className={styles.card}>
                <div className={styles.cardHead}>
                  <Skeleton variant="rounded" width={80} height={32} delay={base} />
                  <Skeleton variant="rounded" width={130} height={24} delay={base + 20} />
                </div>
                <Skeleton height={2} delay={base + 40} className={styles.full} />
                <div className={styles.name}>
                  <Skeleton width="46%" height={18} delay={base + 60} />
                  <Skeleton width="38%" height={18} delay={base + 80} />
                </div>
                <Skeleton variant="rounded" height={118} delay={base + 100} className={styles.full} />
                <Skeleton variant="rounded" height={56} delay={base + 120} className={styles.full} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Help desk */}
      <aside className={styles.help}>
        <div className={styles.helpStack}>
          <Skeleton variant="rounded" height={104} delay={d(3)} className={styles.full} />
          <Skeleton variant="rounded" height={196} delay={d(5)} className={styles.full} />
          <Skeleton variant="rounded" height={290} delay={d(7)} className={styles.full} />
        </div>
        <Skeleton variant="rounded" height={50} delay={d(12)} className={styles.full} />
      </aside>
    </div>
  );
}
