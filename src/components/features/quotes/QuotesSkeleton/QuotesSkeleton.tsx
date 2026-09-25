import { Skeleton } from "@/components/ui/Skeleton";
import feedStyles from "../QuotesFeed/QuotesFeed.module.css";
import styles from "./QuotesSkeleton.module.css";

export interface QuotesSkeletonProps {
  /** Number of cards to mirror (incl. Case B's ghost card) so the grid matches. */
  cardCount: number;
  /** Details rail collapsed → the rail narrows and the grid takes 4 columns. */
  collapsed?: boolean;
  /** Details rows to mirror (label/value pairs). */
  rowCount?: number;
}

/** Stagger step (ms) — each block draws in and shimmers a beat after the last. */
const STEP = 40;
const MAX_DELAY = 640;
const d = (n: number) => Math.min(n * STEP, MAX_DELAY);

/**
 * QuotesSkeleton — the Quotes body while results "load": a Your Details rail and
 * the feed (header, controls, card grid) drawn as shimmering placeholders shaped
 * like the real layout, so nothing jumps on reveal. Blocks stagger in top-left →
 * bottom-right and the shimmer cascades on the same offsets.
 * Usage: <QuotesSkeleton cardCount={7} collapsed={false} />
 */
export function QuotesSkeleton({ cardCount, collapsed = false, rowCount = 7 }: QuotesSkeletonProps) {
  return (
    <div className={styles.body} role="status" aria-label="Loading your quotes">
      {/* Your Details rail */}
      <aside className={styles.rail} data-collapsed={collapsed || undefined}>
        {!collapsed && (
          <>
            <div className={styles.railHead}>
              <Skeleton width="42%" height={16} delay={d(0)} />
              <Skeleton variant="rounded" width={92} height={28} delay={d(1)} />
            </div>
            <div className={styles.rows}>
              {Array.from({ length: rowCount }, (_, i) => (
                <div key={i} className={styles.row}>
                  <Skeleton width="62%" height={12} delay={d(2 + i)} />
                  <Skeleton width={i % 3 === 1 ? "44%" : "82%"} height={16} delay={d(2 + i) + 20} />
                </div>
              ))}
            </div>
            <Skeleton variant="rounded" height={183} delay={d(rowCount + 2)} className={styles.upgrade} />
          </>
        )}
      </aside>

      {/* Feed */}
      <div className={styles.feed}>
        <div className={styles.header}>
          <div className={styles.lead}>
            <Skeleton width={260} height={12} delay={d(1)} />
            <div className={styles.titleRow}>
              <Skeleton variant="circular" width={40} height={40} delay={d(2)} />
              <div className={styles.titleLines}>
                <Skeleton width={280} height={30} delay={d(3)} />
                <Skeleton width={200} height={30} delay={d(4)} />
              </div>
            </div>
          </div>
          <Skeleton variant="rounded" width={320} height={129} delay={d(3)} className={styles.needHelp} />
        </div>

        <Skeleton height={4} delay={d(5)} className={styles.rule} />

        <div className={styles.controls}>
          <Skeleton variant="rounded" width={300} height={33} delay={d(6)} />
          <Skeleton variant="rounded" width={220} height={33} delay={d(7)} />
        </div>

        <div className={feedStyles.grid} data-collapsed={collapsed || undefined}>
          {Array.from({ length: cardCount }, (_, i) => {
            const base = d(6) + i * 60;
            return (
              <div key={i} className={styles.card}>
                <Skeleton variant="rounded" width={72} height={32} delay={base} />
                <Skeleton height={2} delay={base + 20} className={styles.divider} />
                <div className={styles.name}>
                  <Skeleton width="78%" height={18} delay={base + 40} />
                  <Skeleton width="56%" height={18} delay={base + 60} />
                </div>
                <div className={styles.action}>
                  <Skeleton width="34%" height={12} delay={base + 80} />
                  <Skeleton variant="rounded" width={110} height={38} delay={base + 100} />
                </div>
                <Skeleton variant="rounded" height={58} delay={base + 120} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
