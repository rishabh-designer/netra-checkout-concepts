"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FeatureItem, FeatureTab, FeaturesDrawerContent, QuoteCardData } from "@/types/quotesPage";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { CloseButton, IconButton } from "@/components/ui/IconButton";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { coverageChipLabel, type QuoteCardLabels } from "../QuoteCard";
import { Cross, Tick } from "../RiskScore";
import { Skeleton } from "@/components/ui/Skeleton";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import styles from "./FeaturesModal.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { Button } from "@/components/ui/Button";
import { EASE_OUT } from "@/lib/motion";
import { useAtMost } from "@/lib/media";

/** Every quote, the Gold Quote included, reads by what it is: bought
 *  online, priced, or one to request. No quote is singled out. */
export type QuoteTone = "immediate" | "priced" | "quote";

/** How long a tab (or a paged-to quote) shows its skeleton before the list
 *  fades in: it replaces the old list at once. */
const SKELETON_MS = 300;
/** The skeleton's rows: title bar width and body lines. */
const SKELETON_ROWS = [
  { title: "46%", lines: ["94%", "62%"] },
  { title: "58%", lines: ["88%"] },
  { title: "40%", lines: ["92%", "48%"] },
  { title: "52%", lines: ["84%"] },
];

export interface FeaturesModalProps {
  open: boolean;
  onClose: () => void;
  content: FeaturesDrawerContent;
  /** The card the modal was opened from — its tag, logo, coverages, Sum
   *  Insured and button are mirrored. Kept while closing so the exit doesn't
   *  blank. */
  quote: QuoteCardData | null;
  tone: QuoteTone;
  labels: QuoteCardLabels;
  /** Footer price button: same action as the card's (starts checkout). */
  onSelect?: () => void;
  /** Where this quote sits among those shown, to page through them. */
  pager?: { index: number; total: number; onPrev: () => void; onNext: () => void };
}

/** The tabs a quote's own policy fills; the rest (territory, deductibles)
 *  are standard. */
const POLICY_TABS = ["overview", "coverages", "exclusions"] as const;
type PolicyTab = (typeof POLICY_TABS)[number];
const isPolicyTab = (key: string): key is PolicyTab => (POLICY_TABS as readonly string[]).includes(key);

/** Item marker per tab tone, as the Score tab's lists: a green circle tick
 *  (covered), a red circle cross (excluded), a purple dot (info). */
function Marker({ tone }: { tone: FeatureTab["tone"] }) {
  if (tone === "covered") return <Tick size={14} className={styles.marker} />;
  if (tone === "excluded") return <Cross size={14} className={styles.marker} />;
  return <span className={styles.dot} aria-hidden />;
}

/**
 * FeaturesModal — the policy details popover (Figma 658:50425), opened from a
 * card's coverages chip. A 1200-wide panel: on the left, the quote's summary
 * card (tag, logo, insurer, its coverages as ticked chips, and the D&O mark
 * over the product name); on the right, the tab row (the active tab takes a
 * tinted fill and purple underline), a scrolling list of titled
 * explanations, and a raised footer mirroring the card's Sum Insured and
 * price / Get Quote button.
 * Usage: <FeaturesModal open={o} onClose={c} content={c} quote={q} tone="immediate" labels={…} />
 */
export function FeaturesModal({ open, onClose, content, quote, tone, labels, onSelect, pager }: FeaturesModalProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(content.defaultTab);
  const arrowRef = useRef<MoveRightIconHandle>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const tipFor = (i: number) => content.pagerTip.replace("{n}", String(i + 1)).replace("{total}", String(pager?.total ?? 0));

  // Each opening starts on the default tab (Overview) and counts as a fresh
  // view, so its skeleton plays again (set during render, as the panel opens).
  const [wasOpen, setWasOpen] = useState(open);
  const [session, setSession] = useState(0);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setActive(content.defaultTab);
      setSession((n) => n + 1);
    }
  }
  // Focus on × as it opens.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  const tab = content.tabs.find((t) => t.key === active) ?? content.tabs[0];
  // A quick, quiet skeleton each time the list changes: on opening, on a tab
  // and on paging to another quote.
  const view = `${session}|${tab.key}|${quote?.insurer ?? ""}`;
  const [shownView, setShownView] = useState<string | null>(null);
  useEffect(() => {
    if (!open || reduced) return;
    const id = window.setTimeout(() => setShownView(view), SKELETON_MS);
    return () => window.clearTimeout(id);
  }, [open, reduced, view]);
  const loading = !reduced && shownView !== view;
  // Overview, coverages and exclusions come from the quote's own policy; its
  // top coverages carry the Top Feature (or, on Gold, Personalized) pill.
  // Once the risk is scored, the pills mark the business's key lines instead.
  const fit = quote?.riskFit;
  const keyMet = new Set(fit?.lines.filter((l) => l.met).map((l) => l.title) ?? []);
  const top = new Set(quote?.coverages ?? quote?.policy?.top ?? []);
  const own =
    quote?.policy && isPolicyTab(tab.key)
      ? quote.policy[tab.key]
      : tab.key === "territory" && quote?.territory
        ? content.territoryItems[quote.territory]
        : null;
  const items: (FeatureItem & { top?: boolean })[] = (own ?? tab.items).map((it) =>
    fit
      ? tab.key === "coverages" || tab.key === "exclusions"
        ? { ...it, top: keyMet.has(it.title) }
        : it
      : tab.key === "coverages"
        ? { ...it, top: top.has(it.title) }
        : it,
  );
  const pill = fit
    ? tab.key === "exclusions"
      ? { label: content.keyExclusionLabel, tip: content.keyExclusionTip }
      : { label: content.keyCoverageLabel, tip: content.keyCoverageTip }
    : { label: content.topFeatureLabel, tip: content.topFeatureTip };
  const summary = quote?.coverages ?? quote?.policy?.top ?? [];

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = content.tabs.findIndex((t) => t.key === active);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + content.tabs.length) % content.tabs.length;
    setActive(content.tabs[next].key);
    tabRefs.current[next]?.focus();
  };

  const filled = !!quote?.price || !!quote?.gold;
  const [nameTop, nameBottom] = content.productName.split("\n");

  // pagination (727:34231), chevrons only: each one's tooltip names the
  // quote it goes to ("Quote 2 of 7"). In the summary's tag row on web; on
  // mobile it moves up beside ×.
  const pagerEl = pager && pager.total > 1 ? (
    <div className={styles.pager}>
      <IconButton label={content.prevQuoteLabel} className={styles.pagerBtn} onClick={pager.onPrev} data-tooltip={tipFor((pager.index - 1 + pager.total) % pager.total)}>
        <Chevron dir="left" />
      </IconButton>
      <IconButton label={content.nextQuoteLabel} className={styles.pagerBtn} onClick={pager.onNext} data-tooltip={tipFor((pager.index + 1) % pager.total)}>
        <Chevron dir="right" />
      </IconButton>
    </div>
  ) : null;

  // Mobile: a bottom sheet (its footer pinned) instead of the centred popup.
  const mobile = useAtMost("sheet");

  return (
    <SideDrawer
      open={open && !!quote}
      onClose={onClose}
      title={content.title}
      closeLabel={content.closeLabel}
      placement={mobile ? "bottom" : "center"}
      bare
      width={1200}
      className={styles.shell}
    >
      {quote && (
        <div className={styles.modal} data-tone={tone}>
          {/* Top bar: × (top-right); on mobile the pager joins it, top-left. */}
          <div className={styles.topBar}>
            {pagerEl && <div className={styles.pagerTop}>{pagerEl}</div>}
            <CloseButton ref={closeRef} label={content.closeLabel} className={styles.close} onClick={onClose} />
          </div>

          {/* Summary card (658:50427) */}
          <aside className={styles.summary}>
            <div className={styles.summaryTop}>
              <div className={styles.identity}>
                <div className={styles.tagRow}>
                  {/* pagination (727:34231), chevrons only: each one's tooltip
                      names the quote it goes to ("Quote 2 of 7"). */}
                  {pagerEl && <div className={styles.pagerInCard}>{pagerEl}</div>}
                  {tone === "immediate" ? (
                    <span className={styles.tag} data-tooltip={labels.tips?.immediate}>
                      <ShoppingBagIcon size={10} color="var(--color-success)" />
                      {labels.immediatePurchase}
                    </span>
                  ) : null}
                </div>
                {quote.logoSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={quote.logoSrc} alt="" aria-hidden className={styles.logo} />
                )}
                <p className={styles.insurer}>{quote.insurer}</p>
              </div>

              <div className={styles.coverages}>
                <p className={styles.coveragesTitle}>{coverageChipLabel(quote, labels)}</p>
                {fit ? (
                  // Scored: every key line, met or not (greyed).
                  <ul className={styles.coverageList} data-fit>
                    {fit.lines.map((l) => (
                      <li key={l.title} className={styles.coverage} data-met={l.met || undefined}>
                        {/* Same marks as the Score tab's lists: green coverage,
                            red exclusion; grey where this quote misses it. */}
                        {l.kind === "coverage" ? <Tick muted={!l.met} /> : <Cross muted={!l.met} />}
                        {l.title}
                      </li>
                    ))}
                  </ul>
                ) : !!summary.length && (
                  <ul className={styles.coverageList}>
                    {summary.map((c) => (
                      <li key={c} className={styles.coverage}>
                        <SquareCheckbox tone="info" state="checked" size={12} />
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.product}>
              <hr className={styles.productRule} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.productIconSrc} alt="" aria-hidden className={styles.productIcon} />
              <p className={styles.productName}>
                {nameTop}
                {nameBottom && <br />}
                {nameBottom}
              </p>
            </div>
          </aside>

          {/* Details (658:50476): tabs, the tab's list, the price footer. */}
          <div className={styles.panel}>
            <div className={styles.tabs} role="tablist" aria-label={content.title} onKeyDown={onTabKey}>
              {content.tabs.map((t, i) => (
                <button
                  key={t.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${t.key}`}
                  aria-selected={t.key === tab.key}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={t.key === tab.key ? 0 : -1}
                  className={styles.tab}
                  onClick={() => setActive(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              id={`${baseId}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${tab.key}`}
              className={styles.content}
              tabIndex={0}
            >
              {loading ? (
                // The list's shape, for a beat: a mark and a title bar over a
                // line or two, the rows 40ms apart. It stands in at once.
                <ul className={styles.list} aria-busy>
                  {SKELETON_ROWS.map((row, k) => (
                    <li key={k} className={styles.item}>
                      <span className={styles.skeletonTitle}>
                        <Skeleton variant="circular" width={14} height={14} delay={k * 40} />
                        <Skeleton width={row.title} height={14} delay={k * 40} />
                      </span>
                      {row.lines.map((w, j) => (
                        <Skeleton key={j} width={w} height={10} delay={k * 40 + 20 * (j + 1)} />
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <motion.ul
                  key={view}
                  className={styles.list}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                >
                  {items.map((item) => (
                    <li key={item.title} className={styles.item}>
                      <p className={styles.itemTitle} data-tone={tab.tone}>
                        <Marker tone={tab.tone} />
                        {item.title}
                        {item.top && (
                          <span className={styles.topPill} data-tooltip={pill.tip}>
                            {pill.label}
                          </span>
                        )}
                      </p>
                      <p className={styles.itemBody}>{item.body}</p>
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.sum}>
                <span className={styles.sumLabel}>{labels.sumInsured}</span>
                <span className={styles.sumValue}>{quote.sumInsured}</span>
              </div>
              <Button
                tone={filled ? "primary" : "outline"}
                onClick={onSelect}
                onMouseEnter={() => arrowRef.current?.startAnimation()}
                onMouseLeave={() => arrowRef.current?.stopAnimation()}
              >
                {quote.price ?? quote.ctaLabel ?? labels.getQuote}
                <MoveRightIcon ref={arrowRef} size={16} loop className={styles.arrow} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </SideDrawer>
  );
}
