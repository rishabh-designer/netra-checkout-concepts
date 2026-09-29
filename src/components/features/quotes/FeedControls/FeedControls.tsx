"use client";

import { useState, type ReactNode } from "react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { MultiSelectMenu } from "@/components/ui/MultiSelectMenu";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { QuoteFilter, QuoteSort } from "@/types/quotesPage";
import styles from "./FeedControls.module.css";
import { Chevron } from "@/components/icons/Chevron";

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
  /** Mobile: the "Sort & Filter" button and its bottom sheet's title / ×. */
  sheetLabel: string;
  sheetTitle: string;
  sheetCloseLabel: string;
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

/** The field's chevron at its 14px value size, as on every select. */
function FieldChevron() {
  return <Chevron size={14} color="var(--color-label-tertiary)" />;
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
              <FieldChevron />
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
              <FieldChevron />
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
  // Mobile sheet: the picks are a draft until Apply Changes; Reset All clears
  // them (all insurers, the first sort).
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftFilter, setDraftFilter] = useState<QuoteFilter[]>(props.filter);
  const [draftSort, setDraftSort] = useState<QuoteSort>(props.sort);
  const openSheet = () => {
    setDraftFilter(props.filter);
    setDraftSort(props.sort);
    setSheetOpen(true);
  };
  const apply = () => {
    props.onFilterChange(draftFilter);
    props.onSortChange(draftSort);
    setSheetOpen(false);
  };
  const changed = draftSort !== props.sort || draftFilter.length !== props.filter.length || draftFilter.some((f) => !props.filter.includes(f));
  const clean = draftFilter.length === 0 && draftSort === props.sortOptions[0]?.id;

  return (
    <>
    {/* Mobile (Figma 732:34288): the switch left, "Sort & Filter" right, on a
        lilac hairline; the fields move into a bottom sheet (732:34326). */}
    <div className={styles.mobileBar}>
      <ToggleSwitch checked={props.immediateOnly} onChange={props.onImmediateOnlyChange} label={props.switchLabel} size="sm" />
      <button type="button" className={styles.sheetButton} onClick={openSheet} aria-haspopup="dialog">
        {props.sheetLabel}
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
          <path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
    <SideDrawer
      open={sheetOpen}
      onClose={() => setSheetOpen(false)}
      title={props.sheetTitle}
      closeLabel={props.sheetCloseLabel}
      placement="bottom"
      headGap={24}
      footer={
        <div className={styles.sheetFoot}>
          <button type="button" className={styles.sheetReset} onClick={() => { setDraftFilter([]); setDraftSort(props.sortOptions[0]?.id ?? draftSort); }} disabled={clean}>
            {props.filterResetLabel}
          </button>
          <button type="button" className={styles.sheetApply} onClick={apply} disabled={!changed}>
            {props.filterApplyLabel}
          </button>
        </div>
      }
    >
      <div className={styles.sheetFields}>
        <Dropdown fieldLabel={props.sortFieldLabel} label={props.sortLabel} options={props.sortOptions} value={draftSort} onChange={setDraftSort} icon={<SortIcon />} />
        <FilterDropdown {...props} filter={draftFilter} onFilterChange={setDraftFilter} />
      </div>
    </SideDrawer>
    <div className={styles.row}>
      <div className={styles.dropdowns}>
        <FilterDropdown {...props} />
        <Dropdown fieldLabel={props.sortFieldLabel} label={props.sortLabel} options={props.sortOptions} value={props.sort} onChange={props.onSortChange} icon={<SortIcon />} />
      </div>
      <div className={styles.toggleBox}>
        <ToggleSwitch checked={props.immediateOnly} onChange={props.onImmediateOnlyChange} label={props.switchLabel} size="sm" />
      </div>
    </div>
    </>
  );
}
