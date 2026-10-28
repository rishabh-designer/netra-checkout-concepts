"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CheckoutSummaryContent } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { Cross, Tick } from "@/components/features/quotes/RiskScore";
import { formatInr, splitPrice } from "@/lib/checkout";
import { splitName } from "@/lib/utils";
import { EASE_OUT as EASE } from "@/lib/motion";
import { IconButton } from "@/components/ui/IconButton";
import { Chevron } from "@/components/icons/Chevron";
import styles from "./PurchaseSummary.module.css";

export interface PurchaseSummaryProps {
  content: CheckoutSummaryContent;
  quote: QuoteCardData;
  /** Success page: the quote's coverages as ticked chips under a count pill.
   *  A scored quote lists its key lines instead: each a coverage (tick) or
   *  exclusion (cross), greyed where the quote doesn't meet it. */
  coverages?: {
    label: string;
    items: (string | { label: string; kind: "coverage" | "exclusion"; met: boolean })[];
  };
  /** Success page: the paid amount, large in green serif, over `label`
   *  ("Paid Successfully On …"); replaces the Final Cost row. `amount`
   *  overrides the figure (e.g. a count-up); `invoice` adds a small
   *  Download Invoice button beside the Price Details title. Paid, one
   *  chevron by the title opens the insurer, key features and price details
   *  together (Figma 854:25433 closed); `onToggle` / `onToggleHover` hear it. */
  paid?: { label: string; amount?: ReactNode; invoice?: { label: string; onClick: () => void; onHover?: () => void }; onToggleHover?: () => void; onToggle?: (open: boolean) => void };
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
  /** Success page: a separate card stacked under the summary (the
   *  Relationship Manager). */
  below?: ReactNode;
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
 * and the price split at 18% GST: Premium and GST, then the Total Cost
 * they add up to. The step CTA and any
 * consent live on the form side. On the success page it also lists the
 * quote's coverages and ends on the paid amount (`coverages`, `paid`).
 * Usage: <PurchaseSummary content={summary} quote={q} />
 */
export function PurchaseSummary({ content, quote, coverages, paid, company, beam = true, compact = false, footer, below }: PurchaseSummaryProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const base = splitPrice(quote.price ?? "", content.gstRate);
  const tone = quote.gold ? "gold" : quote.immediate ? "immediate" : "neutral";
  const [line1, line2] = splitName(quote.insurer);
  const productIcon = (
    <span className={styles.productIconCrop} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.productIconSrc} alt="" className={styles.productIcon} />
    </span>
  );

  // Once paid, one chevron opens the details (insurer, key features, price
  // breakdown) together; closed at first. The page hears which way it went.
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
    paid?.onToggle?.(!open);
  };
  const rows = (
    <dl className={styles.rows}>
      <div className={styles.row}>
        <dt>{content.premiumLabel}</dt>
        <dd>{formatInr(base.premium)}</dd>
      </div>
      <div className={styles.row}>
        <dt>{content.gstLabel}</dt>
        <dd>{formatInr(base.gst)}</dd>
      </div>
      <div className={styles.row} data-total>
        <dt>{content.totalLabel}</dt>
        <dd>{formatInr(base.total)}</dd>
      </div>
    </dl>
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
        {!compact && !paid && productIcon}
        {/* Pills: Immediate Purchase on anything bought online (the Gold Quote
            too, as any quote), beside the title in checkout. Once paid
            they're gone: the purchase is done. */}
        {(() => {
          const immediate = !!quote.immediate;
          const pills = (
            <div className={styles.pills}>
              {immediate && (
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
              <div className={styles.headRow}>
                {heading}
                {/* Closed points down; open turns it over to point up (like the journey timeline). */}
                <IconButton
                  size="sm"
                  label={open ? content.detailsHideLabel : content.detailsShowLabel}
                  open={open}
                  aria-expanded={open}
                  onClick={toggle}
                  onMouseEnter={paid.onToggleHover}
                >
                  <Chevron dir="down" size={12} />
                </IconButton>
              </div>
            </div>
          ) : (
            <div className={styles.head}>
              {heading}
              {pills}
            </div>
          );
        })()}
        {!paid && <IkkatDivider height={2} unit={19} color={RULE_COLOR[tone]} className={styles.rule} />}

        {/* Paid (854:25597): the mark sits on a hairline along the row's foot. */}
        <div className={styles.product} data-paid={paid ? true : undefined}>
          <p className={styles.productName}>
            <span>{content.productLines[0]}</span>
            <span>{content.productLines[1]}</span>
          </p>
          {(compact || paid) && productIcon}
        </div>

        {paid ? (
          <>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="details"
                  className={styles.detailsFold}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className={styles.details}>
              {/* Paid (670:53306): the name left, then the rule and the logo right. */}
              <div className={styles.insurer} data-paid={paid ? true : undefined}>
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
                {/* A paid quote drops the info mark. */}
                {paid ? null : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" role="img" aria-label={content.insurerInfoLabel} className={styles.info} data-tooltip={content.tips.insurer.replace("{insurer}", quote.insurer)}>
                  <circle cx="8" cy="8" r="6.5" stroke="var(--color-info-fill)" strokeWidth="1" />
                  <circle cx="8" cy="5.2" r="0.8" fill="var(--color-info-fill)" />
                  <path d="M8 7.3v4" stroke="var(--color-info-fill)" strokeWidth="1" strokeLinecap="round" />
                </svg>
                )}
              </div>

              {coverages && (
                <div className={styles.coverages} data-tone={quote.gold ? "gold" : undefined}>
                  <div className={styles.coveragesHead}>
                    <span className={styles.coveragesPill}>{coverages.label}</span>
                  </div>
                  <hr className={styles.coveragesRule} />
                  <ul className={styles.coverageList}>
                    {coverages.items.map((c) =>
                      typeof c === "string" ? (
                        <li key={c} className={styles.coverage}>
                          <SquareCheckbox tone={quote.gold ? "secondary" : "info"} state="checked" size={10} />
                          {c}
                        </li>
                      ) : (
                        <li key={`${c.kind}-${c.label}`} className={styles.coverage}>
                          {c.kind === "coverage" ? <Tick size={10} muted={!c.met} /> : <Cross size={10} muted={!c.met} />}
                          {c.label}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
              <div className={styles.prices}>
                <div className={styles.priceHead}>
                  <p className={styles.priceTitle}>{content.priceTitle}</p>
                  {paid.invoice && (
                    <button type="button" className={styles.invoice} onClick={paid.invoice.onClick} onMouseEnter={paid.invoice.onHover}>
                      {paid.invoice.label}
                    </button>
                  )}
                </div>
                {rows}
              </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* The paid amount over its date (854:25433). */}
            <div className={styles.paid}>
              <div className={styles.paidTotal}>
                <p className={styles.paidAmount}>{paid.amount ?? formatInr(base.total)}</p>
                <p className={styles.paidLabel}>{paid.label}</p>
              </div>
            </div>
          </>
        ) : (
          <>
        {/* Paid (670:53306): the name left, then the rule and the logo right. */}
        <div className={styles.insurer} data-paid={paid ? true : undefined}>
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
          {/* A paid quote drops the info mark. */}
          {paid ? null : (
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" role="img" aria-label={content.insurerInfoLabel} className={styles.info} data-tooltip={content.tips.insurer.replace("{insurer}", quote.insurer)}>
            <circle cx="8" cy="8" r="6.5" stroke="var(--color-info-fill)" strokeWidth="1" />
            <circle cx="8" cy="5.2" r="0.8" fill="var(--color-info-fill)" />
            <path d="M8 7.3v4" stroke="var(--color-info-fill)" strokeWidth="1" strokeLinecap="round" />
          </svg>
          )}
        </div>

        {coverages && (
          <div className={styles.coverages} data-tone={quote.gold ? "gold" : undefined}>
            <div className={styles.coveragesHead}>
              <span className={styles.coveragesPill}>{coverages.label}</span>
            </div>
            <hr className={styles.coveragesRule} />
            <ul className={styles.coverageList}>
              {coverages.items.map((c) =>
                typeof c === "string" ? (
                  <li key={c} className={styles.coverage}>
                    <SquareCheckbox tone={quote.gold ? "secondary" : "info"} state="checked" size={10} />
                    {c}
                  </li>
                ) : (
                  <li key={`${c.kind}-${c.label}`} className={styles.coverage}>
                    {c.kind === "coverage" ? <Tick size={10} muted={!c.met} /> : <Cross size={10} muted={!c.met} />}
                    {c.label}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
        <div className={styles.prices}>
          <p className={styles.priceTitle}>{content.priceTitle}</p>
          {rows}
        </div>
          </>
        )}
        {footer && <div className={styles.footer}>{footer}</div>}
      </section>
        {beam && (
          <span className={styles.beamRing} aria-hidden>
            <span className={styles.beamSpin} />
          </span>
        )}
      </div>
      {below && <div className={styles.below}>{below}</div>}
    </div>
  );
}
