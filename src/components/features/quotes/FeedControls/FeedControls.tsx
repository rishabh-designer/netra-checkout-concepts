"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import styles from "./FeedControls.module.css";

export interface FeedControlsProps {
  filterLabel: string;
  sortLabel: string;
  switchLabel: string;
}

/** Three-line filter glyph. */
function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" stroke="var(--color-label-secondary)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Sort (arrows) glyph. */
function SortIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M4.5 3v10M4.5 3 2.5 5M4.5 3l2 2M11.5 13V3M11.5 13l-2-2M11.5 13l2-2" stroke="var(--color-label-secondary)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <path d="m4 6 4 4 4-4" stroke="var(--color-label-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * FeedControls — the row above the quote grid: a Filter chip, a Sort chip, and
 * the "Immediate Purchase Only" switch. The switch toggles; the chips are
 * dropdown-styled but don't filter/sort the grid yet (next pass).
 * Usage: <FeedControls filterLabel sortLabel switchLabel />
 */
export function FeedControls({ filterLabel, sortLabel, switchLabel }: FeedControlsProps) {
  const [immediateOnly, setImmediateOnly] = useState(true);
  return (
    <div className={styles.row}>
      <div className={styles.chips}>
        <button type="button" className={styles.chip}>
          <span className={styles.chipLabel}>{filterLabel}</span>
          <Chevron />
          <span className={styles.chipDivider} />
          <FilterIcon />
        </button>
        <button type="button" className={styles.chip}>
          <span className={styles.chipLabel}>{sortLabel}</span>
          <Chevron />
          <span className={styles.chipDivider} />
          <SortIcon />
        </button>
      </div>
      <ToggleSwitch checked={immediateOnly} onChange={setImmediateOnly} label={switchLabel} />
    </div>
  );
}
