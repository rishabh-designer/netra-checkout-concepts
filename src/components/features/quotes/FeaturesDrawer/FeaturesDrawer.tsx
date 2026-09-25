"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FeatureTab, FeaturesDrawerContent, QuoteCardData } from "@/types/quotesPage";
import { MoveRightIcon, type MoveRightIconHandle } from "@/components/icons/MoveRightIcon";
import styles from "./FeaturesDrawer.module.css";

/** Same scrim as the Edit Details drawer (A9ACB1 @ 80% + 6px blur, 249:3516). */
const SCRIM = {
  hidden: { backgroundColor: "rgba(169, 172, 177, 0)", backdropFilter: "blur(0px)" },
  shown: { backgroundColor: "rgba(169, 172, 177, 0.8)", backdropFilter: "blur(6px)" },
};

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
 * FeaturesDrawer — "View All Features" (Figma 587:63725). Docks right with a
 * 32px gutter over the blurred scrim: Instrument Serif title + close, a tab row
 * (587:64696) whose active tab takes a tinted fill and purple underline, a
 * scrolling list of titled explanations (587:63851), and a pinned footer that
 * mirrors the originating card's Sum Insured and price / Get Quote button.
 * Usage: <FeaturesDrawer open={open} onClose={close} content={c} quote={q} tone="immediate" labels={…} />
 */
export function FeaturesDrawer({ open, onClose, content, quote, tone, labels }: FeaturesDrawerProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(content.defaultTab);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<MoveRightIconHandle>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  useEffect(() => setMounted(true), []);

  // Each opening starts on the default tab, with focus on the close button.
  useEffect(() => {
    if (!open) return;
    setActive(content.defaultTab);
    const id = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, content.defaultTab]);

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

  if (!mounted) return null;
  const filled = tone === "gold" || !!quote?.price;

  return createPortal(
    <AnimatePresence>
      {open && quote && (
        <motion.div
          key="features"
          className={styles.overlay}
          onClick={onClose}
          initial={SCRIM.hidden}
          animate={SCRIM.shown}
          exit={SCRIM.hidden}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-title`}
            data-tone={tone}
            onClick={(e) => e.stopPropagation()}
            initial={{ x: reduced ? 0 : "calc(100% + 32px)" }}
            animate={{ x: 0 }}
            exit={{ x: reduced ? 0 : "calc(100% + 32px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.body}>
              <div className={styles.head}>
                <h2 id={`${baseId}-title`} className={styles.title}>{content.title}</h2>
                <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label={content.closeLabel}>
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                    <path d="M4 4l8 8M12 4l-8 8" stroke="var(--color-label-secondary)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

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
            </div>

            <div className={styles.footer}>
              <div className={styles.sum}>
                <span className={styles.sumLabel}>{labels.sumInsured}</span>
                <span className={styles.sumValue}>{quote.sumInsured}</span>
              </div>
              <button
                type="button"
                className={filled ? styles.buttonFilled : styles.buttonOutline}
                onMouseEnter={() => arrowRef.current?.startAnimation()}
                onMouseLeave={() => arrowRef.current?.stopAnimation()}
              >
                {quote.price ?? labels.getQuote}
                <MoveRightIcon ref={arrowRef} size={16} loop className={styles.arrow} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
