"use client";

import { useRef } from "react";
import type { CheckoutSummaryContent } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { EyeIcon, type EyeIconHandle } from "@/components/icons/EyeIcon";
import { formatInr, splitPrice } from "@/lib/checkout";
import { splitName } from "@/lib/utils";
import styles from "./PurchaseSummary.module.css";

export interface PurchaseSummaryProps {
  content: CheckoutSummaryContent;
  quote: QuoteCardData;
}

/* The ikkat rule under the title, in the chosen quote's colour (as on its card). */
const RULE_COLOR = {
  gold: "var(--color-brand-secondary)",
  immediate: "var(--color-success)",
  neutral: "var(--color-label-tertiary)",
} as const;

/**
 * PurchaseSummary — the summary card in checkout's left panel (Figma
 * 638:17307): the quote's pill, dotted rule, product name + icon, insurer box
 * and the price split at 18% GST. A quote with an offer (the Gold Quotes)
 * prices its original, then the BimaNetra Offer (saving and % off) and the
 * Final Cost in serif; others end on the Total Cost. The step CTA and any
 * consent live on the form side.
 * Usage: <PurchaseSummary content={summary} quote={q} />
 */
export function PurchaseSummary({ content, quote }: PurchaseSummaryProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<EyeIconHandle>(null);
  // An offer prices the original, then takes the saving off it.
  const base = splitPrice(quote.originalPrice ?? quote.price ?? "", content.gstRate);
  const final = splitPrice(quote.price ?? "", content.gstRate).total;
  const saving = quote.originalPrice ? base.total - final : 0;
  const pct = base.total ? Math.round((saving / base.total) * 100) : 0;
  const tone = quote.gold ? "gold" : quote.immediate ? "immediate" : "neutral";
  const [line1, line2] = splitName(quote.insurer);

  return (
    <div className={styles.column}>
      {/* A soft lavender beam circles the card's edge (after the Gold Quote's,
          but slower and paler): a halo behind, a hairline ring on top. */}
      <div className={styles.beam}>
        <span className={styles.beamGlow} aria-hidden>
          <span className={styles.beamSpin} />
        </span>
      <section className={styles.card} data-tone={tone === "neutral" ? undefined : tone}>
        {/* Product icon (Figma 635:16096): a 100px mark cropped to its top half
            in a 100×50 window, pinned to the card beside the product name. */}
        <span className={styles.productIconCrop} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.productIconSrc} alt="" className={styles.productIcon} />
        </span>
        <div className={styles.head}>
          <h2 className={styles.title}>{content.title}</h2>
          {/* The quote's own pill, as on its card: the Gold Quote is Powered by
              BimaNetra, other purchasable quotes are Immediate Purchase. */}
          {quote.gold ? (
            <TagPill
              variant="secondary"
              className={styles.tag}
              label={content.poweredByLabel}
              icon={<EyeIcon ref={eyeRef} size={12} color="var(--color-brand-secondary)" />}
              onMouseEnter={() => eyeRef.current?.startAnimation()}
              onMouseLeave={() => eyeRef.current?.stopAnimation()}
            />
          ) : (
            quote.immediate && (
              <TagPill
                variant="success"
                className={styles.tag}
                label={content.immediateLabel}
                icon={<ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />}
                onMouseEnter={() => bagRef.current?.startAnimation()}
                onMouseLeave={() => bagRef.current?.stopAnimation()}
              />
            )
          )}
        </div>
        <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} className={styles.rule} />

        <div className={styles.product}>
          <p className={styles.productName}>
            <span>{content.productLines[0]}</span>
            <span>{content.productLines[1]}</span>
          </p>
        </div>

        <div className={styles.insurer}>
          {/* Quotes without an insurer logo show just the name. */}
          {quote.logoSrc && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={quote.logoSrc} alt="" aria-hidden className={styles.logo} />
              <span className={styles.vr} aria-hidden />
            </>
          )}
          <p className={styles.insurerName}>
            <span>{line1}</span>
            <span>{line2}</span>
          </p>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" role="img" aria-label={content.insurerInfoLabel} className={styles.info}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--color-info-fill)" strokeWidth="1" />
            <circle cx="8" cy="5.2" r="0.8" fill="var(--color-info-fill)" />
            <path d="M8 7.3v4" stroke="var(--color-info-fill)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

        <div className={styles.prices}>
          <p className={styles.priceTitle}>{content.priceTitle}</p>
          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>{content.premiumLabel}</dt>
              <dd>{formatInr(base.premium)}</dd>
            </div>
            <div className={styles.row}>
              <dt>{content.gstLabel}</dt>
              <dd>{formatInr(base.gst)}</dd>
            </div>
            <div className={styles.row} data-total={saving ? "plain" : "final"}>
              <dt>{content.totalLabel}</dt>
              <dd>{formatInr(base.total)}</dd>
            </div>
            {saving > 0 && (
              <>
                <div className={styles.row} data-offer>
                  <dt>{content.offerLabel}</dt>
                  <dd>
                    <span className={styles.offerPct}>{content.offerPercent.replace("{pct}", String(pct))}</span> {formatInr(saving)}
                  </dd>
                </div>
                <div className={styles.row} data-final>
                  <dt>{content.finalLabel}</dt>
                  <dd>{formatInr(final)}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </section>
        <span className={styles.beamRing} aria-hidden>
          <span className={styles.beamSpin} />
        </span>
      </div>
    </div>
  );
}
