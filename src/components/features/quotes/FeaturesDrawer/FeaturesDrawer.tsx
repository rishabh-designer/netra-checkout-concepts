"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FeatureTab, FeaturesDrawerContent, QuoteCardData } from "@/types/quotesPage";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import { SideDrawer } from "@/components/ui/SideDrawer";
import styles from "./FeaturesDrawer.module.css";

export type QuoteTone = "gold" | "immediate" | "priced" | "quote";

export interface FeaturesDrawerProps {
  open: boolean;
  onClose: () => void;
  content: FeaturesDrawerContent;
  /** The card the drawer was opened from — its Sum Insured and button are
   *  mirrored in the footer. Kept while closing so the exit doesn't blank. */
  quote: QuoteCardData | null;
  tone: QuoteTone;
  labels: { sumInsured: string; getQuote: string };
  /** Footer price button: same action as the card's (starts checkout). */
  onSelect?: () => void;
}

/** Item marker per tab tone: green tick (587:63851), red cross, purple dot. */
function Marker({ tone }: { tone: FeatureTab["tone"] }) {
  if (tone === "covered") {
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden className={styles.marker}>
        <rect x="0.19" y="0.19" width="11.62" height="11.62" rx="3" fill="var(--color-success)" stroke="var(--color-success-border)" strokeWidth="0.375" />
        <path d="m2.72 6.42 1.95 1.95 4.61-4.6" stroke="var(--color-label-inverse)" strokeWidth="0.95" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (tone === "excluded") {
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden className={styles.marker}>
        <rect width="12" height="12" rx="3" fill="var(--color-error)" />
        <path d="m4 4 4 4M8 4 4 8" stroke="var(--color-label-inverse)" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }
  return <span className={styles.dot} aria-hidden />;
}

/**
 * FeaturesDrawer — "View All Features" (Figma 587:63725), in the shared
 * SideDrawer shell: a tab row (587:64696) whose active tab takes a tinted fill
 * and purple underline, a scrolling list of titled explanations (587:63851),
 * and a pinned footer that mirrors the originating card's Sum Insured and
 * price / Get Quote button.
 * Usage: <FeaturesDrawer open={open} onClose={close} content={c} quote={q} tone="immediate" labels={…} />
 */
export function FeaturesDrawer({ open, onClose, content, quote, tone, labels, onSelect }: FeaturesDrawerProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(content.defaultTab);
  const arrowRef = useRef<MoveRightIconHandle>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  // Each opening starts on the default tab.
  useEffect(() => {
    if (open) setActive(content.defaultTab);
  }, [open, content.defaultTab]);

  const tab = content.tabs.find((t) => t.key === active) ?? content.tabs[0];

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

  return (
    <SideDrawer
      open={open && !!quote}
      onClose={onClose}
      title={content.title}
      closeLabel={content.closeLabel}
      footer={
        quote && (
          <div className={styles.footer} data-tone={tone}>
            <div className={styles.sum}>
              <span className={styles.sumLabel}>{labels.sumInsured}</span>
              <span className={styles.sumValue}>{quote.sumInsured}</span>
            </div>
            <button
              type="button"
              className={filled ? styles.buttonFilled : styles.buttonOutline}
              onClick={onSelect}
              onMouseEnter={() => arrowRef.current?.startAnimation()}
              onMouseLeave={() => arrowRef.current?.stopAnimation()}
            >
              {quote.price ?? labels.getQuote}
              <MoveRightIcon ref={arrowRef} size={16} loop className={styles.arrow} />
            </button>
          </div>
        )
      }
    >
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
              {tab.items.map((item) => (
                <li key={item.title} className={styles.item}>
                  <p className={styles.itemTitle} data-tone={tab.tone}>
                    <Marker tone={tab.tone} />
                    {item.title}
                  </p>
                  <p className={styles.itemBody}>{item.body}</p>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </SideDrawer>
  );
}
