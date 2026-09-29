"use client";

import type { ReactNode } from "react";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { MultiSelectMenu } from "@/components/ui/MultiSelectMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { QuoteFilter, QuoteSort } from "@/types/quotesPage";
import styles from "./FeedControls.module.css";

export interface FeedControlsProps {
  /** Field labels over the dropdowns ("Filter Insurance Companies", "Sort Quotes"). */
  filterFieldLabel: string;
  sortFieldLabel: string;
  /** Trigger copy with an `{option}` slot ("Filtering: {option}"). */
  filterLabel: string;
  /** The insurers to pick from; none picked shows every insurer. */
  filterOptions: QuoteFilter[];
  filter: QuoteFilter[];
  onFilterChange: (picked: QuoteFilter[]) => void;
  /** Trigger values: none picked, and two or more (`{count}`). */
  filterAllLabel: string;
  filterCountLabel: string;
  filterResetLabel: string;
  filterApplyLabel: string;
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

/** One Filtering / Sorting field: a label over the DSL SelectMenu, drawn as
 *  an underlined input (Figma 658:50287). */
function Dropdown<T extends string>({
  fieldLabel,
  label,
  options,
  value,
  onChange,
  icon,
}: {
  fieldLabel: string;
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  icon: ReactNode;
}) {
  const current = options.find((o) => o.id === value) ?? options[0];
  const trigger = label.replace("{option}", current?.label ?? "");
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{fieldLabel}</span>
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
    </div>
  );
}

/** The insurer filter: the DSL multiselect in the same underlined field. */
function FilterDropdown(props: FeedControlsProps) {
  const { filter } = props;
  const value =
    filter.length === 0 ? props.filterAllLabel : filter.length === 1 ? filter[0] : props.filterCountLabel.replace("{count}", String(filter.length));
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{props.filterFieldLabel}</span>
      <div className={styles.dropdown}>
        <MultiSelectMenu
          value={filter}
          options={props.filterOptions}
          onChange={props.onFilterChange}
          triggerLabel={props.filterLabel.replace("{option}", value)}
          resetLabel={props.filterResetLabel}
          applyLabel={props.filterApplyLabel}
          triggerClassName={styles.trigger}
          adornment={
            <span className={styles.suffix}>
              <Chevron />
              <span className={styles.divider} />
              <FilterIcon />
            </span>
          }
        />
      </div>
    </div>
  );
}

/**
 * FeedControls — the row above the quote grid (Figma 658:45930): a labelled
 * Filtering and Sorting field on the left (260 wide, underlined; value,
 * chevron, divider, glyph) and the "Immediate Purchase Only" switch in a
 * bordered box on the right. Controlled: the feed owns the filter, sort and
 * switch state.
 * Usage: <FeedControls filterLabel filterOptions filter onFilterChange sortLabel … />
 */
export function FeedControls(props: FeedControlsProps) {
  return (
    <div className={styles.row}>
      <div className={styles.dropdowns}>
        <FilterDropdown {...props} />
        <Dropdown fieldLabel={props.sortFieldLabel} label={props.sortLabel} options={props.sortOptions} value={props.sort} onChange={props.onSortChange} icon={<SortIcon />} />
      </div>
      <div className={styles.toggleBox}>
        <ToggleSwitch checked={props.immediateOnly} onChange={props.onImmediateOnlyChange} label={props.switchLabel} size="sm" />
      </div>
    </div>
  );
}
