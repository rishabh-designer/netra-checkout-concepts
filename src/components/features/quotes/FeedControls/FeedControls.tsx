"use client";

import type { ReactNode } from "react";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { QuoteFilter, QuoteSort } from "@/types/quotesPage";
import styles from "./FeedControls.module.css";

export interface FeedControlsProps {
  /** Trigger copy with an `{option}` slot ("Filtering: {option}"). */
  filterLabel: string;
  filterOptions: { id: QuoteFilter; label: string }[];
  filter: QuoteFilter;
  onFilterChange: (id: QuoteFilter) => void;
  sortLabel: string;
  sortOptions: { id: QuoteSort; label: string }[];
  sort: QuoteSort;
  onSortChange: (id: QuoteSort) => void;
  switchLabel: string;
  immediateOnly: boolean;
  onImmediateOnlyChange: (on: boolean) => void;
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

/** One Filtering / Sorting dropdown: the DSL SelectMenu behind the box trigger. */
function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  icon: ReactNode;
}) {
  const current = options.find((o) => o.id === value) ?? options[0];
  const trigger = label.replace("{option}", current?.label ?? "");
  return (
    <div className={styles.dropdown}>
      <SelectMenu
        value={current?.label ?? ""}
        options={options.map((o) => o.label)}
        onChange={(picked) => {
          const next = options.find((o) => o.label === picked);
          if (next) onChange(next.id);
        }}
        ariaLabel={trigger}
        triggerLabel={trigger}
        triggerClassName={styles.trigger}
        adornment={
          <span className={styles.suffix}>
            <Chevron />
            <span className={styles.divider} />
            {icon}
          </span>
        }
      />
    </div>
  );
}

/**
 * FeedControls — the centred row above the quote stack (Figma 564:32971): a
 * Filtering and a Sorting dropdown (226×32; label, chevron, divider, glyph) and
 * the "Immediate Purchase Only" switch in a matching bordered box. Controlled:
 * the feed owns the filter, sort and switch state.
 * Usage: <FeedControls filterLabel filterOptions filter onFilterChange sortLabel … />
 */
export function FeedControls(props: FeedControlsProps) {
  return (
    <div className={styles.row}>
      <div className={styles.dropdowns}>
        <Dropdown label={props.filterLabel} options={props.filterOptions} value={props.filter} onChange={props.onFilterChange} icon={<FilterIcon />} />
        <Dropdown label={props.sortLabel} options={props.sortOptions} value={props.sort} onChange={props.onSortChange} icon={<SortIcon />} />
      </div>
      <div className={styles.toggleBox}>
        <ToggleSwitch checked={props.immediateOnly} onChange={props.onImmediateOnlyChange} label={props.switchLabel} size="sm" />
      </div>
    </div>
  );
}
