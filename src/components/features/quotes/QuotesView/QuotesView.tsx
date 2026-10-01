"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { QuotesChat } from "../QuotesChat";
import type { QuotesChatContext } from "@/lib/quotes-chat";
import { priceFeed } from "@/lib/pricing";
import styles from "./QuotesView.module.css";
import { EASE_STD } from "@/lib/motion";
import { isAtMost, useAtMost } from "@/lib/media";
import { SideDrawer } from "@/components/ui/SideDrawer";

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
  const values = result?.values;
  // Every price on the page follows this business's cover and turnover: the
  // flow's answers, else the Your Details defaults (off-flow), so the prices
  // always match the Sum Insured the cards show.
  const detail = (key: string) =>
    values?.[key]?.trim() || content.detailsPanel.rows.find((r) => r.key === key)?.value;
  const sumInsured = detail("coverage");
  const feed = useMemo(
    () => priceFeed(content.feed, { sumInsured, turnover: detail("turnover") }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.feed, values],
  );
  const caseId = result?.caseId;
  // Mobile (the stacked page, ≤1100px): Your Details starts folded shut. Read
  // up front (this screen is client-only), so neither the skeleton nor the
  // panel paints open first.
  const [detailsCollapsed, setDetailsCollapsed] = useState(() => {
    try {
      return isAtMost("stack");
    } catch {
      return false;
    }
  });
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
  const [chatOpen, setChatOpen] = useState(false);
  // Below the two-column width the chat is a drawer, not a column.
  const stacked = useAtMost("stack");
  // The chat mounts once, in idle time after the quotes land (so the first
  // open costs nothing), and stays mounted: its history survives a close.
  const [chatUsed, setChatUsed] = useState(false);
  // While the compare view is open the header CTA mails the quotes instead.
  const [comparing, setComparing] = useState(false);
  const notify = useDemoNotice();
  // Opening the chat folds Your Details to its rail so the feed keeps its
  // width; closing restores whatever the customer had.
  const [collapsedBeforeChat, setCollapsedBeforeChat] = useState(false);
  const toggleChat = () => {
    if (chatOpen) {
      setChatOpen(false);
      setDetailsCollapsed(collapsedBeforeChat);
    } else {
      setCollapsedBeforeChat(detailsCollapsed);
      setDetailsCollapsed(true);
      setChatUsed(true);
      setChatOpen(true);
    }
  };

  useEffect(() => {
    if (loading || chatUsed) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setChatUsed(true));
    return () => cancel(id);
  }, [loading, chatUsed]);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(id);
  }, [loadKey]);

  const feedQuotes = (caseId && feed.quotesByCase?.[caseId]) ?? feed.quotes;
  const cardCount = feedQuotes.length + (caseId === "A" || caseId === "B" ? 1 : 0);

  // What Ask BimaNetra can see: the feed, the Gold Quote (priced only once
  // revealed), Your Details as the sidebar shows them.
  const chatContext = useMemo<QuotesChatContext>(() => {
    const rows = content.detailsPanel.rows.map((row) => ({
      label: row.label,
      value: (row.key && values?.[row.key]?.trim()) || row.value,
    }));
    const gold = lured ? ((caseId && feed.goldQuoteByCase?.[caseId]) ?? feed.goldQuote) : undefined;
    return {
      quotes: feedQuotes,
      gold: gold && { quote: gold, revealed },
      company: result?.companyName || content.detailsPanel.companyLabel,
      sumInsured: values?.["coverage"] || rows.find((r) => r.label === feed.sumInsuredLabel)?.value || "",
      details: rows,
      phone: feed.needHelp.phone,
    };
  }, [content, feed, values, caseId, lured, feedQuotes, revealed, result?.companyName]);

  return (
    <div className={styles.page}>
      {/* Header CTA: Chat with Us, the sparkle after the label (in white). */}
      {comparing ? (
        // Compare view: the primary Mail Quotes (the header's default mail icon).
        <QuotesHeader content={content.header} label={content.header.compareCtaLabel} onCta={() => notify("mailQuotes")} />
      ) : (
        <QuotesHeader
          content={content.header}
          icon={<span className={styles.sparkle} style={{ "--icon": `url(${feed.needHelp.chatIconSrc})` } as CSSProperties} aria-hidden />}
          iconAfter
          tone="secondary"
          label={chatOpen ? content.chat.closeLabel : undefined}
          ctaPressed={chatOpen}
          onCta={toggleChat}
        />
      )}
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
              transition={{ duration: 0.35, ease: EASE_STD }}
            >
              <DetailsPanel
                content={content.detailsPanel}
                values={values}
                onEdit={() => setEditOpen(true)}
                collapsed={detailsCollapsed}
                onToggleCollapse={() => setDetailsCollapsed((v) => !v)}
                stage={upgradeStage}
                noRecords={caseId !== "A" && caseId !== "B"}
                caseId={caseId}
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
                content={feed}
                caseId={caseId}
                sumInsured={sumInsured}
                onComparingChange={setComparing}
                helpHidden={chatOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Ask BimaNetra: a full-height column at the feed's right edge. Its
            width opens with a CSS transition (no per-frame script), and the
            chat stays mounted after the first open so it reopens instantly
            with its conversation intact. */}
        {!stacked && (
          <aside className={styles.chatSlot} data-open={chatOpen || undefined} aria-hidden={!chatOpen} inert={!chatOpen}>
            {chatUsed && (
              <div className={styles.chatInner}>
                <QuotesChat content={content.chat} context={chatContext} iconSrc={feed.needHelp.chatIconSrc} open={chatOpen} onClose={toggleChat} />
              </div>
            )}
          </aside>
        )}
      </main>

      {/* Phones: Ask BimaNetra rises as a drawer, like every other popup there. */}
      {stacked && (
        <SideDrawer open={chatOpen} onClose={toggleChat} title={content.chat.title} closeLabel={content.chat.closeLabel} placement="bottom" className={styles.chatDrawer}>
          <QuotesChat content={content.chat} context={chatContext} iconSrc={feed.needHelp.chatIconSrc} open={chatOpen} variant="drawer" />
        </SideDrawer>
      )}

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
