"use client";

import { useRef } from "react";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import styles from "./QuoteCard.module.css";

/** Figma interface-icon/icons (523:24590) — 12px orange chevron. */
function FeaturesChevron() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
      <path d="M4.125 2.25 7.875 6 4.125 9.75" stroke="var(--color-brand-secondary)" strokeWidth="1.23539" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Splits a name into two lines at the word boundary that best balances their
 *  lengths ("Royal Sundaram General Insurance" → "Royal Sundaram" / "General
 *  Insurance"). A single word stays on the first line. */
function splitName(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, ""];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Divider colour per card tone (Figma 523:24551 / 523:24883 / 523:25057). */
const DIVIDER_COLOR = {
  immediate: "var(--color-success)",
  priced: "var(--color-brand-primary)",
  quote: "var(--color-label-tertiary)",
} as const;

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
 * QuoteCard — one insurer quote (Figma 523:24496 immediate / 523:24828 priced /
 * 523:25002 get-quote; hover 523:24653). Logo (+ immediate-purchase pill), an
 * ikkat divider, the insurer name, Add-To-Compare beside the price / Get Quote
 * button, and a purple stack with View All Features + Sum Insured. The tone
 * (gradient corner + divider colour) follows the quote type; the button arrow
 * animates only while the card is hovered. A ghost card (fuzzy match) shows
 * only a centered "Reveal Quote" button. Usage: <QuoteCard quote={q} labels={…} />
 */
export function QuoteCard({ quote, labels, onReveal }: QuoteCardProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const arrowRef = useRef<MoveRightIconHandle>(null);

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

  const tone = quote.immediate ? "immediate" : quote.price ? "priced" : "quote";

  return (
    <article
      className={styles.card}
      data-tone={tone}
      onMouseEnter={() => arrowRef.current?.startAnimation()}
      onMouseLeave={() => arrowRef.current?.stopAnimation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/quote-card-watermark.webp" alt="" aria-hidden className={styles.watermark} />

      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.logoRow}>
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
          <IkkatDivider height={2} unit={14} color={DIVIDER_COLOR[tone]} className={styles.divider} />
        </div>

        <div className={styles.header}>
          <h3 className={styles.insurer} title={quote.insurer}>
            {splitName(quote.insurer).map((line, i) => (
              <span key={i} className={styles.insurerLine}>{line}</span>
            ))}
          </h3>

          <div className={styles.actionRow}>
            {quote.comparable ? (
              <span className={styles.compare}>
                <span className={styles.checkbox} aria-hidden />
                {labels.compare}
              </span>
            ) : (
              <span className={styles.compareOff}>
                <span className={styles.checkboxOff} aria-hidden />
                {labels.comparisonUnavailable}
              </span>
            )}
            <button type="button" className={quote.price ? styles.price : styles.getQuote}>
              {quote.price ?? labels.getQuote}
              <MoveRightIcon ref={arrowRef} size={12} className={styles.arrow} />
            </button>
          </div>

          <div className={styles.bottomStack}>
            <button type="button" className={styles.viewFeatures}>
              {labels.viewFeatures}
              <FeaturesChevron />
            </button>
            <div className={styles.sum}>
              <span className={styles.sumLabel}>{labels.sumInsured}</span>
              <span className={styles.sumValue}>{quote.sumInsured}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
