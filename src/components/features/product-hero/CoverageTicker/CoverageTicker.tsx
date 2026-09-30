"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import styles from "./CoverageTicker.module.css";
import { EASE_STD as EASE } from "@/lib/motion";

export interface CoverageTickerProps {
  /** Covered items, cycled in order (first one shows under reduced motion). */
  items: string[];
  /** The quote card's green coverage tick. */
  iconSrc: string;
  /** Hold time per item (ms). */
  interval?: number;
  /** Extra ms before each swap, so a row of tickers can change one after
   *  another (a stagger). */
  delay?: number;
  /** Calm mode: the chip holds its widest item's width (no resizing, so a
   *  row of chips never reflows) and labels cross-fade with a small drift. */
  steady?: boolean;
  /** Steady mode: size to the widest of these instead of `items`, so a row
   *  of tickers can share one width. */
  sizeTo?: string[];
}


/**
 * CoverageTicker — a coverage chip styled exactly like the Quote Card's
 * (hairline box, green tick, ink label; 14px here) so the hero and the quotes read
 * as one pattern. Its label rotates through what the policy covers (after
 * Policybazaar's feature line): each item rises in, holds, then
 * lifts away for the next, while the label window eases to the new item's
 * measured width (no scale distortion). Pauses in background tabs; static
 * under reduced motion.
 * Usage: <CoverageTicker items={["Covers legal & defence costs", …]} iconSrc="/media/coverage-check.svg" />
 */
export function CoverageTicker({ items, iconSrc, interval = 2200, delay = 0, steady = false, sizeTo }: CoverageTickerProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const sizerRef = useRef<HTMLSpanElement>(null);

  // Measure every item once (and again when webfonts settle) so the window can
  // animate to exact widths.
  useLayoutEffect(() => {
    const measure = () => {
      const nodes = sizerRef.current?.children;
      if (nodes) setWidths(Array.from(nodes, (n) => (n as HTMLElement).offsetWidth));
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
  }, [items, sizeTo]);

  // Rotate while the tab is visible.
  useEffect(() => {
    if (reduced || items.length < 2) return;
    let id = 0;
    let lead = 0;
    const start = () => {
      window.clearInterval(id);
      window.clearTimeout(lead);
      if (document.hidden) return;
      // The first swap waits `delay` longer; later ones keep that offset.
      lead = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
      }, interval + delay);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(lead);
      document.removeEventListener("visibilitychange", start);
    };
  }, [reduced, items.length, interval, delay]);

  // Measured in a layout effect, so the first paint already has the width;
  // CSS can't transition from auto, so it snaps in, and later changes ease.
  const width = steady ? (widths.length ? Math.max(...widths) : undefined) : widths[index];
  const drift = steady ? 3 : 8;

  return (
    <div className={styles.ticker}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={iconSrc} alt="" aria-hidden className={styles.check} />
      <span className={styles.window} aria-live="polite" style={width ? { width } : undefined}>
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            className={styles.label}
            initial={{ y: drift, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -drift, opacity: 0 }}
            transition={{ duration: steady ? 0.7 : 0.35, ease: EASE }}
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Off-screen sizer: one span per item, same type styles. */}
      <span ref={sizerRef} className={styles.sizer} aria-hidden>
        {(steady && sizeTo ? sizeTo : items).map((item) => (
          <span key={item} className={styles.label}>
            {item}
          </span>
        ))}
      </span>
    </div>
  );
}
