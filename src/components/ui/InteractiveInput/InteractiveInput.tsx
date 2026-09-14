"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./InteractiveInput.module.css";
import {
  ChevronDown,
  Clear,
  Info,
  SearchIcon,
  StatusIcon,
  type FieldStatus,
} from "./icons";

export type { FieldStatus };
export type HelpTone = "neutral" | "error" | "success";

export interface InteractiveInputProps {
  label?: string;
  mandatory?: boolean;
  /** Show the label row. Defaults to whether a `label` is given. */
  showLabel?: boolean;
  placeholder?: string;
  /** Fixed affix ("+91", "₹") — always label-disabled grey with a right divider. */
  prefix?: string;
  helpText?: string;
  helpTone?: HelpTone;
  /** Reserve the help row (28px). Its text toggles, but the row never shifts height. */
  showHelp?: boolean;
  control?: "text" | "select" | "search";
  options?: string[];
  value: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  /** Render the value as read-only text (e.g. a system-known company name). */
  readOnly?: boolean;
  clearable?: boolean;
  status?: FieldStatus;
  /** Returns an error message (→ error status + red help) or null when valid. */
  validate?: (value: string) => string | null;
  /** Focus on mount, desktop pointers only (no mobile keyboard pop). */
  autoFocusDesktop?: boolean;
  /** Persistent "typing" look (lavender fill + brand bottom-stroke), independent
   *  of focus — for a field the user is meant to type into immediately. */
  active?: boolean;
  /** Called when Enter is pressed in the input (e.g. submit the hero field). */
  onSubmit?: () => void;
  name?: string;
  ariaLabel?: string;
}

/**
 * InteractiveInput — the Peetal DSL alphanumeric field. Three fixed-height
 * sections: label (+ red mandatory mark), the status-themed input wrapper
 * (fill + bottom stroke + suffix roundel), and a reserved help row whose text
 * toggles without ever shifting height. Interaction states (hover / active /
 * typing) are CSS-driven; `status` drives the data/validation accent + icon.
 * Shared by the hero lead field and the quote modal.
 * Usage: <InteractiveInput value={v} onChange={setV} status="empty" />
 */
export function InteractiveInput({
  label,
  mandatory,
  showLabel = !!label,
  placeholder,
  prefix,
  helpText,
  helpTone = "neutral",
  showHelp = false,
  control = "text",
  options,
  value,
  onChange,
  onClear,
  readOnly = false,
  clearable = false,
  status = "empty",
  validate,
  autoFocusDesktop = false,
  active = false,
  onSubmit,
  name,
  ariaLabel,
}: InteractiveInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const inputId = name ?? uid;
  const helpId = `${uid}-help`;

  // Desktop-only autofocus: skip coarse/touch pointers so mobile keyboards
  // don't pop on load. Guarded — matchMedia can throw in odd contexts.
  useEffect(() => {
    if (!autoFocusDesktop) return;
    try {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        inputRef.current?.focus();
      }
    } catch {
      /* no-op */
    }
  }, [autoFocusDesktop]);

  const validationError = validate ? validate(value) : null;
  const effectiveStatus: FieldStatus = validationError ? "error" : status;
  const effectiveHelp = validationError ?? helpText;
  const effectiveTone: HelpTone = validationError ? "error" : helpTone;

  const loading = effectiveStatus === "loading";
  const isSelect = control === "select";
  const isSearch = control === "search";
  const isEmpty = !value;

  return (
    <div className={styles.field}>
      {showLabel && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {mandatory && <span className={styles.req}>*</span>}
        </label>
      )}

      <div className={styles.wrapper} data-status={effectiveStatus} data-active={active || undefined}>
        {prefix && (
          <span className={styles.prefix} aria-hidden>
            {prefix}
          </span>
        )}

        {readOnly ? (
          <span className={styles.value}>{value}</span>
        ) : isSelect ? (
          <select
            id={inputId}
            className={styles.select}
            name={name}
            aria-label={ariaLabel ?? label}
            data-empty={isEmpty ? true : undefined}
            value={value}
            disabled={loading}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="" disabled>
              {placeholder ?? "Select…"}
            </option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            className={styles.input}
            name={name}
            aria-label={ariaLabel ?? label ?? placeholder}
            aria-describedby={effectiveHelp ? helpId : undefined}
            aria-invalid={effectiveStatus === "error" || undefined}
            data-empty={isEmpty ? true : undefined}
            placeholder={placeholder}
            value={value}
            disabled={loading}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onSubmit ? (e) => e.key === "Enter" && onSubmit() : undefined}
          />
        )}

        <div className={styles.suffix}>
          {isSelect && !loading && <ChevronDown />}
          {isSearch && !loading && <SearchIcon />}
          {clearable && !loading && !isSelect && !isSearch && value && (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label="Clear"
              onClick={() => {
                onClear?.();
                onChange?.("");
                inputRef.current?.focus();
              }}
            >
              <Clear />
            </button>
          )}
          <Info />
          <span className={styles.divider} />
          <StatusIcon status={effectiveStatus} />
        </div>
      </div>

      {showHelp && (
        <div className={styles.help} data-tone={effectiveTone}>
          {effectiveHelp && (
            <p id={helpId} className={styles.helpText}>
              {effectiveHelp}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
