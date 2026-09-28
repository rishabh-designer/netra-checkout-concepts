"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CheckoutSuccessContent } from "@/types/checkout";
import { useDemoNotice } from "@/lib/demo-notice";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import styles from "./SuccessMore.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const riseFrom = (reduced: boolean | null, delay: number) => (i: number) =>
  reduced
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: delay + i * 0.08, ease: EASE } };

export interface RmCardProps {
  rm: CheckoutSuccessContent["rm"];
  /** Seconds before the card rises in. */
  delay?: number;
}

/**
 * RmCard — Meet your Relationship Manager (Figma 692:58458), under the
 * purchase summary: peach wash and ring, the eyebrow over the serif name,
 * a ringed photo, a warm line about them, and their phone.
 * Usage: <RmCard rm={s.rm} delay={0.9} />
 */
export function RmCard({ rm, delay = 0 }: RmCardProps) {
  const rise = riseFrom(useReducedMotion(), delay);
  return (
    <motion.aside className={styles.rm} {...rise(0)}>
      <div className={styles.rmTop}>
        <div className={styles.rmText}>
          <p className={styles.eyebrow}>{rm.eyebrow}</p>
          <p className={styles.rmName}>{rm.name}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rm.photoSrc} alt={rm.name} className={styles.photo} />
      </div>
      <p className={styles.rmBody}>{rm.body}</p>
      <a href={rm.phoneHref} className={styles.phone}>
        {rm.phone}
        {/* The call glyph as a mask, so it takes the link's purple. */}
        <span className={styles.phoneIcon} style={{ "--icon": `url(${rm.phoneIconSrc})` } as CSSProperties} aria-hidden />
      </a>
    </motion.aside>
  );
}

export interface SuggestionsProps {
  suggestions: CheckoutSuccessContent["suggestions"];
  /** Seconds before the cards rise in. */
  delay?: number;
}

/**
 * Suggestions — BimaNetra Suggests (Figma 673:54531), full width under the
 * fold: the title, then a row of product cards (name, line, cropped product
 * mark, Immediate Purchase tag and Find a Quote), rising in one by one.
 * Usage: <Suggestions suggestions={s.suggestions} delay={1.35} />
 */
export function Suggestions({ suggestions, delay = 0 }: SuggestionsProps) {
  const rise = riseFrom(useReducedMotion(), delay);
  const notify = useDemoNotice();
  return (
    <section className={styles.suggest}>
      <motion.h2 className={styles.suggestTitle} {...rise(0)}>
        {suggestions.title}
      </motion.h2>
      <ul className={styles.grid}>
        {suggestions.items.map((item, i) => (
          // The whole card is the hover and click target; Find a Quote is its
          // keyboard-reachable action.
          <motion.li key={item.name} className={styles.card} onClick={() => notify("findQuote")} {...rise(1 + i)}>
            <div className={styles.cardHead}>
              <div className={styles.cardText}>
                <p className={styles.cardName}>{item.name}</p>
                <p className={styles.cardBody}>{item.body}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.iconSrc} alt="" aria-hidden className={styles.mark} />
            </div>
            <div className={styles.cardFoot}>
              {item.immediate ? (
                <span className={styles.tag}>
                  <ShoppingBagIcon size={10} color="var(--color-success)" />
                  {suggestions.immediateLabel}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                className={styles.find}
                onClick={(e) => {
                  e.stopPropagation();
                  notify("findQuote");
                }}
              >
                {suggestions.ctaLabel}
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
