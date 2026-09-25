"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import pillStyles from "@/components/ui/TagPill/TagPill.module.css";
import styles from "./CoverageTicker.module.css";

export interface CoverageTickerProps {
  /** Covered items, cycled in order (first one shows under reduced motion). */
  items: string[];
  /** Hold time per item (ms). */
  interval?: number;
}

const EASE = [0.4, 0, 0.2, 1] as const;

/** Shield-check glyph — fixed while the label rotates. */
function ShieldCheck() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="M8 1.8 13 3.6v4c0 3-2.1 5.4-5 6.6-2.9-1.2-5-3.6-5-6.6v-4L8 1.8Z" stroke="var(--color-success)" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="m5.7 8 1.6 1.6 3-3.2" stroke="var(--color-success)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * CoverageTicker — a green TagPill whose label rotates through what the policy
 * covers (after Policybazaar's feature line): each item rises in, holds, then
 * lifts away for the next, while the label window eases to the new item's
 * measured width (no scale distortion). Pauses in background tabs; static
 * under reduced motion.
 * Usage: <CoverageTicker items={["Covers legal & defence costs", …]} />
 */
export function CoverageTicker({ items, interval = 2200 }: CoverageTickerProps) {
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
  }, [items]);

  // Rotate while the tab is visible.
  useEffect(() => {
    if (reduced || items.length < 2) return;
    let id = 0;
    const start = () => {
      window.clearInterval(id);
      if (!document.hidden) id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", start);
    };
  }, [reduced, items.length, interval]);

  // Measured in a layout effect, so the first paint already has the width;
  // CSS can't transition from auto, so it snaps in, and later changes ease.
  const width = widths[index];

  return (
    <div className={cn(pillStyles.pill, pillStyles.success, styles.ticker)}>
      <span className={styles.icon}>
        <ShieldCheck />
      </span>
      <span className={styles.window} aria-live="polite" style={width ? { width } : undefined}>
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            className={styles.label}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Off-screen sizer: one span per item, same type styles. */}
      <span ref={sizerRef} className={styles.sizer} aria-hidden>
        {items.map((item) => (
          <span key={item} className={styles.label}>
            {item}
          </span>
        ))}
      </span>
    </div>
  );
}
