"use client";

import { cn } from "@/lib/utils";
import styles from "./SegmentedField.module.css";
import {
  FilledCheck,
  Info,
  MutedDot,
  Spinner,
  type FieldStatus,
} from "../InteractiveInput/icons";
import type { HelpTone } from "../InteractiveInput";

export interface SegmentedFieldProps {
  label?: string;
  mandatory?: boolean;
  showLabel?: boolean;
  /** Show the "(i)" affordance in the label row. */
  info?: boolean;
  /** Exactly two options; defaults to Yes / No. */
  options?: string[];
  value: string;
  onChange?: (value: string) => void;
  /** fuzzy → orange selection; loading → spinner replaces the tick. */
  status?: FieldStatus;
  helpText?: string;
  helpTone?: HelpTone;
  showHelp?: boolean;
  name?: string;
}

/**
 * SegmentedField — the Peetal DSL binary (Yes/No) field: a label row (+ red
 * mandatory mark, optional "(i)"), two rounded-rect option pills each carrying
 * a status roundel, and a reserved help row. Hovering an unselected pill gives
 * a purple outline + hint dot; the selected pill fills purple (green tick) or
 * orange when fuzzy; loading swaps the tick for a spinner.
 * Usage: <SegmentedField label="…" value={v} onChange={setV} />
 */
export function SegmentedField({
  label,
  mandatory,
  showLabel = !!label,
  info = false,
  options = ["Yes", "No"],
  value,
  onChange,
  status = "empty",
  helpText,
  helpTone = "neutral",
  showHelp = false,
  name,
}: SegmentedFieldProps) {
  const loading = status === "loading";
  const tick = status === "fuzzy" ? "var(--color-brand-secondary)" : "var(--color-success)";

  return (
    <div className={styles.field}>
      {showLabel && (
        <div className={styles.labelRow}>
          <span className={styles.label}>
            {label}
            {mandatory && <span className={styles.req}>*</span>}
          </span>
          {info && <Info />}
        </div>
      )}

      <div className={styles.row} role="radiogroup" aria-label={label || undefined}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              name={name}
              className={cn(styles.opt, selected && styles.optOn)}
              data-status={selected ? status : undefined}
              onClick={() => onChange?.(opt)}
              disabled={loading}
            >
              <span>{opt}</span>
              {loading ? <Spinner /> : selected ? <FilledCheck color={tick} /> : <MutedDot />}
            </button>
          );
        })}
      </div>

      {showHelp && (
        <div className={styles.help} data-tone={helpText ? helpTone : "neutral"}>
          {helpText && <p className={styles.helpText}>{helpText}</p>}
        </div>
      )}
    </div>
  );
}
