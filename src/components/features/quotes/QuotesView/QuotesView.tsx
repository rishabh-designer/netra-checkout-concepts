"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { QuotesPageContent } from "@/types/quotesPage";
import type { QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { useDemoNotice } from "@/lib/demo-notice";
import { QuoteModal } from "@/components/features/quote-modal/QuoteModal";
import { QuotesHeader } from "../QuotesHeader";
import { DetailsPanel } from "../DetailsPanel";
import type { UpgradeStage } from "../UpgradeBanner";
import { QuotesFeed } from "../QuotesFeed";
import { QuotesSkeleton } from "../QuotesSkeleton";
import styles from "./QuotesView.module.css";

export interface QuotesViewProps {
  content: QuotesPageContent;
  /** Modal content (steps/fields) so Edit Details can open the form in place. */
  quoteModal: QuoteModalContent;
}

/**
 * QuotesView — client shell for the Quotes page (Figma 658:40879): a pinned
 * header ("Chat with Us") over a viewport-height 2-column body — Your
 * Details | the quote feed (Need Help lives in its top section). The page and
 * sidebar never scroll; only the feed does. Reads the carried flow result so
 * Your Details shows live entries; falls
 * back to the mock when visited off-flow. Edit Details opens the quote form as a
 * form-only lightbox on this page (no navigation) and saves back to the store.
 * Results "load" behind a staggered skeleton for LOAD_MS — on arrival and again
 * after every Edit Details save.
 * Usage: <QuotesView content={content} quoteModal={quoteModal} />
 */
/** How long the results skeleton shows before the quotes reveal. */
const LOAD_MS = 1500;
/* Cases A and B: the banner picks the verification count up from here on arrival. */
const VERIFY_FROM = 89;

export function QuotesView(props: QuotesViewProps) {
  // Wait for the saved flow (restored before the first paint on a reload), so
  // state seeded from it (case, upgrade stage) starts from the real result.
  const { hydrated } = useQuoteFlow();
  return hydrated ? <QuotesScreen {...props} /> : null;
}

function QuotesScreen({ content, quoteModal }: QuotesViewProps) {
  const { result, setResult } = useQuoteFlow();
  const notify = useDemoNotice();
  const values = result?.values;
  const caseId = result?.caseId;
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // Bumped on each Edit Details save → re-runs the loading skeleton.
  const [loadKey, setLoadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  // The Gold Quote waits behind the Reveal slot for the customer to open.
  // Cases A and B arrive nearly verified, so the banner finishes the count
  // from 89% as the page loads and the slot turns live. Held here so an
  // Edit Details reload keeps it.
  const lured = caseId === "A" || caseId === "B";
  const [upgradeStage, setUpgradeStage] = useState<UpgradeStage>(() => (lured ? "verifying" : "pending"));
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(id);
  }, [loadKey]);

  const feedQuotes = (caseId && content.feed.quotesByCase?.[caseId]) ?? content.feed.quotes;
  const cardCount = feedQuotes.length + (caseId === "A" || caseId === "B" ? 1 : 0);

  return (
    <div className={styles.page}>
      {/* Header CTA: Chat with Us, the sparkle after the label (in white). */}
      <QuotesHeader
        content={content.header}
        icon={<span className={styles.sparkle} style={{ "--icon": `url(${content.feed.needHelp.chatIconSrc})` } as CSSProperties} aria-hidden />}
        iconAfter
        tone="secondary"
        onCta={() => notify("askBimaNetra")}
      />
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
                companyName={result?.companyName || undefined}
                verifyFrom={lured ? VERIFY_FROM : undefined}
                onSimulate={() => setUpgradeStage("verifying")}
                onVerified={() => setUpgradeStage("upgraded")}
                onReset={
                  lured
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
