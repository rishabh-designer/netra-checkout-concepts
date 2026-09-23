"use client";

import { useRef } from "react";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import styles from "./QuoteCard.module.css";

export interface QuoteCardLabels {
  sumInsured: string;
  getQuote: string;
  viewFeatures: string;
  compare: string;
  comparisonUnavailable: string;
  immediatePurchase: string;
  revealQuote: string;
}

export interface QuoteCardProps {
  quote: QuoteCardData;
  labels: QuoteCardLabels;
  /** Ghost card only — fired by "Reveal Quote" (unwired this pass). */
  onReveal?: () => void;
}

/**
 * QuoteCard — one insurer quote: logo header (+ immediate-purchase badge), name,
 * sum insured with a price pill or "Get Quote", an optional "X% Match" bar, and a
 * footer (View All Features + Add-to-Compare / Comparison Unavailable). All
 * actions are presentational this pass. A ghost card (fuzzy match) shows only a
 * centered "Reveal Quote" button. Usage: <QuoteCard quote={q} labels={…} />
 */
export function QuoteCard({ quote, labels, onReveal }: QuoteCardProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const match = typeof quote.matchPercent === "number" ? Math.max(0, Math.min(100, quote.matchPercent)) : null;

  // Ghost / locked card — the golden quote is hidden until the user reveals it.
  if (quote.ghost) {
    return (
      <article className={styles.ghostCard}>
        <button type="button" className={styles.reveal} onClick={onReveal}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/chat-with-us.svg" alt="" className={styles.revealIcon} aria-hidden />
          {labels.revealQuote}
        </button>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.logoBar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={quote.logoSrc} alt={quote.insurer} className={styles.logo} />
        {quote.immediate && (
          <TagPill
            variant="success"
            label={labels.immediatePurchase}
            icon={<ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />}
            onMouseEnter={() => bagRef.current?.startAnimation()}
            onMouseLeave={() => bagRef.current?.stopAnimation()}
          />
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.insurer}>{quote.insurer}</h3>

        <div className={styles.sumRow}>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>{labels.sumInsured}</span>
            <span className={styles.sumValue}>{quote.sumInsured}</span>
          </div>
          {quote.price ? (
            <span className={styles.price}>{quote.price}</span>
          ) : (
            <button type="button" className={styles.getQuote}>
              {labels.getQuote}
            </button>
          )}
        </div>

        {match !== null && (
          <div className={styles.matchRow}>
            <span className={styles.matchLabel}>{match}% Match</span>
            <div className={styles.matchTrack}>
              <div className={styles.matchFill} style={{ width: `${match}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.viewFeatures}>
          {labels.viewFeatures}
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
            <path d="m6 4 4 4-4 4" stroke="var(--color-brand-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {quote.comparable ? (
          <span className={styles.compare}>
            {labels.compare}
            <span className={styles.checkbox} aria-hidden />
          </span>
        ) : (
          <span className={styles.compareOff}>
            {labels.comparisonUnavailable}
            <span className={styles.checkboxOff} aria-hidden />
          </span>
        )}
      </div>
    </article>
  );
}
