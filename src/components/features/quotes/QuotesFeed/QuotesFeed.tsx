"use client";

import { motion, useReducedMotion } from "motion/react";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import type { QuotesFeedContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { FeedHeader } from "../FeedHeader";
import { FeedControls } from "../FeedControls";
import { QuoteCard } from "../QuoteCard";
import { RiskReportBanner } from "../RiskReportBanner";
import { TestimonialCard } from "../TestimonialCard";
import styles from "./QuotesFeed.module.css";

export interface QuotesFeedProps {
  content: QuotesFeedContent;
  /** "Yes" | "No" | "" — drives the risk-report banner's sent state. */
  reportInterest?: string;
  /** When the details rail is collapsed, the grid widens to 4 columns. */
  collapsed?: boolean;
  /** The resolved flow case — selects a per-case quote list + the ghost card. */
  caseId?: QuoteCaseId;
  /** The Sum Insured the user chose in the flow ("₹10 Cr") — shown on every
   *  card in place of the mock's value. Off-flow, the mock value stays. */
  sumInsured?: string;
}

/**
 * QuotesFeed — the right column: header → ikkat rule → feed controls → the quote
 * grid → ikkat rule → the secondary stack (risk-report banner + testimonial).
 * Fuzzy (Case B) leads the grid with a ghost "Reveal Quote" card and uses its own
 * quote list. Usage: <QuotesFeed content={feed} reportInterest={interest} caseId="B" />
 */
export function QuotesFeed({ content, reportInterest, collapsed, caseId, sumInsured }: QuotesFeedProps) {
  const labels = {
    sumInsured: content.sumInsuredLabel,
    getQuote: content.getQuoteLabel,
    viewFeatures: content.viewFeaturesLabel,
    compare: content.compareLabel,
    comparisonUnavailable: content.comparisonUnavailableLabel,
    immediatePurchase: content.immediatePurchaseLabel,
    revealQuote: content.revealQuoteLabel,
  };

  const reduced = useReducedMotion();
  const ghostFirst = caseId === "B";
  // Cards rise in one after another as the results reveal (after the skeleton).
  const reveal = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.06 },
        };
  const quotes = (caseId && content.quotesByCase?.[caseId]) ?? content.quotes;

  return (
    <div className={styles.feed}>
      <FeedHeader content={content} />
      <IkkatDivider />
      <FeedControls
        filterLabel={content.filterLabel}
        sortLabel={content.sortLabel}
        switchLabel={content.switchLabel}
      />
      <div className={styles.grid} data-collapsed={collapsed || undefined}>
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
      <IkkatDivider />
      <div className={styles.secondary}>
        <RiskReportBanner content={content.riskReport} sent={reportInterest === "Yes"} />
        <TestimonialCard content={content.testimonial} />
      </div>
    </div>
  );
}
