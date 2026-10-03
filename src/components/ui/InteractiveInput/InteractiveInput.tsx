"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { ghostFor } from "@/lib/completions";
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
export type HelpTone = "neutral" | "error" | "success" | "basic";

export interface InteractiveInputProps {
  label?: string;
  mandatory?: boolean;
  /** Show the label row. Defaults to whether a `label` is given. */
  showLabel?: boolean;
  placeholder?: string;
  /** Fixed affix ("+91", "₹") — always label-disabled grey with a right divider. */
  prefix?: string;
  helpText?: string;
  /** Inline link after the help text. */
  helpAction?: { label: string; onClick: () => void };
  helpTone?: HelpTone;
  /** "end" right-aligns the help line (a quiet nudge, not a warning). */
  helpAlign?: "start" | "end";
  /** Reserve the help row (28px). Its text toggles, but the row never shifts height. */
  showHelp?: boolean;
  /** "textarea" = multi-line (e.g. an address); icons pin to the top. */
  control?: "text" | "select" | "search" | "textarea";
  options?: string[];
  value: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  /** Render the value as read-only text (e.g. a system-known company name). */
  readOnly?: boolean;
  /** Read-only and greyed (Figma disabled field): shown, not editable. */
  locked?: boolean;
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
  /** When set, the suffix info icon becomes a button that reveals this tooltip
   *  on hover/focus (Peetal DSL tooltip, Figma 3437:64324). */
  infoTooltip?: string;
  /** Click on the info icon (the tooltip still shows on hover/focus). */
  onInfoClick?: () => void;
  name?: string;
  ariaLabel?: string;
  /** Value type size: "sm" = 14px; "md" = 16px (DSL default, Figma 503:14272); "lg" = 18px
   *  (the hero lead field). Labels are always 12px. */
  size?: "sm" | "md" | "lg";
  /** "boxed" = hairline border on all sides, r12, white (checkout Billing,
   *  Figma 484:25880). Default is the DSL's bottom-stroke field. */
  variant?: "underline" | "boxed";
  /** HTML input type / inputmode hint for text controls. */
  inputMode?: "text" | "numeric" | "email" | "tel";
  maxLength?: number;
  /** Focus / blur of the text input (e.g. to validate on blur). */
  onFocus?: () => void;
  onBlur?: () => void;
  /** Keys in the text input, before Enter-to-submit; call preventDefault()
   *  to keep Enter from submitting (e.g. it picked a suggestion). */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** The text input drives a suggestion list (ARIA combobox). */
  combobox?: { listId: string; expanded: boolean; activeId?: string };
  /** Phrases to complete inline: the rest shows as a muted ghost after the
   *  caret; Tab, → or a click/tap on it fills it in. */
  completions?: string[];
}

/**
 * InteractiveInput — the Peetal DSL alphanumeric field. Three fixed-height
 * sections: label (+ red mandatory mark), the status-themed input wrapper
 * (fill + bottom stroke + suffix roundel), and a reserved help row whose text
 * toggles without ever shifting height. Interaction states (hover / active /
 * typing) are CSS-driven; `status` drives the data/validation accent + icon.
 * Shared by the hero lead field and the quote modal.
 * Usage: <InteractiveInput value={v} onChange={setV} status="empty" />
 *        <InteractiveInput size="lg" … />  // 18px value (hero field)
 */
export function InteractiveInput({
  label,
  mandatory,
  showLabel = !!label,
  placeholder,
  prefix,
  helpText,
  helpAction,
  helpTone = "neutral",
  helpAlign = "start",
  showHelp = false,
  control = "text",
  options,
  value,
  onChange,
  onClear,
  readOnly = false,
  locked = false,
  clearable = false,
  status = "empty",
  validate,
  autoFocusDesktop = false,
  active = false,
  onSubmit,
  infoTooltip,
  onInfoClick,
  name,
  ariaLabel,
  size = "md",
  variant = "underline",
  inputMode,
  maxLength,
  onFocus,
  onBlur,
  onKeyDown,
  combobox,
  completions,
}: InteractiveInputProps) {
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const uid = useId();
  const inputId = name ?? uid;
  const helpId = `${uid}-help`;
  const tipId = `${uid}-tip`;
  const [menuOpen, setMenuOpen] = useState(false);
  // Multi-line entry never scrolls: the textarea is as tall as its text,
  // re-measured as the value changes and whenever its width does (rewraps).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (control !== "textarea" || !el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };
    fit();
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return; // its own height change: ignore
      width = el.clientWidth;
      fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [control, value]);
  // Ghost completion: only while focused with the caret at the end, and only
  // while the text isn't scrolled (the ghost has to sit right after it).
  const [caretAtEnd, setCaretAtEnd] = useState(false);
  const trackCaret = () => {
    const el = inputRef.current;
    setCaretAtEnd(!!el && document.activeElement === el && el.selectionStart === el.value.length && el.selectionEnd === el.value.length && el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1);
  };
  const match = completions?.length && caretAtEnd ? ghostFor(value, completions) : null;
  const acceptGhost = () => {
    if (!match) return;
    onChange?.(match.accept);
    requestAnimationFrame(trackCaret);
  };
  const ghostKeys = (e: KeyboardEvent<HTMLElement>) => {
    if (match && !e.shiftKey && (e.key === "Tab" || e.key === "ArrowRight")) {
      e.preventDefault();
      acceptGhost();
    }
  };
  const caretEvents = completions?.length
    ? { onSelect: trackCaret, onKeyUp: trackCaret, onInput: () => requestAnimationFrame(trackCaret), onFocusCapture: () => requestAnimationFrame(trackCaret), onBlurCapture: () => setCaretAtEnd(false) }
    : {};
  // The field and its ghost share a box, so the ghost lines up with the text.
  const withGhost = (control: ReactNode) =>
    completions?.length ? (
      <span className={styles.control}>
        {control}
        {ghost}
      </span>
    ) : (
      control
    );
  const ghost = match && (
    <span className={styles.ghostMirror} aria-hidden>
      <span className={styles.ghostTyped}>{value}</span>
      <span
        className={styles.ghost}
        onPointerDown={(e) => {
          e.preventDefault(); // keep focus in the field
          acceptGhost();
        }}
      >
        {match.ghost}
      </span>
    </span>
  );

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
  const isTextarea = control === "textarea";
  const isEmpty = !value;

  return (
    <div className={styles.field} data-size={size} data-variant={variant}>
      {showLabel && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {mandatory && <span className={styles.req}>*</span>}
        </label>
      )}

      <div
        className={styles.wrapper}
        data-status={effectiveStatus}
        data-active={active || undefined}
        data-open={(isSelect && menuOpen) || undefined}
        data-multiline={isTextarea || undefined}
        data-locked={locked || undefined}
      >
        {prefix && (
          <span className={styles.prefix} aria-hidden>
            {prefix}
          </span>
        )}

        {readOnly || locked ? (
          <span className={styles.value} data-tooltip-overflow data-empty={isEmpty || undefined}>
            {value || placeholder}
          </span>
        ) : isSelect ? (
          <SelectMenu
            id={inputId}
            value={value}
            options={options ?? []}
            placeholder={placeholder}
            onChange={onChange}
            disabled={loading}
            ariaLabel={ariaLabel ?? label}
            onOpenChange={setMenuOpen}
            // The chevron sits inside the trigger, so tapping it opens the list.
            adornment={
              loading ? undefined : (
                <span className={styles.chevron}>
                  <ChevronDown />
                </span>
              )
            }
            triggerClassName={styles.selectTrigger}
          />
        ) : isTextarea ? (
          withGhost(<textarea
            id={inputId}
            ref={inputRef}
            rows={2}
            className={styles.textarea}
            name={name}
            aria-label={ariaLabel ?? label ?? placeholder}
            aria-invalid={effectiveStatus === "error" || undefined}
            data-empty={isEmpty ? true : undefined}
            placeholder={placeholder}
            value={value}
            disabled={loading}
            maxLength={maxLength}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={ghostKeys}
            {...caretEvents}
          />)
        ) : (
          withGhost(<input
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
            inputMode={inputMode === "text" ? undefined : inputMode}
            maxLength={maxLength}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            role={combobox ? "combobox" : undefined}
            aria-autocomplete={combobox ? "list" : undefined}
            aria-expanded={combobox ? combobox.expanded : undefined}
            aria-controls={combobox?.listId}
            aria-activedescendant={combobox?.expanded ? combobox.activeId : undefined}
            autoComplete={combobox ? "off" : undefined}
            onKeyDown={(e) => {
              ghostKeys(e);
              if (e.defaultPrevented) return;
              onKeyDown?.(e);
              if (!e.defaultPrevented && e.key === "Enter") onSubmit?.();
            }}
            {...caretEvents}
          />)
        )}

        <div className={styles.suffix}>
          {isSearch && !loading && <SearchIcon />}
          {clearable && !loading && !isSelect && !isSearch && value && (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label="Clear"
              data-tooltip="Clear"
              onClick={() => {
                onClear?.();
                onChange?.("");
                inputRef.current?.focus();
              }}
            >
              <Clear />
            </button>
          )}
          {infoTooltip ? (
            // The app's one tooltip (TooltipLayer) shows the tip to the left;
            // the hidden copy reads it to screen readers.
            <>
              <button
                type="button"
                className={styles.infoBtn}
                aria-label="More information"
                aria-describedby={tipId}
                data-tooltip={infoTooltip}
                data-tooltip-wrap
                data-tooltip-side="left"
                onClick={onInfoClick}
              >
                <Info />
              </button>
              <span id={tipId} hidden>
                {infoTooltip}
              </span>
            </>
          ) : (
            <Info />
          )}
          <span className={styles.divider} />
          <StatusIcon status={effectiveStatus} />
        </div>
      </div>

      {showHelp && (
        <div className={styles.help} data-tone={effectiveTone} data-align={helpAlign === "end" && !validationError ? "end" : undefined}>
          {effectiveHelp && (
            <p id={helpId} className={styles.helpText} data-tooltip-overflow>
              {effectiveHelp}
              {helpAction && !validationError && (
                <>
                  {" "}
                  <button type="button" className={styles.helpAction} onClick={helpAction.onClick}>
                    {helpAction.label}
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
