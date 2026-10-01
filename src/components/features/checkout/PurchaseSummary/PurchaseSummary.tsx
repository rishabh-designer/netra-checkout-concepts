"use client";

import { useRef, type ReactNode } from "react";
import type { CheckoutSummaryContent } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { BadgeCheckIcon, type BadgeCheckIconHandle } from "@/components/icons/BadgeCheckIcon";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { formatInr, splitPrice } from "@/lib/checkout";
import { splitName } from "@/lib/utils";
import styles from "./PurchaseSummary.module.css";

export interface PurchaseSummaryProps {
  content: CheckoutSummaryContent;
  quote: QuoteCardData;
  /** Success page: the quote's coverages as ticked chips under a count pill. */
  coverages?: { label: string; items: string[] };
  /** Success page: the paid amount, large in green serif, over `label`
   *  ("Paid Successfully On …"); replaces the Final Cost row. `amount`
   *  overrides the figure (e.g. a count-up). */
  paid?: { label: string; amount?: ReactNode };
  /** Who the policy is for, under the title (Figma 689:57121). */
  company?: string;
  /** The lavender border beam (checkout). Off once paid: the success page's
   *  greeting card carries the beam instead. */
  beam?: boolean;
  /** Checkout's mobile footer (Figma 734:35562): tighter 12 padding, r16,
   *  title and pill on one line (no company), smaller type, the icon tucked
   *  under the insurer box beside the product name. */
  compact?: boolean;
  /** Checkout (web): the step's consent and CTA, closing the card (Figma
   *  613:68858 / 613:69256). */
  footer?: ReactNode;
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
 * consent live on the form side. On the success page it also lists the
 * quote's coverages and ends on the paid amount (`coverages`, `paid`).
 * Usage: <PurchaseSummary content={summary} quote={q} />
 */
export function PurchaseSummary({ content, quote, coverages, paid, company, beam = true, compact = false, footer }: PurchaseSummaryProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<BadgeCheckIconHandle>(null);
  // An offer prices the original, then takes the saving off it.
  const base = splitPrice(quote.originalPrice ?? quote.price ?? "", content.gstRate);
  const final = splitPrice(quote.price ?? "", content.gstRate).total;
  const saving = quote.originalPrice ? base.total - final : 0;
  const pct = base.total ? Math.round((saving / base.total) * 100) : 0;
  const tone = quote.gold ? "gold" : quote.immediate ? "immediate" : "neutral";
  const [line1, line2] = splitName(quote.insurer);
  const productIcon = (
    <span className={styles.productIconCrop} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.productIconSrc} alt="" className={styles.productIcon} />
    </span>
  );

  return (
    <div className={styles.column}>
      {/* A soft lavender beam circles the card's edge (after the Gold Quote's,
          but slower and paler): a halo behind, a hairline ring on top. */}
      <div className={styles.beam} data-compact={compact || undefined}>
        {beam && (
          <span className={styles.beamGlow} aria-hidden>
            <span className={styles.beamSpin} />
          </span>
        )}
      <section className={styles.card} data-tone={tone === "neutral" ? undefined : tone} data-paid={paid ? true : undefined} data-compact={compact || undefined}>
        {/* Product icon (Figma 635:16096): a 100px mark cropped to its top half
            in a 100×50 window, pinned to the card beside the product name
            (compact: hung off the name row itself). */}
        {!compact && productIcon}
        {/* Pills: Secured with BimaNetra on the Gold Quote, Immediate Purchase on
            anything bought online (a priced Gold Quote carries both). Once
            paid they sit above the title (Figma 670:51168); in checkout,
            beside it. */}
        {(() => {
          const immediate = !!quote.immediate;
          const pills = (
            <div className={styles.pills}>
              {immediate && (!quote.gold || paid) && (
                <TagPill
                  variant="success"
                  className={styles.tag}
                  label={content.immediateLabel}
                  tooltip={content.tips.immediate}
                  icon={<ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />}
                  onMouseEnter={() => bagRef.current?.startAnimation()}
                  onMouseLeave={() => bagRef.current?.stopAnimation()}
                />
              )}
              {quote.gold && (
                <TagPill
                  variant="secondary"
                  className={styles.tag}
                  label={content.poweredByLabel}
                  tooltip={content.tips.gold}
                  icon={<BadgeCheckIcon ref={eyeRef} size={12} color="var(--color-brand-secondary)" />}
                  onMouseEnter={() => eyeRef.current?.startAnimation()}
                  onMouseLeave={() => eyeRef.current?.stopAnimation()}
                />
              )}
            </div>
          );
          const heading = (
            <div className={styles.heading}>
              <h2 className={styles.title}>{content.title}</h2>
              {company && !compact && <p className={styles.company}>{company}</p>}
            </div>
          );
          return paid ? (
            <div className={styles.headStack}>
              {pills}
              {heading}
            </div>
          ) : (
            <div className={styles.head}>
              {heading}
              {pills}
            </div>
          );
        })()}
        <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} className={styles.rule} />

        <div className={styles.product}>
          <p className={styles.productName}>
            <span>{content.productLines[0]}</span>
            <span>{content.productLines[1]}</span>
          </p>
          {compact && productIcon}
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
          {/* A paid Gold Quote wears Excellent Quote in place of the info mark. */}
          {paid && quote.gold ? (
            <span className={styles.excellent}>
              <IndicatorBadge label={content.excellentLabel} tone="success" size="sm" />
            </span>
          ) : (
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" role="img" aria-label={content.insurerInfoLabel} className={styles.info} data-tooltip={content.tips.insurer.replace("{insurer}", quote.insurer)}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--color-info-fill)" strokeWidth="1" />
            <circle cx="8" cy="5.2" r="0.8" fill="var(--color-info-fill)" />
            <path d="M8 7.3v4" stroke="var(--color-info-fill)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          )}
        </div>

        {coverages && (
          <div className={styles.coverages}>
            <span className={styles.coveragesPill}>{coverages.label}</span>
            <hr className={styles.coveragesRule} />
            <ul className={styles.coverageList}>
              {coverages.items.map((c) => (
                <li key={c} className={styles.coverage}>
                  <SquareCheckbox tone="info" state="checked" size={10} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

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
              <dt>{saving ? content.priceLabel : content.totalLabel}</dt>
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
                {!paid && (
                  <div className={styles.row} data-final>
                    <dt>{content.totalLabel}</dt>
                    <dd>{formatInr(final)}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
          {paid && (
            <div className={styles.paid}>
              <p className={styles.paidAmount}>{paid.amount ?? formatInr(final)}</p>
              <p className={styles.paidLabel}>{paid.label}</p>
            </div>
          )}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </section>
        {beam && (
          <span className={styles.beamRing} aria-hidden>
            <span className={styles.beamSpin} />
          </span>
        )}
      </div>
    </div>
  );
}
