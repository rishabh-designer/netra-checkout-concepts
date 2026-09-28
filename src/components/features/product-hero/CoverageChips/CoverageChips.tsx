"use client";

import { CoverageTicker } from "../CoverageTicker";
import styles from "./CoverageChips.module.css";

export interface CoverageChipsProps {
  items: string[];
  /** The green tick before each label. */
  iconSrc: string;
  /** Chips shown at once; the rest rotate through them. */
  visible?: number;
  /** ms each line holds before morphing into the next. */
  interval?: number;
}

/** ms between one chip's morph and the next. */
const STAGGER = 180;

/**
 * CoverageChips — `visible` coverage chips in a row, each a CoverageTicker
 * (the focus hero's chip: the label lifts out as the next rises in, and the
 * chip eases to its new width). Chip i cycles items i, i + visible, …, and
 * each morphs a beat after the one before it, so the row changes one chip
 * after another.
 * Usage: <CoverageChips items={focus.coveredChips} iconSrc={focus.coveredIconSrc} />
 */
export function CoverageChips({ items, iconSrc, visible = 3, interval = 3200 }: CoverageChipsProps) {
  const slots = Array.from({ length: Math.min(visible, items.length) }, (_, i) =>
    items.filter((_, k) => k % visible === i),
  );
  return (
    <div className={styles.chips}>
      {slots.map((slotItems, i) => (
        <CoverageTicker key={i} items={slotItems} iconSrc={iconSrc} interval={interval} delay={i * STAGGER} />
      ))}
    </div>
  );
}
