"use client";

import { scoreWord } from "@/lib/score-band";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { QuotesPageContent } from "@/types/quotesPage";
import { withRiskFit } from "@/lib/risk-fit";
import type { QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { useDemoNotice } from "@/lib/demo-notice";
import { QuoteModal } from "@/components/features/quote-modal/QuoteModal";
import { QuotesHeader } from "../QuotesHeader";
import { DetailsPanel } from "../DetailsPanel";
import { ScoreIntro } from "../ScoreIntro";
import { BotIntro } from "../BotIntro";
import { RiskScoreBadge } from "../RiskScore";
import type { UpgradeStage } from "../UpgradeBanner";
import { QuotesFeed } from "../QuotesFeed";
import { QuotesSkeleton } from "../QuotesSkeleton";
import { QuotesChat, useQuotesChat } from "../QuotesChat";
import { AskNetra } from "../AskNetra";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { NetraBot } from "@/components/ui/NetraBot";
import type { QuotesChatContext } from "@/lib/quotes-chat";
import { priceFeed } from "@/lib/pricing";
import styles from "./QuotesView.module.css";
import { EASE_STD } from "@/lib/motion";
import { isAtMost, useAtMost } from "@/lib/media";
import { ArrowRight } from "@/components/icons/ArrowRight";

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
/* The sidebar's "You're Upgraded!" follows the Gold Quote's shimmer by this
   beat (its light then lands ~0.45s after the card's). */
const PANEL_AFTER_MS = 250;

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
  const caseId = result?.caseId;
  // The welcome popup's medal: 320 on wide screens, 160 on phones.
  const phone = useAtMost("mobile");
  const feed = useMemo(
    () => withRiskFit(priceFeed(content.feed, { sumInsured, turnover: detail("turnover") }), caseId, content.detailsPanel.score.listLength),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.feed, values, caseId],
  );
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
  const notify = useDemoNotice();
  // A verified business (A, B) is greeted, right after the skeleton, by a
  // popup explaining the score and the key lines the quotes are matched
  // against: on every visit (each load or return to the page), not again
  // after an Edit Details reload within it.
  const [introOpen, setIntroOpen] = useState(false);
  // The Gold Quote's reveal waits for the popup to be dismissed.
  const [introDone, setIntroDone] = useState(false);
  const introShown = useRef(false);

  useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(id);
  }, [loadKey]);

  const feedQuotes = (caseId && feed.quotesByCase?.[caseId]) ?? feed.quotes;
  // The skeleton mirrors the feed: the Reveal slot, and no plain quote from
  // the Gold Quote's own insurer.
  const goldInsurer = lured ? ((caseId && feed.goldQuoteByCase?.[caseId]) ?? feed.goldQuote).insurer : undefined;
  const cardCount = feedQuotes.filter((q) => q.insurer !== goldInsurer).length + (lured ? 1 : 0);

  // What Ask BimaNetra can see: the feed, the Gold Quote, Your Details as the
  // sidebar shows them.
  const chatContext = useMemo<QuotesChatContext>(() => {
    const rows = content.detailsPanel.rows.map((row) => ({
      key: row.key,
      label: row.label,
      value: (row.key && values?.[row.key]?.trim()) || row.value,
    }));
    const gold = lured ? ((caseId && feed.goldQuoteByCase?.[caseId]) ?? feed.goldQuote) : undefined;
    return {
      // The Gold Quote stands in for its insurer's plain quote.
      quotes: gold ? feedQuotes.filter((q) => q.insurer !== gold.insurer) : feedQuotes,
      // The Gold Quote is in the feed from the start.
      gold: gold && { quote: gold, revealed: true },
      company: result?.companyName || content.detailsPanel.companyLabel,
      sumInsured: values?.["coverage"] || rows.find((r) => r.label === feed.sumInsuredLabel)?.value || "",
      details: rows,
      phone: feed.needHelp.phone,
      // The key lines, as the Score tab lists them (the Gold Quote's).
      keyLines: gold?.policy && {
        coverages: gold.policy.coverages.slice(0, content.detailsPanel.score.listLength).map((c) => c.title),
        exclusions: gold.policy.exclusions.slice(0, content.detailsPanel.score.listLength).map((c) => c.title),
      },
    };
  }, [content, feed, values, caseId, lured, feedQuotes, result?.companyName]);

  // Ask BimaNetra: the conversation lives here, so it survives the drawer
  // closing; the feed's Ask Netra box asks, and the right drawer opens on it.
  const chat = useQuotesChat(content.chat, chatContext);
  const [chatOpen, setChatOpen] = useState(false);
  const askAndOpen = (question: string) => {
    chat.ask(question);
    setChatOpen(true);
  };

  // The Score tab's lists: the Gold Quote's own coverages and exclusions.
  const goldPolicy = lured ? ((caseId && feed.goldQuoteByCase?.[caseId]) ?? feed.goldQuote)?.policy : undefined;
  const scoreLists = goldPolicy && {
    coverages: goldPolicy.coverages.map((c) => c.title),
    exclusions: goldPolicy.exclusions.map((c) => c.title),
  };

  // The intro popup's copy: the banner's own title and body for this case,
  // and the key lines as the Score tab lists them.
  const panel = content.detailsPanel;
  const listLength = panel.score.listLength;
  const introCoverages = scoreLists?.coverages.slice(0, listLength) ?? [];
  const introExclusions = scoreLists?.exclusions.slice(0, listLength) ?? [];
  const introCompany = result?.companyName || panel.companyFallback;
  // Only A and B, with key lines to show, get the popup (and wait on it).
  const introEligible = (caseId === "A" || caseId === "B") && !!scoreLists;
  // The Gold Quote's shimmer plays once verified and past the popup; the
  // sidebar holds its upgraded banner (at 100%) until a beat after, so the
  // quote lights up first, then the score.
  const unlocked = upgradeStage === "upgraded" && (!introEligible || introDone);
  const [panelCaughtUp, setPanelCaughtUp] = useState(false);
  useEffect(() => {
    if (!unlocked || panelCaughtUp) return;
    const id = window.setTimeout(() => setPanelCaughtUp(true), PANEL_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [unlocked, panelCaughtUp]);
  const panelStage: UpgradeStage = upgradeStage === "upgraded" && !panelCaughtUp ? "verifying" : upgradeStage;
  // Case C has no score to show: its popup introduces NetraBot instead, and
  // Continue opens the chat.
  const botIntroEligible = caseId === "C";
  const [botIntroOpen, setBotIntroOpen] = useState(false);
  useEffect(() => {
    if (loading || !botIntroEligible || introShown.current) return;
    const id = window.setTimeout(() => {
      introShown.current = true;
      setBotIntroOpen(true);
    }, 350);
    return () => window.clearTimeout(id);
  }, [loading, botIntroEligible]);
  useEffect(() => {
    if (loading || !introEligible || introShown.current) return;
    // As the page fades in from the skeleton.
    const id = window.setTimeout(() => {
      introShown.current = true;
      setIntroOpen(true);
    }, 350);
    return () => window.clearTimeout(id);
  }, [loading, introEligible]);

  return (
    <div className={styles.page}>
      {/* Header CTA (Figma 770:30236): Mail Quotes, the arrow after the label.
          Ask BimaNetra opens from the feed's Ask Netra box. */}
      <QuotesHeader
        content={content.header}
        label={content.header.compareCtaLabel}
        icon={<ArrowRight size={12} />}
        iconAfter
        onCta={() => notify("mailQuotes")}
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
                stage={panelStage}
                noRecords={caseId !== "A" && caseId !== "B"}
                caseId={caseId}
                verifyFrom={lured ? VERIFY_FROM : undefined}
                companyName={result?.companyName || undefined}
                scoreLists={scoreLists}
                onSimulate={() => setUpgradeStage("verifying")}
                onVerified={() => setUpgradeStage("upgraded")}
                onReset={
                  lured
                    ? undefined
                    : () => {
                        setUpgradeStage("pending");
                      }
                }
              />
              <QuotesFeed
                unlocked={unlocked}
                content={feed}
                caseId={caseId}
                sumInsured={sumInsured}
                assist={
                  <AskNetra
                    placeholder={content.chat.placeholder}
                    askLabel={content.chat.askLabel}
                    prompts={content.chat.askPrompts}
                    suggestions={chatContext.keyLines && content.chat.askSuggestionsScored ? content.chat.askSuggestionsScored : content.chat.suggestions.slice(0, 3)}
                    onOpen={() => setChatOpen(true)}
                    onAsk={askAndOpen}
                  />
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Ask BimaNetra, in a drawer on the right (a tall sheet on phones). */}
      <SideDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={content.chat.title}
        // NetraBot before the title, its eyes on the pointer.
        titleIcon={<NetraBot state="idle" follow="page" size={36} />}
        closeLabel={content.chat.closeLabel}
        width={424}
        sheetOnMobile
        className={styles.chatDrawer}
      >
        <QuotesChat content={content.chat} context={chatContext} session={chat} variant="drawer" open={chatOpen} />
      </SideDrawer>

      {/* Case C's welcome: NetraBot, and a chat that plays itself. */}
      {botIntroEligible && (
        <BotIntro
          open={botIntroOpen}
          onClose={() => setBotIntroOpen(false)}
          onContinue={() => {
            setBotIntroOpen(false);
            // Once the popup has gone: the chat opens, its cursor ready.
            window.setTimeout(() => setChatOpen(true), 350);
          }}
          content={panel.botIntro}
          context={chatContext}
        />
      )}

      {/* The verified business's welcome: score, key lines, Show All. */}
      {introEligible && scoreLists && (caseId === "A" || caseId === "B") && (
        <ScoreIntro
          open={introOpen}
          onClose={() => {
            setIntroOpen(false);
            setIntroDone(true);
          }}
          title={panel.upgraded.titleByCase?.[caseId] || panel.upgraded.title}
          body={(panel.upgraded.bodyByCase?.[caseId] || panel.upgraded.body).replace("{company}", introCompany)}
          badge={
            <RiskScoreBadge
              score={scoreWord(panel.score.byCase[caseId], panel.score.bands)}
              label={panel.score.label}
              medal
              medalPx={phone ? 160 : 320}
              medalLoop
              info={panel.score.infoByCase?.[caseId] ?? panel.score.info}
            />
          }
          listTitle={panel.score.listTitle.replace("{count}", String(introCoverages.length + introExclusions.length))}
          coverages={introCoverages}
          exclusions={introExclusions}
          hint={panel.scoreIntro.hint}
          ctaLabel={panel.scoreIntro.ctaLabel}
          closeLabel={panel.scoreIntro.closeLabel}
        />
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
