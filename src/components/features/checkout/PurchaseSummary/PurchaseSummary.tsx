"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { CheckoutProgress, CheckoutSummaryContent } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { TagPill } from "@/components/ui/TagPill";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { formatInr, splitPrice } from "@/lib/checkout";
import { splitName } from "@/lib/utils";
import { HANDOFF } from "../handoff";
import styles from "./PurchaseSummary.module.css";

export interface PurchaseSummaryProps {
  content: CheckoutSummaryContent;
  quote: QuoteCardData;
  progress: CheckoutProgress;
  /** Where the bar stood on the step just left (null on arrival): the bar
   *  fills and the percent counts up from there. */
  from?: CheckoutProgress | null;
  cta: { label: string; enabled: boolean; onClick: () => void };
  /** Review only: the confirmation that unlocks the final CTA (613:69388). */
  consent?: { text: string; checked: boolean; onToggle: () => void };
}

/**
 * PurchaseSummary — the checkout's right column (Figma 484:26250 / 613:69256):
 * a progress bar with time left, then the summary card (Immediate Purchase tag,
 * dotted rule, product name + icon, insurer box, price split at 18% GST, the
 * optional Review consent) and the step CTA. Premium + GST always add up to the
 * card's price.
 * Usage: <PurchaseSummary content={summary} quote={q} progress={p} cta={{…}} />
 */
export function PurchaseSummary({ content, quote, progress, cta, consent, from = null }: PurchaseSummaryProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const reduced = useReducedMotion();
  // Count the percent and fill the bar from the previous step's value.
  const pct = useMotionValue(reduced ? progress.percent : (from?.percent ?? 0));
  const pctLabel = useTransform(pct, (v) => `${Math.round(v)}%`);
  const pctWidth = useTransform(pct, (v) => `${v}%`);
  useEffect(() => {
    const controls = animate(pct, progress.percent, {
      type: "tween",
      duration: reduced ? 0 : HANDOFF.bar,
      ease: HANDOFF.ease as unknown as [number, number, number, number],
      delay: reduced ? 0 : HANDOFF.begin,
    });
    return () => controls.stop();
  }, [pct, progress.percent, reduced]);
  const timeChanged = !reduced && !!from && from.timeLeft !== progress.timeLeft;
  const price = splitPrice(quote.price ?? "", content.gstRate);
  const [line1, line2] = splitName(quote.insurer);

  return (
    <div className={styles.column}>
      <div className={styles.progress}>
        <motion.span className={styles.percent}>{pctLabel}</motion.span>
        <span className={styles.track} role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
          <motion.span className={styles.fill} style={{ width: pctWidth }} />
        </span>
        <span className={styles.timeWrap}>
          <motion.span
            className={styles.time}
            initial={timeChanged ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "tween", duration: HANDOFF.time, ease: HANDOFF.ease as unknown as [number, number, number, number], delay: HANDOFF.land + 0.3 }}
          >
            {progress.timeLeft}
          </motion.span>
        </span>
      </div>

      <section className={styles.card}>
        <div className={styles.head}>
          <h2 className={styles.title}>{content.title}</h2>
          {quote.immediate && (
            <TagPill
              variant="success"
              className={styles.tag}
              label={content.immediateLabel}
              icon={<ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />}
              onMouseEnter={() => bagRef.current?.startAnimation()}
              onMouseLeave={() => bagRef.current?.stopAnimation()}
            />
          )}
        </div>
        <hr className={styles.dots} />

        <div className={styles.product}>
          <p className={styles.productName}>
            <span>{content.productLines[0]}</span>
            <span>{content.productLines[1]}</span>
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.productIconSrc} alt="" aria-hidden className={styles.productIcon} />
        </div>

        <div className={styles.insurer}>
          {/* The Gold Quote has no insurer logo yet: show just the name. */}
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
              <dd>{formatInr(price.premium)}</dd>
            </div>
            <div className={styles.row}>
              <dt>{content.gstLabel}</dt>
              <dd>{formatInr(price.gst)}</dd>
            </div>
            <div className={styles.row} data-total>
              <dt>{content.totalLabel}</dt>
              <dd>{formatInr(price.total)}</dd>
            </div>
          </dl>
        </div>

        {consent && (
          <label className={styles.consent}>
            <input type="checkbox" className={styles.check} checked={consent.checked} onChange={consent.onToggle} />
            <span>{consent.text}</span>
          </label>
        )}

        <button type="button" className={styles.cta} disabled={!cta.enabled} onClick={cta.onClick}>
          <span>{cta.label}</span>
          <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden className={styles.ctaArrow}>
            <path d="M3 9h12m-4.5-4.5L15 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.badgeSrc} alt="" aria-hidden className={styles.badge} />
    </div>
  );
}
