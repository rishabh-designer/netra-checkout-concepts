"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { QuotesPageContent } from "@/types/quotesPage";
import type { QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { QuoteModal } from "@/components/features/quote-modal/QuoteModal";
import { QuotesHeader } from "../QuotesHeader";
import { DetailsPanel } from "../DetailsPanel";
import type { UpgradeStage } from "../UpgradeBanner";
import { QuotesFeed } from "../QuotesFeed";
import { QuotesSkeleton } from "../QuotesSkeleton";
import { HelpDesk } from "../HelpDesk";
import styles from "./QuotesView.module.css";

export interface QuotesViewProps {
  content: QuotesPageContent;
  /** Modal content (steps/fields) so Edit Details can open the form in place. */
  quoteModal: QuoteModalContent;
}

/**
 * QuotesView — client shell for the Quotes page (Figma 564:32915): a pinned
 * header over a viewport-height 3-column body — Your Details | the quote feed |
 * Help Desk. The page never scrolls; only the feed's quote stack does. Reads the carried flow result so Your Details
 * shows live entries and the risk-report banner reflects the Yes/No answer; falls
 * back to the mock when visited off-flow. Edit Details opens the quote form as a
 * form-only lightbox on this page (no navigation) and saves back to the store.
 * Results "load" behind a staggered skeleton for LOAD_MS — on arrival and again
 * after every Edit Details save.
 * Usage: <QuotesView content={content} quoteModal={quoteModal} />
 */
/** How long the results skeleton shows before the quotes reveal. */
const LOAD_MS = 1500;

export function QuotesView(props: QuotesViewProps) {
  // Wait for the saved flow (restored before the first paint on a reload), so
  // state seeded from it (case, upgrade stage) starts from the real result.
  const { hydrated } = useQuoteFlow();
  return hydrated ? <QuotesScreen {...props} /> : null;
}

function QuotesScreen({ content, quoteModal }: QuotesViewProps) {
  const { result, setResult } = useQuoteFlow();
  const values = result?.values;
  const reportInterest = result?.reportInterest ?? values?.["reportInterest"] ?? "";
  const caseId = result?.caseId;
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // Bumped on each Edit Details save → re-runs the loading skeleton.
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  // Case B's Gold Quote unlocks after (simulated) verification and a reveal;
  // Case A arrives verified and revealed. Held here so an Edit Details reload
  // keeps it.
  const [upgradeStage, setUpgradeStage] = useState<UpgradeStage>(() => (caseId === "A" ? "upgraded" : "pending"));
  const [revealed, setRevealed] = useState(() => caseId === "A");

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(id);
  }, [loadKey]);

  const feedQuotes = (caseId && content.feed.quotesByCase?.[caseId]) ?? content.feed.quotes;
  const cardCount = feedQuotes.length + (caseId === "B" ? 1 : 0);

  return (
    <div className={styles.page}>
      <QuotesHeader content={content.header} />
      <main className={styles.body}>
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key="skeleton"
              className={styles.fill}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QuotesSkeleton
                cardCount={cardCount}
                collapsed={detailsCollapsed}
                rowCount={content.detailsPanel.rows.length}
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              className={styles.swap}
              data-collapsed={detailsCollapsed || undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <DetailsPanel
                content={content.detailsPanel}
                values={values}
                onEdit={() => setEditOpen(true)}
                collapsed={detailsCollapsed}
                onToggleCollapse={() => setDetailsCollapsed((v) => !v)}
                stage={upgradeStage}
                noRecords={caseId !== "A" && caseId !== "B"}
                onSimulate={() => setUpgradeStage("verifying")}
                onVerified={() => setUpgradeStage("upgraded")}
                onReset={
                  caseId === "A"
                    ? undefined
                    : () => {
                        setUpgradeStage("pending");
                        setRevealed(false);
                      }
                }
              />
              <QuotesFeed
                unlocked={upgradeStage === "upgraded"}
                revealed={revealed}
                onRevealed={() => setRevealed(true)}
                content={content.feed}
                caseId={caseId}
                sumInsured={values?.["coverage"] || undefined}
              />
              <HelpDesk
                content={content.feed.needHelp}
                testimonial={content.feed.testimonial}
                riskReport={content.feed.riskReport}
                reportInterest={reportInterest}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Details — the quote form only (no AI-search column), prefilled. */}
      <QuoteModal
        open={editOpen}
        formOnly
        content={quoteModal}
        caseId={caseId ?? "C"}
        companyName={result?.companyName ?? ""}
        initialValues={values}
        onClose={() => setEditOpen(false)}
        onComplete={(next) => {
          setResult({
            companyName: result?.companyName ?? "",
            caseId: caseId ?? "C",
            values: next,
            reportInterest: next["reportInterest"] ?? "",
          });
          setEditOpen(false);
          setLoadKey((k) => k + 1);
        }}
      />
    </div>
  );
}
