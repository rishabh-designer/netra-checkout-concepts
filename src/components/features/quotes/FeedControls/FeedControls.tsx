"use client";

import { useState } from "react";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import styles from "./FeedControls.module.css";

export interface FeedControlsProps {
  filterLabel: string;
  sortLabel: string;
  switchLabel: string;
}

/** "bars-filter" glyph (Figma: 12px glyph in a 16px box). */
function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" stroke="var(--color-label-secondary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** "bars-sort" glyph — bars shortening downward. */
function SortIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M2.5 4.5h11M2.5 8h7M2.5 11.5h3" stroke="var(--color-label-secondary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="m4 6 4 4 4-4" stroke="var(--color-label-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * FeedControls — the centred row above the quote stack (Figma 564:32971): a
 * Filtering and a Sorting dropdown (226×32; label, chevron, divider, glyph) and
 * the "Immediate Purchase Only" switch in a matching bordered box. The switch
 * toggles; the dropdowns don't filter/sort yet (next pass).
 * Usage: <FeedControls filterLabel sortLabel switchLabel />
 */
export function FeedControls({ filterLabel, sortLabel, switchLabel }: FeedControlsProps) {
  const [immediateOnly, setImmediateOnly] = useState(false);
  return (
    <div className={styles.row}>
      <div className={styles.dropdowns}>
        <button type="button" className={styles.dropdown}>
          <span className={styles.label}>{filterLabel}</span>
          <span className={styles.suffix}>
            <Chevron />
            <span className={styles.divider} />
            <FilterIcon />
          </span>
        </button>
        <button type="button" className={styles.dropdown}>
          <span className={styles.label}>{sortLabel}</span>
          <span className={styles.suffix}>
            <Chevron />
            <span className={styles.divider} />
            <SortIcon />
          </span>
        </button>
      </div>
      <div className={styles.toggleBox}>
        <ToggleSwitch checked={immediateOnly} onChange={setImmediateOnly} label={switchLabel} size="sm" />
      </div>
    </div>
  );
}
