"use client";

import { useEffect, useRef, useState } from "react";
import { DitherImage } from "@/components/ui/DitherImage";
import type { QuoteCardData, QuoteTerritory } from "@/types/quotesPage";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { splitName } from "@/lib/utils";
import { coverageMatch } from "@/lib/risk-fit";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import { BookOpenIcon } from "@/components/icons/BookOpenIcon";
import { NetraBot } from "@/components/ui/NetraBot";
import styles from "./QuoteCard.module.css";
import { Chevron } from "@/components/icons/Chevron";

/** The name on two lines; a two-word name ("Gold Quote") stays on one,
 *  over a blank line that keeps the card's height. */
const nameLines = (name: string): [string, string] =>
  name.trim().split(/\s+/).length <= 2 ? [name, "\u00a0"] : splitName(name);

/** The coverages chip's chevron (Figma 658:48100), info blue, at the chip's
 *  12px label size. */
function ChipChevron() {
  return <Chevron dir="right" size={12} />;
}

/** Ikkat rule colour per card tone (Figma 658:49326 / 49729 / 49915). */
const RULE_COLOR = {
  immediate: "var(--color-success)",
  priced: "var(--color-brand-primary)",
  quote: "var(--color-label-tertiary)",
} as const;

export interface QuoteCardLabels {
  sumInsured: string;
  getQuote: string;
  /** "Add To Compare" */
  compare: string;
  /** Offline quotes: the greyed compare slot ("Unavailable"). */
  comparisonUnavailable: string;
  immediatePurchase: string;
  /** Territory tags; omit to hide them. */
  territory?: Record<QuoteTerritory, string>;
  /** Coverages heading with no count (offline quotes): "Top Coverages". */
  topCoverages: string;
  /** The card's coverages chip on offline quotes: "View Coverages". */
  viewCoverages?: string;
  /** Coverages chip; `{count}` is the number of coverages. */
  coverageCount: string;
  /** The Gold Quote's chip: "{count} Personalized Coverages". */
  personalizedCount: string;
  /** Once the risk is scored: "{met} Key Features" (the popup's title). */
  riskFit?: string;
  /** The card's chip once scored: "View {met} Key Features". */
  riskFitChip?: string;
  /** The corner tag once scored: "Coverage Match: {value}%". */
  coverageMatch?: string;
  /** Tag tooltips (what Immediate Purchase, territory… mean). */
  tips?: { immediate: string; compareOff: string; compareFull: string; territory: Record<QuoteTerritory, string> };
}

export interface QuoteCardProps {
  quote: QuoteCardData;
  labels: QuoteCardLabels;
  /** The coverages chip — opens the policy details modal for this quote. */
  onViewFeatures?: () => void;
  /** Price button — starts checkout (priced quotes) or the Gold gate. */
  onSelect?: () => void;
  /** Slim card ("Other Quotes" on the Gold Inquiry page, Figma 642:35456):
   *  just the tag, logo, name and price bar (no rule or footer). */
  mini?: boolean;
  /** Add To Compare, controlled by the feed (its compare bar). Without
   *  `onToggleCompare` the tick is local. */
  compared?: boolean;
  onToggleCompare?: () => void;
  /** The compare bar is full: an unpicked card can't be added. */
  compareFull?: boolean;
}

/** The coverages chip copy for a quote (count first, or the bare label);
 *  `chip` picks the card's "View …" wording for a scored quote. */
export function coverageChipLabel(quote: QuoteCardData, labels: QuoteCardLabels, chip = false) {
  const fitLabel = chip ? (labels.riskFitChip ?? labels.riskFit) : labels.riskFit;
  if (quote.riskFit && fitLabel) {
    return fitLabel.replace("{met}", String(quote.riskFit.met)).replace("{total}", String(quote.riskFit.total));
  }
  const count = quote.coverages?.length ?? 0;
  if (!count) return labels.topCoverages;
  return (quote.gold ? labels.personalizedCount : labels.coverageCount).replace("{count}", String(count));
}

/** Hover shimmer: the burst on entry, then a calmer glitter while hovered. */
const SHINE_BURST_MS = 380;
const SHINE_REST = 0.35;
const SHINE_FADE_MS = 280;

/**
 * QuoteCard — one insurer quote in the grid (Figma 658:47652 immediate /
 * 658:49729 priced / 658:49915 offline, 866:26034). The tags hang off the top
 * edge (Immediate Purchase, then Coverage Match once scored), the logo sits
 * over the two-line insurer name with the D&O mark half-cropped behind, then
 * the coverages chip (→ the policy details modal) and Add To Compare, an
 * ikkat rule, and a tinted price bar (Sum Insured · price / Get Quote).
 * `data-tone` swaps the gradient, bar fill, rule and button; the arrow loops
 * while the card is hovered. The Gold Quote looks like any other card: no
 * quote is singled out. `data-reveal` hooks let RevealCard choreograph its
 * entrance.
 * Usage: <QuoteCard quote={q} labels={…} onViewFeatures={open} onSelect={buy} />
 */
export function QuoteCard({ quote, labels, onViewFeatures, onSelect, mini = false, compared: comparedProp, onToggleCompare, compareFull = false }: QuoteCardProps) {
  const arrowRef = useRef<MoveRightIconHandle>(null);
  const [comparedLocal, setComparedLocal] = useState(false);
  const compared = onToggleCompare ? !!comparedProp : comparedLocal;
  const toggleCompare = onToggleCompare ?? (() => setComparedLocal((v) => !v));
  const compareLocked = compareFull && !compared;

  // Every quote, the Gold Quote included, by what it is: bought online,
  // priced, or one to request. (Case B's Gold has no price yet, but its
  // Unlock Quote button fills like a price.)
  const tone = quote.immediate ? "immediate" : quote.price || quote.gold ? "priced" : "quote";
  const filled = !!quote.price || !!quote.gold;

  // The corner tags: Immediate Purchase, then the Coverage Match once the
  // risk is scored (Figma 866:26106).
  const match = coverageMatch(quote.riskFit);
  const tags = [
    tone === "immediate" && (
      <span key="immediate" className={styles.tab} data-tone="immediate" data-reveal="pill" data-tooltip={labels.tips?.immediate}>
        <ShoppingBagIcon size={10} color="var(--color-success)" />
        {labels.immediatePurchase}
      </span>
    ),
    match !== undefined && labels.coverageMatch && (
      <span key="match" className={styles.tab} data-tone="match" data-reveal="pill">
        <BookOpenIcon size={12} />
        {labels.coverageMatch.replace("{value}", String(match))}
      </span>
    ),
  ].filter(Boolean);
  const tag = tags.length ? <span className={styles.tabs}>{tags}</span> : null;

  // Shared by both views: the price / Get Quote button and Add To Compare.
  const priceButton = (
    <button type="button" className={filled ? styles.buttonFilled : styles.buttonOutline} onClick={onSelect}>
      {quote.price ?? quote.ctaLabel ?? labels.getQuote}
      <MoveRightIcon ref={arrowRef} size={14} loop className={styles.arrow} />
    </button>
  );

  const compare = quote.comparable ? (
    <button
      type="button"
      className={styles.compare}
      aria-pressed={compared}
      disabled={compareLocked}
      data-tooltip={compareLocked ? labels.tips?.compareFull : undefined}
      onClick={toggleCompare}
    >
      <span className={styles.checkbox} data-checked={compared || undefined} aria-hidden>
        {compared && (
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
            <path d="m3.4 6.2 1.7 1.7 3.5-3.8" stroke="var(--color-label-inverse)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {labels.compare}
    </button>
  ) : (
    <span className={styles.compareOff} data-tooltip={labels.tips?.compareOff}>
      <span className={styles.checkboxOff} aria-hidden />
      {labels.comparisonUnavailable}
    </span>
  );

  // Hover: the D&O mark shimmers and glitters (the Focus hero's PlpMark
  // effect; monochrome off the Gold Quote). The canvas mounts only while
  // hovered, igniting on entry, and fades out before it unmounts.
  const [shine, setShine] = useState<"off" | "on" | "leaving">("off");
  const shineEnergy = useRef(0);
  const shineTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(shineTimer.current), []);
  const hover = {
    onMouseEnter: () => {
      arrowRef.current?.startAnimation();
      window.clearTimeout(shineTimer.current);
      shineEnergy.current = 1;
      setShine("on");
      shineTimer.current = window.setTimeout(() => (shineEnergy.current = SHINE_REST), SHINE_BURST_MS);
    },
    onMouseLeave: () => {
      arrowRef.current?.stopAnimation();
      window.clearTimeout(shineTimer.current);
      setShine("leaving");
      shineTimer.current = window.setTimeout(() => setShine("off"), SHINE_FADE_MS);
    },
  };

  const card = (
    <article
      className={styles.card}
      data-tone={tone}
      {...hover}
    >
      {/* D&O mark, bottom half cropped away, placed absolutely behind the
          name (Figma 827:20909). */}
      <span className={styles.markClip} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/checkout/product-icon.png" alt="" className={styles.mark} />
        {shine !== "off" && (
          <DitherImage
            src="/media/checkout/product-icon.png"
            width={130}
            height={130}
            energy={shineEnergy}
            className={`${styles.markShine} ${shine === "leaving" ? styles.markShineOut : ""}`}
          />
        )}
      </span>
      {/* The tags sit in the flow, right-aligned; the row holds their height
          even on a card without tags, so every card's logo row lines up. */}
      <div className={styles.tabRow}>{tag}</div>

      <div className={styles.inner}>
        <div className={styles.head}>
          {/* The logo on one 32px row. No insurer yet (Case B's Gold):
              NetraBot holds the logo's place. */}
          <div className={styles.brand}>
            {quote.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={quote.logoSrc} alt="" aria-hidden className={styles.logo} data-reveal="item" />
            ) : quote.gold ? (
              <span className={styles.botSlot} aria-hidden data-reveal="item">
                <NetraBot state="idle" follow="page" size={28} />
              </span>
            ) : (
              <span className={styles.logoSlot} aria-hidden />
            )}
          </div>
          <h3 className={styles.name} title={quote.insurer}>
            {nameLines(quote.insurer).map((line, i) => (
              <span key={i} className={styles.nameLine} data-reveal="item">{line}</span>
            ))}
          </h3>
        </div>

        {/* Match & compare, then the ikkat rule, then Sum Insured & price. */}
        <div className={styles.body}>
          {!mini && (
            <>
              <div className={styles.foot} data-reveal="coverage">
                <button type="button" className={styles.chip} onClick={onViewFeatures} aria-haspopup="dialog">
                  {!quote.coverages?.length && !quote.riskFit && labels.viewCoverages ? labels.viewCoverages : coverageChipLabel(quote, labels, true)}
                  <ChipChevron />
                </button>
                {compare}
              </div>

              <div className={styles.rule} data-reveal="rule">
                <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} />
              </div>
            </>
          )}

          <div className={styles.bar} data-reveal="bar">
            <div className={styles.sum}>
              <span className={styles.sumLabel}>{labels.sumInsured}</span>
              <span className={styles.sumValue}>{quote.sumInsured}</span>
            </div>
            {priceButton}
          </div>
        </div>
      </div>
    </article>
  );

  return card;
}
