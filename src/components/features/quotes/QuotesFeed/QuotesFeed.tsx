"use client";

import { motion, useReducedMotion } from "motion/react";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import type { QuoteCardData, QuoteRating, QuotesFeedContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { FeedControls } from "../FeedControls";
import { QuoteCard } from "../QuoteCard";
import { RiskReportBanner } from "../RiskReportBanner";
import { TestimonialCard } from "../TestimonialCard";
import styles from "./QuotesFeed.module.css";

export interface QuotesFeedProps {
  content: QuotesFeedContent;
  /** "Yes" | "No" | "" — drives the risk-report banner's sent state. */
  reportInterest?: string;
  /** The resolved flow case — selects a per-case quote list + the ghost card. */
  caseId?: QuoteCaseId;
  /** The Sum Insured the user chose in the flow ("₹10 Cr") — shown on every
   *  card in place of the mock's value. Off-flow, the mock value stays. */
  sumInsured?: string;
}

/**
 * QuotesFeed — the middle column (Figma 564:32970). A fixed top (breadcrumb,
 * controls, ikkat rule) over a scroll area that holds the vertical quote stack
 * (480 wide), an ikkat rule, and the misc stack (risk-report banner +
 * testimonial). Only the scroll area moves. Fuzzy (Case B) leads the stack with
 * a ghost "Reveal Quote" card; exact match (A) leads with the Gold Quote.
 * Usage: <QuotesFeed content={feed} reportInterest={interest} caseId="B" />
 */
export function QuotesFeed({ content, reportInterest, caseId, sumInsured }: QuotesFeedProps) {
  const labels = {
    sumInsured: content.sumInsuredLabel,
    getQuote: content.getQuoteLabel,
    viewFeatures: content.viewFeaturesLabel,
    compare: content.compareLabel,
    comparisonUnavailable: content.comparisonUnavailableLabel,
    immediatePurchase: content.immediatePurchaseLabel,
    revealQuote: content.revealQuoteLabel,
    topCoverages: content.topCoveragesLabel,
    poweredBy: content.poweredByLabel,
    ratings: content.ratingLabels,
  };

  const reduced = useReducedMotion();
  const ghostFirst = caseId === "B";
  const list = (caseId && content.quotesByCase?.[caseId]) ?? content.quotes;
  // With a Gold Quote in the feed, every quote is rated against it (Netra's
  // Gold covers everything the user needs): gold Excellent, immediate Good,
  // priced Average, offline Get Quote N/A.
  const hasGold = list.some((q) => q.gold);
  const rate = (q: QuoteCardData): QuoteRating =>
    q.gold ? "excellent" : q.immediate ? "good" : q.price ? "average" : "na";
  const quotes = hasGold ? list.map((q) => ({ ...q, rating: rate(q) })) : list;
  // Cards rise in one after another as the results reveal (after the skeleton).
  const reveal = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.06 },
        };

  return (
    <div className={styles.feed}>
      {/* Fixed top */}
      <div className={styles.top}>
        <BreadcrumbTrail items={content.breadcrumb} variant="slash" />
        <FeedControls
          filterLabel={content.filterLabel}
          sortLabel={content.sortLabel}
          switchLabel={content.switchLabel}
        />
        <IkkatDivider unit={23.8} height={4} className={styles.rule} />
      </div>

      {/* Scrolls: quote stack → rule → misc stack */}
      <div className={styles.scroll}>
        <div className={styles.column}>
          <div className={styles.stack}>
            {ghostFirst && (
              <motion.div key="ghost" className={styles.cell} {...reveal(0)}>
                <QuoteCard quote={{ insurer: "", logoSrc: "", sumInsured: "", ghost: true }} labels={labels} />
              </motion.div>
            )}
            {quotes.map((quote, i) => (
              <motion.div
                key={`${quote.insurer}-${i}`}
                className={styles.cell}
                {...reveal(i + (ghostFirst ? 1 : 0))}
              >
                <QuoteCard quote={sumInsured ? { ...quote, sumInsured } : quote} labels={labels} />
              </motion.div>
            ))}
          </div>
          <IkkatDivider unit={16.5} height={4} className={styles.stackRule} />
          <div className={styles.misc}>
            <RiskReportBanner content={content.riskReport} sent={reportInterest === "Yes"} />
            <TestimonialCard content={content.testimonial} />
          </div>
        </div>
      </div>
    </div>
  );
}
