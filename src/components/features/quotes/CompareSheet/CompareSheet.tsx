"use client";

import { Fragment } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { QuoteCardData, QuotesFeedContent } from "@/types/quotesPage";
import styles from "./CompareSheet.module.css";
import { Button } from "@/components/ui/Button";

export interface CompareSheetProps {
  content: QuotesFeedContent["compareSheet"];
  /** The quotes picked with Add To Compare, in the order they were added. */
  picked: QuoteCardData[];
  onRemove: (quote: QuoteCardData) => void;
  /** Compare Now — live once `content.min` quotes are picked. */
  onCompare?: () => void;
}

/**
 * CompareSheet — the compare bar (Figma 665:50894): a white bar docked to the
 * viewport's foot while at least one quote is picked. `max` slots split by
 * hairlines: a picked quote shows its insurer logo in a purple-stroked box
 * with a boxed × on its right edge; an open slot is a dashed lilac box.
 * Compare Now (right) stays disabled until `min` are in.
 * Usage: <CompareSheet content={feed.compareSheet} picked={qs} onRemove={drop} />
 */
export function CompareSheet({ content, picked, onRemove, onCompare }: CompareSheetProps) {
  const reduced = useReducedMotion();
  const ready = picked.length >= content.min;
  const slots = Array.from({ length: content.max }, (_, i) => picked[i]);

  return (
    <AnimatePresence>
      {picked.length > 0 && (
        <motion.section
          key="compare-sheet"
          className={styles.sheet}
          aria-label={content.title}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile: the "pick at least 2" hint sits over the slots. */}
          {!ready && <p className={styles.hint}>{content.minTip}</p>}
          <div className={styles.inner}>
            <ul className={styles.slots}>
              {slots.map((q, i) => (
                <Fragment key={q ? `${q.gold ? "gold" : "q"}-${q.insurer}` : `open-${i}`}>
                  {i > 0 && <li className={styles.divider} aria-hidden />}
                  {q ? (
                    <li className={styles.slot}>
                      <span className={styles.picked}>
                        {q.logoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={q.logoSrc} alt={q.insurer} className={styles.logo} />
                        ) : (
                          <span className={styles.name}>{q.insurer}</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={content.removeLabel.replace("{insurer}", q.insurer)}
                        data-tooltip={content.removeLabel.replace("{insurer}", q.insurer)}
                        onClick={() => onRemove(q)}
                      >
                        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                          <path d="m3.5 3.5 5 5m0-5-5 5" stroke="var(--color-label-hint)" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ) : (
                    <li className={styles.slot}>
                      <span className={styles.open} aria-hidden />
                    </li>
                  )}
                </Fragment>
              ))}
            </ul>
            <span className={styles.ctaDivider} aria-hidden />
            <Button arrow className={styles.cta} disabled={!ready} blockedTip={content.minTip} onClick={ready ? onCompare : undefined}>
              {content.ctaLabel}
            </Button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
