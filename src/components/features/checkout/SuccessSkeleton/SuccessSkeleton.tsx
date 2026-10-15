import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./SuccessSkeleton.module.css";

export interface SuccessSkeletonProps {
  /** Screen-reader note ("Confirming your payment"). */
  label: string;
  /** Draw the bottom Next Up bar (off while the page hides it). */
  nextUp?: boolean;
}

/* Blocks draw in reading order, 40ms apart; the summary runs alongside. */
const T = 40;

/**
 * SuccessSkeleton — the success page's loading state, block for block with
 * the real layout: on the left the journey's row of four pills, the
 * greeting card (badge, headline, three stats, Up Next) and the two next steps (a
 * label, then a title and an action beside the dashed rail), then a row of
 * three suggestion cards; on the right the purchase summary over the RM
 * card (stacked, between the greeting card and the steps). Each block fades up and
 * shimmers on its own stagger, so the page reads as one wave.
 * Usage: <SuccessSkeleton label="Confirming your payment" />
 */
export function SuccessSkeleton({ label, nextUp = true }: SuccessSkeletonProps) {
  let i = 0;
  const next = () => (i++) * T;
  return (
    <div className={styles.wrap} role="status" aria-label={label}>
      <div className={styles.fold}>
        <div className={styles.main}>
          <div className={styles.pills}>
            {[78, 70, 82, 120].map((w, k) => (
              <Skeleton key={k} variant="rounded" width={w} height={26} delay={next()} className={styles.pill} />
            ))}
          </div>
          <div className={styles.hello}>
            <Skeleton variant="circular" width={80} height={80} delay={next()} className={styles.badge} />
            <div className={styles.helloText}>
              {/* The serif headline (two lines on a phone). */}
              <Skeleton width="72%" height={28} delay={next()} />
              <Skeleton width="56%" height={28} delay={next()} className={styles.phoneOnly} />
              <div className={styles.stats}>
                {[0, 1, 2].map((k) => (
                  <div key={k} className={styles.stat}>
                    <Skeleton width={80} height={10} delay={next()} />
                    <Skeleton width={80} height={16} delay={i * T - 20} />
                  </div>
                ))}
              </div>
              {/* Up Next: the note (five lines on a phone). */}
              <Skeleton width="96%" height={14} delay={next()} />
              <Skeleton width="60%" height={14} delay={next()} />
              <Skeleton width="90%" height={14} delay={next()} className={styles.phoneOnly} />
              <Skeleton width="84%" height={14} delay={next()} className={styles.phoneOnly} />
            </div>
          </div>
          <div className={styles.steps}>
            {[0, 1].map((k) => (
              <div key={k} className={styles.step}>
                <Skeleton width={k ? 128 : 76} height={12} delay={next()} />
                <div className={styles.stepBody}>
                  <Skeleton width="44%" height={16} delay={i * T} />
                  <Skeleton variant="rounded" width={k ? 140 : 190} height={33} delay={next()} className={styles.action} />
                </div>
              </div>
            ))}
          </div>
          {nextUp && (
            <div className={styles.next}>
              <Skeleton width="58%" height={20} delay={next()} />
              <Skeleton variant="rounded" width={228} height={48} delay={next()} />
            </div>
          )}
          <Skeleton variant="rounded" width="100%" height={4} delay={next()} />
          <div className={styles.more}>
            <Skeleton width={180} height={20} delay={next()} />
            <div className={styles.grid}>
              {[0, 1, 2].map((k) => (
                <Skeleton key={k} variant="rounded" width="100%" height={170} delay={next()} className={styles.card} />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.side}>
          <div className={styles.summary}>
            <Skeleton width={152} height={18} delay={3 * T} />
            <Skeleton width={220} height={14} delay={4 * T} />
            <Skeleton width={180} height={40} delay={5 * T} />
            <Skeleton variant="rounded" width="100%" height={68} delay={6 * T} />
            <Skeleton variant="rounded" width="100%" delay={7 * T} className={styles.coverages} />
            <Skeleton width={96} height={16} delay={8 * T} />
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className={styles.priceRow}>
                <Skeleton width={72} height={14} delay={(9 + k) * T} />
                <Skeleton width={64} height={20} delay={(9 + k) * T + 20} />
              </div>
            ))}
            <Skeleton width={140} height={40} delay={14 * T} className={styles.paid} />
            <Skeleton width={200} height={14} delay={15 * T} className={styles.paid} />
            {/* The Relationship Manager closes the summary, under a rule. */}
            <Skeleton width="100%" height={2} delay={16 * T} />
            <Skeleton variant="rounded" width="100%" delay={17 * T} className={styles.rm} />
          </div>
        </div>
      </div>
    </div>
  );
}
