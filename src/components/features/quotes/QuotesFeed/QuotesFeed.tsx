import { IkkatDivider } from "@/components/ui/IkkatDivider";
import type { QuoteCardData, QuotesFeedContent } from "@/types/quotesPage";
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
  /** The resolved flow case — selects a per-case quote list + interleave. */
  caseId?: QuoteCaseId;
}

/**
 * QuotesFeed — the right column: header → ikkat rule → feed controls → the quote
 * grid → ikkat rule → the secondary stack (risk-report banner + testimonial).
 * Fuzzy (Case B) leads the grid with a ghost "Reveal Quote" card, uses its own
 * quote list, and interleaves the secondary stack mid-grid (secondaryAfterByCase).
 * Usage: <QuotesFeed content={feed} reportInterest={interest} caseId="B" />
 */
export function QuotesFeed({ content, reportInterest, collapsed, caseId }: QuotesFeedProps) {
  const labels = {
    sumInsured: content.sumInsuredLabel,
    getQuote: content.getQuoteLabel,
    viewFeatures: content.viewFeaturesLabel,
    compare: content.compareLabel,
    comparisonUnavailable: content.comparisonUnavailableLabel,
    immediatePurchase: content.immediatePurchaseLabel,
    revealQuote: content.revealQuoteLabel,
  };

  const ghostFirst = caseId === "B";
  const quotes = (caseId && content.quotesByCase?.[caseId]) ?? content.quotes;
  const splitAfter = caseId ? content.secondaryAfterByCase?.[caseId] : undefined;

  const renderCards = (list: QuoteCardData[], offset: number, withGhost: boolean) => (
    <div className={styles.grid} data-collapsed={collapsed || undefined}>
      {withGhost && (
        <QuoteCard key="ghost" quote={{ insurer: "", logoSrc: "", sumInsured: "", ghost: true }} labels={labels} />
      )}
      {list.map((quote, i) => (
        <QuoteCard key={`${quote.insurer}-${offset + i}`} quote={quote} labels={labels} />
      ))}
    </div>
  );

  const secondary = (
    <div className={styles.secondary}>
      <RiskReportBanner content={content.riskReport} sent={reportInterest === "Yes"} />
      <TestimonialCard content={content.testimonial} />
    </div>
  );

  const interleaved = typeof splitAfter === "number";

  return (
    <div className={styles.feed}>
      <FeedHeader content={content} />
      <IkkatDivider />
      <FeedControls
        filterLabel={content.filterLabel}
        sortLabel={content.sortLabel}
        switchLabel={content.switchLabel}
      />
      {interleaved ? (
        <>
          {renderCards(quotes.slice(0, splitAfter), 0, ghostFirst)}
          <IkkatDivider />
          {secondary}
          {renderCards(quotes.slice(splitAfter), splitAfter, false)}
        </>
      ) : (
        <>
          {renderCards(quotes, 0, ghostFirst)}
          <IkkatDivider />
          {secondary}
        </>
      )}
    </div>
  );
}
