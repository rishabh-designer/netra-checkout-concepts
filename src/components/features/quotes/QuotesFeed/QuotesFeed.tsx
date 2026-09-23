import { IkkatDivider } from "@/components/ui/IkkatDivider";
import type { QuotesFeedContent } from "@/types/quotesPage";
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
  /** Fuzzy match (Case B) → prepend a locked "ghost" card with "Reveal Quote". */
  ghostFirst?: boolean;
}

/**
 * QuotesFeed — the right column: header → ikkat rule → feed controls → the quote
 * grid → ikkat rule → the secondary stack (risk-report banner + testimonial).
 * On a fuzzy match, a ghost "Reveal Quote" card leads the grid.
 * Usage: <QuotesFeed content={feed} reportInterest={interest} collapsed={bool} />
 */
export function QuotesFeed({ content, reportInterest, collapsed, ghostFirst }: QuotesFeedProps) {
  const labels = {
    sumInsured: content.sumInsuredLabel,
    getQuote: content.getQuoteLabel,
    viewFeatures: content.viewFeaturesLabel,
    compare: content.compareLabel,
    comparisonUnavailable: content.comparisonUnavailableLabel,
    immediatePurchase: content.immediatePurchaseLabel,
    revealQuote: content.revealQuoteLabel,
  };
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
          <QuoteCard key="ghost" quote={{ insurer: "", logoSrc: "", sumInsured: "", ghost: true }} labels={labels} />
        )}
        {content.quotes.map((quote, i) => (
          <QuoteCard key={`${quote.insurer}-${i}`} quote={quote} labels={labels} />
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
