"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { GOLD_DETAILS_KEY, useQuoteFlow } from "@/lib/quote-flow";
import { resetCheckoutClock } from "@/components/features/checkout/useCheckoutClock";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import type { QuoteCardData, QuoteFilter, QuoteRating, QuoteSort, QuotesFeedContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { FeedControls } from "../FeedControls";
import { FeaturesModal, type QuoteTone } from "../FeaturesModal";
import { AdditionalDetailsDrawer, GoldGateModal } from "../GoldGate";
import { QuoteCard, type QuoteCardView } from "../QuoteCard";
import { NeedHelpCard } from "../HelpDesk";
import { RevealCard } from "../RevealCard";
import type { PriceIntro } from "../PriceMorph";
import styles from "./QuotesFeed.module.css";

export interface QuotesFeedProps {
  content: QuotesFeedContent;
  /** The resolved flow case — selects a per-case quote list + the ghost card. */
  caseId?: QuoteCaseId;
  /** The Sum Insured the user chose in the flow ("₹10 Cr") — shown on every
   *  card in place of the mock's value. Off-flow, the mock value stays. */
  sumInsured?: string;
  /** Cases A and B: verification finished, so the Reveal button is live. */
  unlocked?: boolean;
  /** Cases A and B: the Gold Quote has been revealed. */
  revealed?: boolean;
  onRevealed?: () => void;
}

/* The grid picks its column count from the feed's width: one up, until two
   cards fit side by side, then up to three (Figma 658:45979: 346-wide cards,
   24 apart). QuotesSkeleton mirrors these breakpoints in CSS (664 / 1008px)
   - keep them in step. */
const MIN_COMPACT = 320;
const GRID_GAP = 24;
const MAX_COLS = 3;
/* The gated Gold Quote (Case B) remembers its Additional Details for the run. */
const readGoldDetails = () => {
  try {
    return window.sessionStorage.getItem(GOLD_DETAILS_KEY) !== null;
  } catch {
    return false;
  }
};

const columnsFor = (width: number) =>
  Math.max(1, Math.min(MAX_COLS, Math.floor((width + GRID_GAP) / (MIN_COMPACT + GRID_GAP))));


const priceOf = (q: QuoteCardData) => (q.price ? Number(q.price.replace(/\D/g, "")) : Infinity);

/** Filter + sort the non-gold quotes (the Gold Quote stays pinned on top).
 *  Price-on-request quotes always sink below priced ones in a premium sort. */
function arrange(list: QuoteCardData[], filter: QuoteFilter, sort: QuoteSort, immediateOnly: boolean) {
  const kept = list.filter(
    (q) =>
      (!immediateOnly || q.immediate) &&
      (filter === "all" || (filter === "priced" ? !!q.price : !q.price)),
  );
  if (sort === "default") return kept;
  const bySort = (a: QuoteCardData, b: QuoteCardData) => {
    if (sort === "coverage") return (b.coverages?.length ?? 0) - (a.coverages?.length ?? 0) || priceOf(a) - priceOf(b);
    const pa = priceOf(a);
    const pb = priceOf(b);
    if (pa === Infinity || pb === Infinity) return pa === pb ? 0 : pa === Infinity ? 1 : -1;
    return sort === "priceLow" ? pa - pb : pb - pa;
  };
  return [...kept].sort(bySort);
}

/**
 * QuotesFeed — the middle column (Figma 564:32970). A fixed top (breadcrumb + count,
 * controls, ikkat rule) over a scroll area that holds the vertical quote stack
 * (480 wide). Only the scroll area moves. (The testimonial and risk report now
 * live in the Help Desk column.) Matched cases (A and B) lead the stack with
 * a ghost "Reveal Quote" card that the customer opens to unveil their Gold
 * Quote. Filtering, sorting and "Immediate Purchase Only" rearrange the
 * rest; the reveal slot stays pinned first.
 * Usage: <QuotesFeed content={feed} caseId="B" sumInsured="₹10 Cr" />
 */
export function QuotesFeed({ content, caseId, sumInsured, unlocked = false, revealed = false, onRevealed }: QuotesFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);
  useLayoutEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setCols(columnsFor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const labels = {
    sumInsured: content.sumInsuredLabel,
    getQuote: content.getQuoteLabel,
    compare: content.compareLabel,
    comparisonUnavailable: content.comparisonUnavailableLabel,
    immediatePurchase: content.immediatePurchaseLabel,
    poweredBy: content.poweredByLabel,
    topCoverages: content.topCoveragesLabel,
    coverageCount: content.coverageCountLabel,
    personalizedCount: content.personalizedCountLabel,
    viewFeatures: content.viewFeaturesLabel,
    coveragesUnavailable: content.coveragesUnavailableLabel,
    ratings: content.ratingLabels,
  };
  // Card view: the current card, or the previous Top Coverages card
  // (LIVE QUOTES in the breadcrumb swaps them).
  const [cardView, setCardView] = useState<QuoteCardView>("compact");

  const reduced = useReducedMotion();
  // Cases A and B both lead with the Reveal slot: the customer unveils their
  // own Gold Quote (A's unlocks moments after load, B's once verified).
  const ghostFirst = caseId === "A" || caseId === "B";
  // Case B's Gold Quote is gated: unpriced until the Additional Details are in.
  const gate = caseId ? content.goldGateByCase?.[caseId] : undefined;
  const [goldDetailsIn, setGoldDetailsIn] = useState(readGoldDetails);
  const [gateStep, setGateStep] = useState<"modal" | "drawer" | null>(null);
  const closeGate = useCallback(() => setGateStep(null), []);
  const gold = (caseId && content.goldQuoteByCase?.[caseId]) ?? content.goldQuote;
  const base = (caseId && content.quotesByCase?.[caseId]) ?? content.quotes;
  const list = ghostFirst && revealed ? [gold, ...base] : base;
  // The revealed Gold Quote's price strikes down once the card lands.
  const [revealIntro, setRevealIntro] = useState<PriceIntro>(() => (revealed ? "done" : "idle"));
  useEffect(() => {
    if (revealed) return;
    setRevealIntro("idle");
  }, [revealed]);
  // Top Coverages view: with a Gold Quote in the feed, every quote is rated
  // against it — gold Excellent, immediate Good, priced Average, offline N/A.
  const hasGold = list.some((q) => q.gold);
  const rate = (q: QuoteCardData): QuoteRating =>
    q.gold ? "excellent" : q.immediate ? "good" : q.price ? "average" : "na";
  const rated = hasGold ? list.map((q) => ({ ...q, rating: rate(q) })) : list;
  const quotes = sumInsured ? rated.map((q) => ({ ...q, sumInsured })) : rated;
  const toneOf = (q: QuoteCardData): QuoteTone =>
    q.gold ? "gold" : q.immediate ? "immediate" : q.price ? "priced" : "quote";

  // Policy details modal — remembers the card it opened from so it mirrors
  // it (and stays filled while the modal fades out).
  const [featuresQuote, setFeaturesQuote] = useState<QuoteCardData | null>(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const closeFeatures = useCallback(() => setFeaturesOpen(false), []);

  // Any priced quote opens checkout (the "additional questions" drawer never
  // applies in our flows), including Case A's priced Gold. Get Quote stays put.
  const router = useRouter();
  const { setSelectedQuote, setCheckout } = useQuoteFlow();
  const checkoutFor = (q: QuoteCardData) =>
    q.price
      ? () => {
          setSelectedQuote(q);
          setCheckout({});
          resetCheckoutClock();
          router.push(content.checkoutHref);
        }
      : undefined;
  // The Gold Quote's button: the gate (or, once the details are in, the Gold
  // Inquiry page) for a gated case; else checkout.
  const selectGold = (q: QuoteCardData) =>
    !gate
      ? checkoutFor(q)
      : goldDetailsIn
        ? () => router.push(gate.inquiryHref)
        : () => {
            setFeaturesOpen(false);
            setGateStep("modal");
          };
  const proceedWithGold = (values: Record<string, string>) => {
    try {
      window.sessionStorage.setItem(GOLD_DETAILS_KEY, JSON.stringify(values));
    } catch {}
    setGoldDetailsIn(true);
    router.push(gate!.inquiryHref);
  };
  const [countBefore, countAfter = ""] = content.availableLabel.split("{count}");
  // The Gold card lives in the reveal slot; the rest follow it.
  const goldCard: QuoteCardData = { ...gold, rating: "excellent", ...(sumInsured ? { sumInsured } : {}) };
  const rest = ghostFirst && revealed ? quotes.slice(1) : quotes;
  const [filter, setFilter] = useState<QuoteFilter>("all");
  const [sort, setSort] = useState<QuoteSort>("default");
  const [immediateOnly, setImmediateOnly] = useState(false);
  const pinned = rest.filter((q) => q.gold);
  const arranged = arrange(rest.filter((q) => !q.gold), filter, sort, immediateOnly);
  const shown = [...pinned, ...arranged];
  const shownCount = shown.length + (ghostFirst && revealed ? 1 : 0);
  const resetFilters = () => {
    setFilter("all");
    setImmediateOnly(false);
  };
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
    <div ref={feedRef} className={styles.feed} style={{ "--cols": cols } as CSSProperties}>
      {/* Top section (658:45850): breadcrumb over the titled count, the Need
          Help card on the right, and a full-width ikkat rule. */}
      <div className={styles.top}>
        <div className={styles.topRow}>
          <div className={styles.heading}>
            <BreadcrumbTrail
              items={content.breadcrumb}
              variant="slash"
              onCurrentClick={() => setCardView((v) => (v === "compact" ? "features" : "compact"))}
              currentPressed={cardView === "features"}
            />
            <h1 className={styles.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.titleIconSrc} alt="" aria-hidden className={styles.titleIcon} />
              <span>
                {countBefore}
                <span className={styles.count}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={shownCount}
                      className={styles.countDigit}
                      initial={reduced ? { opacity: 0 } : { y: "100%", opacity: 0, filter: "blur(4px)" }}
                      animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                      exit={reduced ? { opacity: 0 } : { y: "-100%", opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {shownCount}
                    </motion.span>
                  </AnimatePresence>
                </span>
                {countAfter}
              </span>
            </h1>
          </div>
          <NeedHelpCard content={content.needHelp} />
        </div>
        <IkkatDivider unit={23.8} height={4} className={styles.rule} />
      </div>

      {/* Controls over the grid, 32 apart (658:45875). */}
      <div className={styles.results}>
        <FeedControls
          filterFieldLabel={content.filterFieldLabel}
          sortFieldLabel={content.sortFieldLabel}
          filterLabel={content.filterLabel}
          filterOptions={content.filterOptions}
          filter={filter}
          onFilterChange={setFilter}
          sortLabel={content.sortLabel}
          sortOptions={content.sortOptions}
          sort={sort}
          onSortChange={setSort}
          switchLabel={content.switchLabel}
          immediateOnly={immediateOnly}
          onImmediateOnlyChange={setImmediateOnly}
        />

          <div className={styles.stack}>
            {ghostFirst && (
              <motion.div key="reveal-slot" className={styles.cell} {...reveal(0)}>
                <RevealCard
                  unlocked={unlocked}
                  revealed={revealed}
                  labels={{ reveal: content.revealQuoteLabel, lockedHint: content.revealLockedHint, readyHint: content.revealReadyHint }}
                  onRevealed={() => onRevealed?.()}
                  // The price strikes down once the card sits still, so the
                  // morph never restarts when the reveal layer hands over.
                  onSettled={() => setRevealIntro("play")}
                >
                  <QuoteCard
                    view={cardView}
                    quote={goldCard}
                    labels={labels}
                    onViewFeatures={() => {
                      setFeaturesQuote(goldCard);
                      setFeaturesOpen(true);
                    }}
                    onSelect={revealed ? selectGold(goldCard) : undefined}
                    priceIntro={revealIntro}
                  />
                </RevealCard>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((quote, i) => {
              const card = (
                <QuoteCard
                  view={cardView}
                  quote={quote}
                  labels={labels}
                  onViewFeatures={() => {
                    setFeaturesQuote(quote);
                    setFeaturesOpen(true);
                  }}
                  onSelect={checkoutFor(quote)}
                />
              );
              // Keyed by insurer so a re-sort slides cards to their new slots.
              return (
                <motion.div
                  key={quote.insurer}
                  layout="position"
                  className={styles.cell}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                  {...reveal(i + (ghostFirst ? 1 : 0))}
                >
                  {card}
                </motion.div>
              );
            })}
            </AnimatePresence>
            {arranged.length === 0 && (
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>{content.noResults.title}</p>
                <p className={styles.emptyBody}>{content.noResults.body}</p>
                <button type="button" className={styles.emptyReset} onClick={resetFilters}>
                  {content.noResults.resetLabel}
                </button>
              </div>
            )}
          </div>
      </div>

      <FeaturesModal
        open={featuresOpen}
        onClose={closeFeatures}
        content={content.featuresDrawer}
        quote={featuresQuote}
        tone={featuresQuote ? toneOf(featuresQuote) : "quote"}
        labels={labels}
        onSelect={featuresQuote ? (featuresQuote.gold ? selectGold(goldCard) : checkoutFor(featuresQuote)) : undefined}
      />

      {gate && (
        <>
          <GoldGateModal
            open={gateStep === "modal"}
            content={gate.modal}
            onClose={closeGate}
            // A call instead of the form: the inquiry page shows the
            // Additional Details as Missing.
            onCall={() => router.push(gate.inquiryHref)}
            onOnline={() => setGateStep("drawer")}
          />
          <AdditionalDetailsDrawer open={gateStep === "drawer"} content={gate.drawer} onClose={closeGate} onProceed={proceedWithGold} />
        </>
      )}
    </div>
  );
}
