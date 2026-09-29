"use client";

import { useEffect, useRef, useState } from "react";
import { DitherImage } from "@/components/ui/DitherImage";
import type { QuoteCardData, QuoteRating, QuoteTerritory } from "@/types/quotesPage";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { splitName } from "@/lib/utils";
import { PriceMorph, type PriceIntro } from "../PriceMorph";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import styles from "./QuoteCard.module.css";
import fx from "./QuoteCardFeatures.module.css";
import { Chevron } from "@/components/icons/Chevron";

/** 12px chevron on View All Features (Figma 587:62128), success green. */
function FeaturesChevron() {
  return (
    <Chevron dir="right" size={12} color="var(--color-success)" />
  );
}

/** Rating chip tone (Figma 584:45338 / 45382 / 45476 / 45508). */
const RATING_TONE = {
  excellent: "success",
  good: "info",
  average: "caution",
  na: "disabled",
} as const;

/** The coverages chip's chevron (Figma 658:48100), info blue, at the chip's
 *  12px label size. */
function ChipChevron() {
  return <Chevron dir="right" size={12} />;
}

/** Ikkat rule colour per card tone (Figma 658:49326 / 49729 / 49915). */
const RULE_COLOR = {
  gold: "var(--color-brand-secondary)",
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
  poweredBy: string;
  /** Coverages heading with no count (offline quotes): "Top Coverages". */
  topCoverages: string;
  /** The card's coverages chip on offline quotes: "View Coverages". */
  viewCoverages?: string;
  /** Coverages chip; `{count}` is the number of coverages. */
  coverageCount: string;
  /** The Gold Quote's chip: "{count} Personalized Coverages". */
  personalizedCount: string;
  /** Top Coverages view only: the View All Features pill, the offline
   *  "Unavailable" block and the rating chips. */
  viewFeatures?: string;
  coveragesUnavailable?: string;
  ratings?: Record<QuoteRating, string>;
  /** Tag tooltips (what Immediate Purchase, territory… mean). */
  tips?: { immediate: string; gold: string; compareOff: string; compareFull: string; offer: string; territory: Record<QuoteTerritory, string> };
}

/** "compact" — the current card (Figma 658:47652); "features" — the previous
 *  Top Coverages card (640:24913), swapped in from the breadcrumb. */
export type QuoteCardView = "compact" | "features";

export interface QuoteCardProps {
  quote: QuoteCardData;
  labels: QuoteCardLabels;
  /** The coverages chip — opens the policy details modal for this quote. */
  onViewFeatures?: () => void;
  /** Price button — starts checkout (priced quotes) or the Gold gate. */
  onSelect?: () => void;
  /** Offer prices (`originalPrice` set): where the strike → roll story is.
   *  Defaults to "done" (the offer at rest). */
  priceIntro?: PriceIntro;
  /** Slim card ("Other Quotes" on the Gold Inquiry page, Figma 642:35456):
   *  just the tag, logo, name and price bar (no rule or footer). */
  mini?: boolean;
  view?: QuoteCardView;
  /** Add To Compare, controlled by the feed (its compare bar). Without
   *  `onToggleCompare` the tick is local. */
  compared?: boolean;
  onToggleCompare?: () => void;
  /** The compare bar is full: an unpicked card can't be added. */
  compareFull?: boolean;
}

/** The coverages chip copy for a quote (count first, or the bare label). */
export function coverageChipLabel(quote: QuoteCardData, labels: QuoteCardLabels) {
  const count = quote.coverages?.length ?? 0;
  if (!count) return labels.topCoverages;
  return (quote.gold ? labels.personalizedCount : labels.coverageCount).replace("{count}", String(count));
}

const BEAM_MS = 9000;
/** Hover shimmer: the burst on entry, then a calmer glitter while hovered. */
const SHINE_BURST_MS = 380;
const SHINE_REST = 0.35;
const SHINE_FADE_MS = 280; // one revolution; matches beam-rotate in the CSS

/** Phase-locks the beam to the page clock, so a remount (the Gold card
 *  swapping from its reveal layer to the feed) picks up at the same angle
 *  instead of restarting from the top. */
export function lockBeam(el: HTMLElement | null) {
  const now = Number(document.timeline?.currentTime ?? performance.now());
  if (el) el.style.animationDelay = `${-(now % BEAM_MS)}ms`;
}

/**
 * QuoteCard — one insurer quote in the grid (Figma 658:47652 immediate /
 * 658:49729 priced / 658:49915 offline). The tag hangs off the top edge
 * (Immediate Purchase, or Secured with BimaNetra on the Gold Quote), the logo
 * sits over the two-line insurer name with the D&O mark half-cropped behind,
 * then a tinted price bar (Sum Insured · price / Get Quote), an ikkat rule,
 * and a footer with the coverages chip (→ the policy details modal) and Add
 * To Compare. `data-tone` swaps the gradient, bar fill, rule and button; the
 * arrow loops while the card is hovered. The Gold card is wrapped in a golden
 * border beam. `data-reveal` hooks let RevealCard choreograph its entrance.
 * Usage: <QuoteCard quote={q} labels={…} onViewFeatures={open} onSelect={buy} />
 */
export function QuoteCard({ quote, labels, onViewFeatures, onSelect, priceIntro = "done", mini = false, view = "compact", compared: comparedProp, onToggleCompare, compareFull = false }: QuoteCardProps) {
  const arrowRef = useRef<MoveRightIconHandle>(null);
  const [comparedLocal, setComparedLocal] = useState(false);
  const compared = onToggleCompare ? !!comparedProp : comparedLocal;
  const toggleCompare = onToggleCompare ?? (() => setComparedLocal((v) => !v));
  const compareLocked = compareFull && !compared;

  const tone = quote.gold ? "gold" : quote.immediate ? "immediate" : quote.price ? "priced" : "quote";
  const filled = tone === "gold" || !!quote.price;

  // Territory tag (purple, text only), then the tone tag.
  const territoryTag =
    quote.territory && labels.territory ? (
      <span className={styles.tab} data-tone="territory" data-reveal="pill" data-tooltip={labels.tips?.territory[quote.territory]}>
        {labels.territory[quote.territory]}
      </span>
    ) : null;
  const toneTag =
    tone === "gold" ? (
      <span className={styles.tab} data-tone="gold" data-reveal="pill" data-tooltip={labels.tips?.gold}>
        <BadgeCheckIcon size={10} color="var(--color-brand-secondary)" />
        {labels.poweredBy}
      </span>
    ) : tone === "immediate" ? (
      <span className={styles.tab} data-tone="immediate" data-reveal="pill" data-tooltip={labels.tips?.immediate}>
        <ShoppingBagIcon size={10} color="var(--color-success)" />
        {labels.immediatePurchase}
      </span>
    ) : null;
  const tag =
    territoryTag || toneTag ? (
      <span className={styles.tabs}>
        {territoryTag}
        {toneTag}
      </span>
    ) : null;

  // Shared by both views: the price / Get Quote button and Add To Compare.
  const priceButton = (
    <button
      type="button"
      className={filled ? styles.buttonFilled : styles.buttonOutline}
      onClick={onSelect}
      data-tooltip={quote.price && quote.originalPrice ? labels.tips?.offer?.replace("{from}", quote.originalPrice) : undefined}
    >
      {quote.price && quote.originalPrice ? (
        <PriceMorph from={quote.originalPrice} to={quote.price} intro={priceIntro} />
      ) : (
        (quote.price ?? labels.getQuote)
      )}
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

  // The previous Top Coverages layout (640:24913): logo beside the name, the
  // coverages box, then Add To Compare · Sum Insured · price in the bar.
  const featuresCard = (
    <article className={styles.card} data-tone={tone} {...hover}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/media/checkout/product-icon.png" alt="" aria-hidden className={fx.mark} />
      {tag}
      <div className={fx.inner}>
        <div className={fx.head}>
          {quote.logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={quote.logoSrc} alt="" aria-hidden className={fx.logo} data-reveal="item" />
          )}
          <h3 className={fx.name} title={quote.insurer}>
            {splitName(quote.insurer).map((line, i) => (
              <span key={i} className={fx.nameLine} data-reveal="item" data-tooltip-overflow>{line}</span>
            ))}
          </h3>
        </div>

        <div className={fx.coverage} data-reveal="coverage">
          <div className={fx.coverageHead}>
            <p className={fx.coverageLabel} data-reveal="item">{labels.topCoverages}</p>
            {quote.rating && labels.ratings && (
              <span className={fx.rating} data-reveal="rating">
                <IndicatorBadge label={labels.ratings[quote.rating]} tone={RATING_TONE[quote.rating]} size="sm" />
              </span>
            )}
          </div>
          {quote.coverages?.length ? (
            <ul className={fx.chips}>
              {quote.coverages.map((c, i) => (
                <li key={`${c}-${i}`} className={fx.chip} data-reveal="chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/media/coverage-check.svg" alt="" aria-hidden className={fx.chipCheck} />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className={fx.unavailable} data-reveal="item">{labels.coveragesUnavailable}</p>
          )}
          <div className={fx.rule} data-reveal="rule">
            <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} />
          </div>
          <button type="button" className={fx.viewFeatures} onClick={onViewFeatures} aria-haspopup="dialog" data-reveal="item">
            {labels.viewFeatures}
            <FeaturesChevron />
          </button>
        </div>

        <div className={fx.bar} data-reveal="bar">
          {compare}
          <div className={fx.barRight}>
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

  const compactCard = (
    <article
      className={styles.card}
      data-tone={tone}
      {...hover}
    >
      {/* D&O mark, bottom half cropped away (Figma 658:49015). */}
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
      {tag}

      <div className={styles.inner}>
        <div className={styles.head}>
          {/* No insurer yet (Case B's Gold): an empty slot holds the logo's
              32px, so the name lines up with the cards beside it. */}
          {quote.logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={quote.logoSrc} alt="" aria-hidden className={styles.logo} data-reveal="item" />
          ) : (
            <span className={styles.logoSlot} aria-hidden />
          )}
          <h3 className={styles.name} title={quote.insurer}>
            {splitName(quote.insurer).map((line, i) => (
              <span key={i} className={styles.nameLine} data-reveal="item">{line}</span>
            ))}
          </h3>
        </div>

        <div className={styles.body}>
          <div className={styles.bar} data-reveal="bar">
            <div className={styles.sum}>
              <span className={styles.sumLabel}>{labels.sumInsured}</span>
              <span className={styles.sumValue}>{quote.sumInsured}</span>
            </div>
            {priceButton}
          </div>

          {!mini && (
            <>
              <div className={styles.rule} data-reveal="rule">
                <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} />
              </div>

              <div className={styles.foot} data-reveal="coverage">
                <button type="button" className={styles.chip} onClick={onViewFeatures} aria-haspopup="dialog">
                  {!quote.coverages?.length && labels.viewCoverages ? labels.viewCoverages : coverageChipLabel(quote, labels)}
                  <ChipChevron />
                </button>
                {compare}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );

  const card = view === "features" && !mini ? featuresCard : compactCard;

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
