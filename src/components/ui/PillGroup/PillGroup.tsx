"use client";

import { cn } from "@/lib/utils";
import styles from "./PillGroup.module.css";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

export interface PillGroupProps<T extends string> {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}

/**
 * PillGroup - a small single-choice row of pills (a radio group). Use it for
 * two to four short options; the selected pill fills brand purple.
 * Usage: <PillGroup label="Easing" options={opts} value={easing} onChange={setEasing} />
 */
export function PillGroup<T extends string>({ options, value, onChange, label, className }: PillGroupProps<T>) {
  return (
    <div className={cn(styles.group, className)} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={styles.pill}
          data-selected={option.value === value || undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
