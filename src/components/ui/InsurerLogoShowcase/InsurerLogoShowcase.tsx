"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { InsurerLogo } from "@/types/productPage";
import styles from "./InsurerLogoShowcase.module.css";
import { EASE_STD } from "@/lib/motion";

export interface InsurerLogoShowcaseProps {
  /** One entry per slot; each slot cycles through its logos (one per set). */
  slots?: InsurerLogo[][];
  /** ms each set is held before the wall advances to the next. */
  interval?: number;
  /** Seconds of delay added per slot — creates the left-to-right blur wave. */
  stagger?: number;
  /** Seconds each logo takes to blur in/out. */
  fadeDuration?: number;
  /** Blur radius (px) applied to a logo as it fades out. */
  blur?: number;
  /** Scale of a logo when faded out — it shrinks to this as it blurs away. */
  fadeScale?: number;
}

/** Least space between two slots when deciding how many fit. */
const MIN_GAP = 16;

const widthOf = (logos: InsurerLogo[]) => Math.max(...logos.map((l) => l.width));

/** The first `n` slots, with the hidden slots' logos dealt onto them so
 *  every insurer still gets its turn: widest first, each into the slot it
 *  widens least (then the one with the fewest logos). */
function fold(slots: InsurerLogo[][], n: number): InsurerLogo[][] {
  // Folded rows show each logo once: a repeat is dropped, in the shown
  // slots and among the ones dealt onto them.
  const seen = new Set<string>();
  const kept = slots.slice(0, n).map((s) => s.filter((l) => !seen.has(l.src) && (seen.add(l.src), true)));
  const hidden = slots
    .slice(n)
    .flat()
    .filter((l) => !seen.has(l.src) && (seen.add(l.src), true))
    .sort((a, b) => b.width - a.width);
  for (const logo of hidden) {
    let best = 0;
    let bestCost = Infinity;
    kept.forEach((slot, i) => {
      const cost = Math.max(0, logo.width - widthOf(slot)) * 100 + slot.length;
      if (cost < bestCost) {
        bestCost = cost;
        best = i;
      }
    });
    kept[best].push(logo);
  }
  return kept;
}

/** As many slots as fit the row's width (at least one), folded. */
function fit(slots: InsurerLogo[][], width: number | null): InsurerLogo[][] {
  if (width === null || !slots.length) return slots;
  for (let n = slots.length; n > 1; n--) {
    const folded = fold(slots, n);
    const need = folded.reduce((sum, s) => sum + widthOf(s), 0) + MIN_GAP * (n - 1);
    if (need <= width) return folded;
  }
  return fold(slots, 1);
}

/**
 * InsurerLogoShowcase — a fixed row of logo slots. Every `interval` the whole
 * wall advances to the next set, each slot blurring its logo out and the next
 * one in; the per-slot `stagger` makes the change ripple left→right. Each slot
 * is sized to its widest logo so the row never reflows as logos swap. The
 * row shows only as many slots as fit its width (six on web, four on a
 * phone); the hidden slots' logos join the cycles of the ones shown.
 * Usage: <InsurerLogoShowcase slots={providerShowcase} />
 */
export function InsurerLogoShowcase({
  slots = [],
  interval = 4000,
  stagger = 0.25,
  fadeDuration = 1.5,
  blur = 3,
  fadeScale = 20 / 24,
}: InsurerLogoShowcaseProps) {
  const reduced = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState<number | null>(null);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width));
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  const shown = useMemo(() => fit(slots, rowWidth), [slots, rowWidth]);
  const cycleLength = shown.reduce((max, s) => Math.max(max, s.length), 1);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || cycleLength <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % cycleLength);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduced, cycleLength, interval]);

  return (
    // Hidden until measured, so a phone never flashes all six slots first.
    <div ref={rowRef} className={styles.row} style={rowWidth === null ? { visibility: "hidden" } : undefined}>
      {shown.map((logos, s) => {
        const slotWidth = widthOf(logos);
        const active = index % logos.length;
        return (
          <div
            key={s}
            className={styles.slot}
            style={{ width: `${slotWidth}px` }}
          >
            {logos.map((logo, l) => (
              <motion.img
                key={`${logo.src}-${l}`}
                src={logo.src}
                alt={logo.alt}
                className={styles.logo}
                style={{ width: `${logo.width}px` }}
                initial={false}
                animate={
                  l === active
                    ? { opacity: 1, filter: "blur(0px)", scale: 1 }
                    : { opacity: 0, filter: `blur(${blur}px)`, scale: fadeScale }
                }
                transition={{
                  duration: fadeDuration,
                  delay: reduced ? 0 : s * stagger,
                  ease: EASE_STD,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
