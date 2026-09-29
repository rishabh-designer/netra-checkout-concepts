"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FeatureItem, FeatureTab, FeaturesDrawerContent, QuoteCardData } from "@/types/quotesPage";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { CloseButton, IconButton } from "@/components/ui/IconButton";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { coverageChipLabel, lockBeam, type QuoteCardLabels } from "../QuoteCard";
import cardStyles from "../QuoteCard/QuoteCard.module.css";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import styles from "./FeaturesModal.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { Button } from "@/components/ui/Button";

export type QuoteTone = "gold" | "immediate" | "priced" | "quote";

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

/* Mobile (the stacked modal, ≤900px): the item markers drop to 14, with
   their 14px headings (marker = label size). */
const MOBILE_QUERY = "(max-width: 900px)";
const subscribeMobile = (cb: () => void) => {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readMobile = () => window.matchMedia(MOBILE_QUERY).matches;

/** Item marker per tab tone: blue tick (658:50478), red cross, purple dot. */
function Marker({ tone, gold = false }: { tone: FeatureTab["tone"]; gold?: boolean }) {
  const size = useSyncExternalStore(subscribeMobile, readMobile, () => false) ? 14 : 16;
  // The Gold Quote's ticks are BimaNetra's orange; every other quote's are blue.
  if (tone === "covered") return <SquareCheckbox tone={gold ? "secondary" : "info"} state="checked" size={size} className={styles.marker} />;
  if (tone === "excluded") {
    return (
      <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden className={styles.marker}>
        <rect width="16" height="16" rx="4" fill="var(--color-error)" />
        <path d="m5.3 5.3 5.4 5.4m0-5.4-5.4 5.4" stroke="var(--color-label-inverse)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
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

  // Each opening starts on the default tab, with focus on ×.
  useEffect(() => {
    if (!open) return;
    setActive(content.defaultTab);
    const id = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open, content.defaultTab]);

  const tab = content.tabs.find((t) => t.key === active) ?? content.tabs[0];
  // Overview, coverages and exclusions come from the quote's own policy; its
  // top coverages carry the Top Feature (or, on Gold, Personalized) pill.
  const top = new Set(quote?.coverages ?? quote?.policy?.top ?? []);
  const own =
    quote?.policy && isPolicyTab(tab.key)
      ? quote.policy[tab.key]
      : tab.key === "territory" && quote?.territory
        ? content.territoryItems[quote.territory]
        : null;
  const items: (FeatureItem & { top?: boolean })[] = (own ?? tab.items).map((it) =>
    tab.key === "coverages" ? { ...it, top: top.has(it.title) } : it,
  );
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

  const filled = tone === "gold" || !!quote?.price;
  const [nameTop, nameBottom] = content.productName.split("\n");

  // pagination (727:34231), chevrons only: each one's tooltip names the
  // quote it goes to ("Quote 2 of 7"). In the summary's tag row on web; on
  // mobile it moves up beside ×.
  const pagerEl = pager && pager.total > 1 ? (
    <div className={styles.pager}>
      <IconButton size="sm" label={content.prevQuoteLabel} className={styles.pagerBtn} onClick={pager.onPrev} data-tooltip={tipFor((pager.index - 1 + pager.total) % pager.total)}>
        <Chevron dir="left" size={12} />
      </IconButton>
      <IconButton size="sm" label={content.nextQuoteLabel} className={styles.pagerBtn} onClick={pager.onNext} data-tooltip={tipFor((pager.index + 1) % pager.total)}>
        <Chevron dir="right" size={12} />
      </IconButton>
    </div>
  ) : null;

  // Mobile: a bottom sheet (its footer pinned) instead of the centred popup.
  const mobile = useSyncExternalStore(subscribeMobile, readMobile, () => false);

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
          {/* The Gold card's beam, round the whole modal (same comet, same
              phase), with its halo just outside. */}
          {tone === "gold" && (
            <>
              <span className={styles.beamGlow} aria-hidden>
                <span ref={lockBeam} className={cardStyles.beamSpin} />
              </span>
              <span className={styles.beamRing} aria-hidden>
                <span ref={lockBeam} className={cardStyles.beamSpin} />
              </span>
            </>
          )}
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
                  {quote.territory && labels.territory && (
                    <span className={styles.tag} data-tone="territory" data-tooltip={labels.tips?.territory[quote.territory]}>
                      {labels.territory[quote.territory]}
                    </span>
                  )}
                  {tone === "gold" ? (
                    <span className={styles.tag} data-tone="gold" data-tooltip={labels.tips?.gold}>
                      <BadgeCheckIcon size={10} color="var(--color-brand-secondary)" />
                      {labels.poweredBy}
                    </span>
                  ) : tone === "immediate" ? (
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
                {!!summary.length && (
                  <ul className={styles.coverageList}>
                    {summary.map((c) => (
                      <li key={c} className={styles.coverage}>
                        <SquareCheckbox tone={tone === "gold" ? "secondary" : "info"} state="checked" size={12} />
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={tab.key}
                  className={styles.list}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {items.map((item) => (
                    <li key={item.title} className={styles.item}>
                      <p className={styles.itemTitle} data-tone={tab.tone}>
                        <Marker tone={tab.tone} gold={tone === "gold"} />
                        {item.title}
                        {item.top && (
                          <span className={styles.topPill} data-tooltip={quote.gold ? content.personalizedTip : content.topFeatureTip}>
                            {quote.gold ? content.personalizedLabel : content.topFeatureLabel}
                          </span>
                        )}
                      </p>
                      <p className={styles.itemBody}>{item.body}</p>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

            <div className={styles.footer}>
              <div className={styles.sum}>
                <span className={styles.sumLabel}>{labels.sumInsured}</span>
                <span className={styles.sumValue}>{quote.sumInsured}</span>
              </div>
              <Button
                tone={!filled ? "outline" : tone === "gold" ? "secondary" : "primary"}
                onClick={onSelect}
                onMouseEnter={() => arrowRef.current?.startAnimation()}
                onMouseLeave={() => arrowRef.current?.stopAnimation()}
              >
                {quote.price ?? labels.getQuote}
                <MoveRightIcon ref={arrowRef} size={16} loop className={styles.arrow} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </SideDrawer>
  );
}
