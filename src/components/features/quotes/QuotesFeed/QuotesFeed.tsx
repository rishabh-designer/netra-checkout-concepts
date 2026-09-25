"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuoteFlow } from "@/lib/quote-flow";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import type { QuoteCardData, QuoteRating, QuotesFeedContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { FeedControls } from "../FeedControls";
import { FeaturesDrawer, type QuoteTone } from "../FeaturesDrawer";
import { QuoteCard } from "../QuoteCard";
import { RevealCard } from "../RevealCard";
import styles from "./QuotesFeed.module.css";

export interface QuotesFeedProps {
  content: QuotesFeedContent;
  /** The resolved flow case — selects a per-case quote list + the ghost card. */
  caseId?: QuoteCaseId;
  /** The Sum Insured the user chose in the flow ("₹10 Cr") — shown on every
   *  card in place of the mock's value. Off-flow, the mock value stays. */
  sumInsured?: string;
  /** Case B: verification finished, so the Reveal button is live. */
  unlocked?: boolean;
  /** Case B: the Gold Quote has been revealed. */
  revealed?: boolean;
  onRevealed?: () => void;
}

/**
 * QuotesFeed — the middle column (Figma 564:32970). A fixed top (breadcrumb + count,
 * controls, ikkat rule) over a scroll area that holds the vertical quote stack
 * (480 wide). Only the scroll area moves. (The testimonial and risk report now
 * live in the Help Desk column.) Fuzzy (Case B) leads the stack with
 * a ghost "Reveal Quote" card; exact match (A) leads with the Gold Quote.
 * Usage: <QuotesFeed content={feed} caseId="B" sumInsured="₹10 Cr" />
 */
export function QuotesFeed({ content, caseId, sumInsured, unlocked = false, revealed = false, onRevealed }: QuotesFeedProps) {
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
  // Case B leads with a locked slot that reveals the Gold Quote once verified.
  const ghostFirst = caseId === "B";
  const base = (caseId && content.quotesByCase?.[caseId]) ?? content.quotes;
  const list = ghostFirst && revealed ? [content.goldQuote, ...base] : base;
  // Ratings ripple down the feed only at the moment of the reveal.
  const [ripple, setRipple] = useState(false);
  useEffect(() => {
    if (!revealed) setRipple(false);
  }, [revealed]);
  // With a Gold Quote in the feed, every quote is rated against it (Netra's
  // Gold covers everything the user needs): gold Excellent, immediate Good,
  // priced Average, offline Get Quote N/A.
  const hasGold = list.some((q) => q.gold);
  const rate = (q: QuoteCardData): QuoteRating =>
    q.gold ? "excellent" : q.immediate ? "good" : q.price ? "average" : "na";
  const rated = hasGold ? list.map((q) => ({ ...q, rating: rate(q) })) : list;
  const quotes = sumInsured ? rated.map((q) => ({ ...q, sumInsured })) : rated;
  const toneOf = (q: QuoteCardData): QuoteTone =>
    q.gold ? "gold" : q.immediate ? "immediate" : q.price ? "priced" : "quote";

  // "View All Features" drawer — remembers the card it opened from so the
  // footer mirrors it (and stays filled while the drawer slides out).
  const [featuresQuote, setFeaturesQuote] = useState<QuoteCardData | null>(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const closeFeatures = useCallback(() => setFeaturesOpen(false), []);

  // Immediate-purchase and priced quotes open checkout (the "additional
  // questions" drawer never applies in our flows). Gold / Get Quote stay put.
  const router = useRouter();
  const { setSelectedQuote, setCheckout } = useQuoteFlow();
  const checkoutFor = (q: QuoteCardData) =>
    q.price && !q.gold
      ? () => {
          setSelectedQuote(q);
          setCheckout({});
          router.push(content.checkoutHref);
        }
      : undefined;
  const [countBefore, countAfter = ""] = content.availableLabel.split("{count}");
  // For Case B the Gold card lives in the reveal slot; the rest follow it.
  const goldCard: QuoteCardData = { ...content.goldQuote, rating: "excellent", ...(sumInsured ? { sumInsured } : {}) };
  const rest = ghostFirst && revealed ? quotes.slice(1) : quotes;
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
        {/* Breadcrumb left, quote count right (601:65042) */}
        <div className={styles.crumbRow}>
          <BreadcrumbTrail items={content.breadcrumb} variant="slash" />
          <p className={styles.available}>
            {countBefore}
            <span className={styles.count}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quotes.length}
                  className={styles.countDigit}
                  initial={reduced ? { opacity: 0 } : { y: "100%", opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { y: "-100%", opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {quotes.length}
                </motion.span>
              </AnimatePresence>
            </span>
            {countAfter}
          </p>
        </div>
        <FeedControls
          filterLabel={content.filterLabel}
          sortLabel={content.sortLabel}
          switchLabel={content.switchLabel}
        />
        <IkkatDivider unit={23.8} height={4} className={styles.rule} />
      </div>

      {/* Scrolls: the quote stack */}
      <div className={styles.scroll}>
        <div className={styles.column}>
          <div className={styles.stack}>
            {ghostFirst && (
              <motion.div key="reveal-slot" className={styles.cell} {...reveal(0)}>
                <RevealCard
                  unlocked={unlocked}
                  revealed={revealed}
                  labels={{ reveal: content.revealQuoteLabel, lockedHint: content.revealLockedHint, readyHint: content.revealReadyHint }}
                  onRevealed={() => {
                    setRipple(true);
                    onRevealed?.();
                  }}
                >
                  <QuoteCard
                    quote={goldCard}
                    labels={labels}
                    onViewFeatures={() => {
                      setFeaturesQuote(goldCard);
                      setFeaturesOpen(true);
                    }}
                  />
                </RevealCard>
              </motion.div>
            )}
            {rest.map((quote, i) => (
              <motion.div
                key={`${quote.insurer}-${i}`}
                className={styles.cell}
                {...reveal(i + (ghostFirst ? 1 : 0))}
              >
                <QuoteCard
                  quote={quote}
                  labels={labels}
                  onViewFeatures={() => {
                    setFeaturesQuote(quote);
                    setFeaturesOpen(true);
                  }}
                  onSelect={checkoutFor(quote)}
                  ratingDelay={ripple ? 0.35 + i * 0.07 : undefined}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <FeaturesDrawer
        open={featuresOpen}
        onClose={closeFeatures}
        content={content.featuresDrawer}
        quote={featuresQuote}
        tone={featuresQuote ? toneOf(featuresQuote) : "quote"}
        labels={{ sumInsured: content.sumInsuredLabel, getQuote: content.getQuoteLabel }}
        onSelect={featuresQuote ? checkoutFor(featuresQuote) : undefined}
      />
    </div>
  );
}
