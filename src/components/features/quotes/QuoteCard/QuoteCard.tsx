"use client";

import { useRef, type CSSProperties } from "react";
import type { QuoteCardData, QuoteRating } from "@/types/quotesPage";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { EyeIcon, type EyeIconHandle } from "@/components/icons/EyeIcon";
import { splitName } from "@/lib/utils";
import { PriceMorph, type PriceIntro } from "../PriceMorph";
import styles from "./QuoteCard.module.css";

/** Figma interface-icon/icons (587:62128) — 12px chevron, success green. */
function FeaturesChevron() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
      <path d="M4.125 2.25 7.875 6 4.125 9.75" stroke="var(--color-success)" strokeWidth="1.23539" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Top ikkat divider colour per card tone (Figma 553:29607 / 29205 / 28954 / 29978). */
const DIVIDER_COLOR = {
  gold: "var(--color-brand-secondary)",
  immediate: "var(--color-success)",
  priced: "var(--color-label-tertiary)",
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
  topCoverages: string;
  /** Coverage box for an offline quote in the compact grid. */
  coveragesUnavailable: string;
  poweredBy: string;
  ratings: Record<QuoteRating, string>;
}

/** Rating chip tone (Figma 584:45338 / 45382 / 45476 / 45508). */
const RATING_TONE = {
  excellent: "success",
  good: "info",
  average: "caution",
  na: "disabled",
} as const;

export interface QuoteCardProps {
  quote: QuoteCardData;
  labels: QuoteCardLabels;
  /** "View All Features" — opens the features drawer for this quote. */
  onViewFeatures?: () => void;
  /** Price button — starts checkout (immediate + priced quotes only). */
  onSelect?: () => void;
  /** When set, the rating badge pops in after this many seconds (the ripple
   *  that runs down the feed as the Gold Quote is revealed). */
  ratingDelay?: number;
  /** Offer prices (`originalPrice` set): where the strike → roll story is.
   *  Defaults to "done" (the offer at rest). */
  priceIntro?: PriceIntro;
  /** Grid view (the Mail Quotes experiment, Figma 640:24913 / 25533 /
   *  25701): logo beside the name, the tag as a tab off the top edge, the
   *  rule and a View All Features pill inside the coverage box, and an
   *  "Unavailable" block for offline quotes so every card keeps its height. */
  compact?: boolean;
  /** Slim grid card ("Other Quotes", Figma 642:35456): the compact card with
   *  just the tab, the logo over the name and the price bar (no coverages or
   *  compare). */
  mini?: boolean;
}

const BEAM_MS = 9000; // one revolution; matches beam-rotate in the CSS

/** Phase-locks the beam to the page clock, so a remount (the Gold card
 *  swapping from its reveal layer to the feed) picks up at the same angle
 *  instead of restarting from the top. */
function lockBeam(el: HTMLElement | null) {
  const now = Number(document.timeline?.currentTime ?? performance.now());
  if (el) el.style.animationDelay = `${-(now % BEAM_MS)}ms`;
}

/**
 * QuoteCard — one insurer quote in the vertical feed (Figma 553:29607 immediate
 * / 553:29205 priced / 553:28954 get-quote / 553:29978 gold; 584:* refresh).
 * Pill left + insurer logo right, an ikkat rule, the two-line insurer name, a
 * "Top Coverages" box (rating, chips, a plain rule, View All Features → the
 * features drawer), and a bottom bar with Add-To-Compare, Sum Insured and the
 * price / Get Quote button. `data-tone` swaps the gradient, rule colour, bar
 * fill and button; the arrow loops while the card is hovered. The Gold card is
 * wrapped in a golden "border beam" that circles its edge to draw the eye.
 * `data-reveal` hooks let RevealCard choreograph the Gold card's entrance.
 * Usage: <QuoteCard quote={q} labels={…} />
 */
export function QuoteCard({ quote, labels, onViewFeatures, onSelect, ratingDelay, priceIntro = "done", compact = false, mini = false }: QuoteCardProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<EyeIconHandle>(null);
  const arrowRef = useRef<MoveRightIconHandle>(null);


  const tone = quote.gold ? "gold" : quote.immediate ? "immediate" : quote.price ? "priced" : "quote";
  const filled = tone === "gold" || !!quote.price;

  // The price bar (Add To Compare · Sum Insured · price), shared by both layouts.
  const bar = (
    <div className={styles.bar} data-reveal="bar">
      {mini ? null : quote.comparable ? (
        <span className={styles.compare} data-reveal="item">
          <span className={styles.checkbox} aria-hidden />
          {labels.compare}
        </span>
      ) : (
        <span className={styles.compareOff} data-reveal="item">
          <span className={styles.checkboxOff} aria-hidden />
          {labels.comparisonUnavailable}
        </span>
      )}
      <div className={styles.barRight}>
        <div className={styles.sum} data-reveal="item">
          <span className={styles.sumLabel}>{labels.sumInsured}</span>
          <span className={styles.sumValue}>{quote.sumInsured}</span>
        </div>
        <button type="button" className={filled ? styles.buttonFilled : styles.buttonOutline} onClick={onSelect} data-reveal="item">
          {quote.price && quote.originalPrice ? (
            <PriceMorph from={quote.originalPrice} to={quote.price} intro={priceIntro} />
          ) : (
            (quote.price ?? labels.getQuote)
          )}
          <MoveRightIcon ref={arrowRef} size={12} loop className={styles.arrow} />
        </button>
      </div>
    </div>
  );

  const standard = (
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
          <div className={styles.logoRow} data-reveal="pill">
            {tone === "gold" && (
              <TagPill
                variant="secondary"
                className={styles.pill}
                label={labels.poweredBy}
                icon={<EyeIcon ref={eyeRef} size={12} color="var(--color-brand-secondary)" />}
                onMouseEnter={() => eyeRef.current?.startAnimation()}
                onMouseLeave={() => eyeRef.current?.stopAnimation()}
              />
            )}
            {tone === "immediate" && (
              <TagPill
                variant="success"
                className={styles.pill}
                label={labels.immediatePurchase}
                icon={<ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />}
                onMouseEnter={() => bagRef.current?.startAnimation()}
                onMouseLeave={() => bagRef.current?.stopAnimation()}
              />
            )}
            {quote.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={quote.logoSrc} alt={quote.insurer} className={styles.logo} />
            ) : (
              <span className={styles.logoSlot} aria-hidden />
            )}
          </div>
          <div className={styles.hook} data-reveal="rule">
            <IkkatDivider height={2} unit={19} color={DIVIDER_COLOR[tone]} className={styles.divider} />
          </div>
        </div>

        <div className={styles.header}>
          <h3 className={styles.insurer} title={quote.insurer}>
            {splitName(quote.insurer).map((line, i) => (
              <span key={i} className={styles.insurerLine} data-reveal="item">{line}</span>
            ))}
          </h3>

          <div className={styles.coverage} data-reveal="coverage">
            <div className={styles.coverageHead}>
              <p className={styles.coverageLabel} data-reveal="item">{labels.topCoverages}</p>
              {quote.rating && (
                <span
                  data-reveal="rating"
                  className={ratingDelay !== undefined ? styles.ratingPop : styles.rating}
                  style={ratingDelay !== undefined ? ({ "--rating-delay": `${ratingDelay}s` } as CSSProperties) : undefined}
                >
                  <IndicatorBadge label={labels.ratings[quote.rating]} tone={RATING_TONE[quote.rating]} size="sm" />
                </span>
              )}
            </div>
            {!!quote.coverages?.length && (
              <ul className={styles.chips}>
                {quote.coverages.map((c, i) => (
                  <li key={`${c}-${i}`} className={styles.chip} data-reveal="chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/media/coverage-check.svg" alt="" aria-hidden className={styles.chipCheck} />
                    {c}
                  </li>
                ))}
              </ul>
            )}
            <hr className={styles.rule} data-reveal="item" />
            <button type="button" className={styles.viewFeatures} onClick={onViewFeatures} aria-haspopup="dialog" data-reveal="item">
              {labels.viewFeatures}
              <FeaturesChevron />
            </button>
          </div>

          {bar}
        </div>
      </div>
    </article>
  );

  // Compact (grid): the same parts and data-reveal hooks, laid out tighter.
  const tag =
    tone === "gold" ? (
      <span className={styles.tab} data-tone="gold" data-reveal="pill">
        <EyeIcon ref={eyeRef} size={10} color="var(--color-brand-secondary)" />
        {labels.poweredBy}
      </span>
    ) : tone === "immediate" ? (
      <span className={styles.tab} data-tone="immediate" data-reveal="pill">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/quote-card/lightning.svg" alt="" aria-hidden className={styles.tabIcon} />
        {labels.immediatePurchase}
      </span>
    ) : null;

  const compactCard = (
    <article
      className={styles.card}
      data-tone={tone}
      data-compact
      data-mini={mini || undefined}
      onMouseEnter={() => arrowRef.current?.startAnimation()}
      onMouseLeave={() => arrowRef.current?.stopAnimation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/checkout/product-icon.svg" alt="" aria-hidden className={styles.compactMark} />
      {tag}
      <div className={styles.compactInner}>
        <div className={styles.compactHead}>
          {/* No insurer yet (Case B's locked Gold): the name starts the row. */}
          {quote.logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={quote.logoSrc} alt="" aria-hidden className={styles.compactLogo} />
          )}
          <h3 className={styles.compactName} title={quote.insurer}>
            {splitName(quote.insurer).map((line, i) => (
              <span key={i} className={styles.insurerLine} data-reveal="item">{line}</span>
            ))}
          </h3>
        </div>

        {!mini && (
        <div className={styles.compactCoverage} data-reveal="coverage">
          <div className={styles.coverageHead}>
            <p className={styles.coverageLabel} data-reveal="item">{labels.topCoverages}</p>
            {quote.rating && (
              <span
                data-reveal="rating"
                className={ratingDelay !== undefined ? styles.ratingPop : styles.rating}
                style={ratingDelay !== undefined ? ({ "--rating-delay": `${ratingDelay}s` } as CSSProperties) : undefined}
              >
                <IndicatorBadge label={labels.ratings[quote.rating]} tone={RATING_TONE[quote.rating]} size="sm" />
              </span>
            )}
          </div>
          {quote.coverages?.length ? (
            <ul className={styles.chips}>
              {quote.coverages.map((c, i) => (
                <li key={`${c}-${i}`} className={styles.chip} data-reveal="chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/coverage-check.svg" alt="" aria-hidden className={styles.chipCheck} />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.unavailable} data-reveal="item">{labels.coveragesUnavailable}</p>
          )}
          <div className={styles.compactRule} data-reveal="rule">
            <IkkatDivider height={2} unit={19} color={DIVIDER_COLOR[tone]} />
          </div>
          <button type="button" className={styles.viewFeatures} onClick={onViewFeatures} aria-haspopup="dialog" data-reveal="item">
            {labels.viewFeatures}
            <FeaturesChevron />
          </button>
        </div>
        )}

        {bar}
      </div>
    </article>
  );

  const card = compact || mini ? compactCard : standard;

  // Gold: a golden beam circles the border (overlay only — card CSS untouched).
  // Two masked layers share one rotating conic sweep: a crisp ring on top and
  // a blurred halo behind.
  if (tone !== "gold") return card;
  return (
    <div className={styles.goldBeam}>
      <span className={styles.beamGlow} aria-hidden data-reveal="beam">
        <span ref={lockBeam} className={styles.beamSpin} />
      </span>
      {card}
      <span className={styles.beamRing} aria-hidden data-reveal="beam">
        <span ref={lockBeam} className={styles.beamSpin} />
      </span>
    </div>
  );
}
