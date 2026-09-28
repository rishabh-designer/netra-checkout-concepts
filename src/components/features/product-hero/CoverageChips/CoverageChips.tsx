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
const STAGGER = 400;

/**
 * CoverageChips — `visible` coverage chips in a row, each a steady
 * CoverageTicker: all fixed at the widest of every line (one shared width,
 * so the row never reflows), its
 * label cross-fading with a 3px drift. Chip i cycles items i, i + visible, …,
 * a beat after the one before it, slowly enough to stay in the background.
 * When the column can't fit them in one row they stack; on phones a single
 * chip cycles every line (as on the Focus hero).
 * Usage: <CoverageChips items={focus.coveredChips} iconSrc={focus.coveredIconSrc} />
 */
export function CoverageChips({ items, iconSrc, visible = 3, interval = 5200 }: CoverageChipsProps) {
  const slots = Array.from({ length: Math.min(visible, items.length) }, (_, i) =>
    items.filter((_, k) => k % visible === i),
  );
  return (
    <>
      <div className={styles.chips}>
        {slots.map((slotItems, i) => (
          <CoverageTicker key={i} items={slotItems} sizeTo={items} iconSrc={iconSrc} interval={interval} delay={i * STAGGER} steady />
        ))}
      </div>
      <div className={styles.single}>
        <CoverageTicker items={items} sizeTo={items} iconSrc={iconSrc} interval={interval} steady />
      </div>
    </>
  );
}
