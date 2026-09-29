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
/* The timeline step that opens by default (Due Diligence, "active"). */
const ACTIVE = 3;

/**
 * SuccessSkeleton — the success page's loading state, block for block with
 * the real layout: on the left the greeting card (badge, greeting, four
 * stats), the ikkat rule and the five-step timeline as it opens (an
 * accordion: the done and pending steps are just their pill, the active one,
 * Due Diligence, shows its title, lines and action beside the rail); on the
 * right the purchase summary over the
 * RM card; then the page rule and a row of three suggestion cards. Each block fades up and
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
          <div className={styles.hello}>
            <Skeleton variant="circular" width={80} height={80} delay={next()} className={styles.badge} />
            <div className={styles.helloText}>
              <Skeleton width="92%" height={16} delay={next()} />
              <Skeleton width="48%" height={16} delay={next()} />
              {/* Phones: the greeting wraps to four lines. */}
              <Skeleton width="86%" height={16} delay={next()} className={styles.phoneOnly} />
              <Skeleton width="64%" height={16} delay={next()} className={styles.phoneOnly} />
              <div className={styles.stats}>
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className={styles.stat}>
                    <Skeleton width={80} height={10} delay={next()} />
                    <Skeleton width={104} height={22} delay={i * T - 20} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Skeleton variant="rounded" width="100%" height={4} delay={next()} />
          <div>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} className={styles.step}>
                <Skeleton variant="rounded" width={k === 4 ? 116 : 90} height={26} delay={next()} className={styles.pill} />
                {k === ACTIVE ? (
                  <div className={styles.stepBody}>
                    <Skeleton width="44%" height={16} delay={i * T} />
                    <Skeleton width="92%" height={12} delay={i * T + 20} />
                    <Skeleton width="88%" height={12} delay={i * T + 40} />
                    <Skeleton width="56%" height={12} delay={i * T + 60} className={styles.phoneOnly} />
                    <Skeleton variant="rounded" width={176} height={38} delay={next()} className={styles.action} />
                  </div>
                ) : (
                  <div className={styles.stepGap} />
                )}
              </div>
            ))}
          </div>
          {nextUp && (
            <div className={styles.next}>
              <Skeleton width="58%" height={20} delay={next()} />
              <Skeleton variant="rounded" width={228} height={48} delay={next()} />
            </div>
          )}
        </div>
        <div className={styles.side}>
          <div className={styles.summary}>
            <div className={styles.summaryTags}>
              <Skeleton variant="rounded" width={132} height={24} delay={T} />
              <Skeleton variant="rounded" width={145} height={24} delay={2 * T} />
            </div>
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
          </div>

          <Skeleton variant="rounded" width="100%" delay={next()} className={styles.rm} />
        </div>
      </div>

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
  );
}
