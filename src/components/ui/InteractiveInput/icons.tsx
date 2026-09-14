import styles from "./icons.module.css";

/**
 * Shared field icons for the Peetal DSL input components (InteractiveInput,
 * SegmentedField) and the quote modal. One source of truth so every field
 * across the app renders the same status roundels, spinner, and affordances.
 */

/** Canonical status of a DSL field (drives the suffix icon + accent theming). */
export type FieldStatus =
  | "empty" // default / to-fill — muted grey check
  | "verified" // system-known (modal Name) — purple check, purple ink
  | "success" // exact match / validated — green check
  | "userFilled" // reviewing user-supplied data — purple check, basic ink
  | "fuzzy" // web-guessed — orange "!"
  | "error" // invalid — red "×"
  | "loading"; // probe in flight — spinner

/** Maps a status to its suffix roundel. `loading` renders the Spinner. */
export function StatusIcon({ status }: { status: FieldStatus }) {
  switch (status) {
    case "fuzzy":
      return <Alert />;
    case "error":
      return <ErrorMark />;
    case "loading":
      return <Spinner />;
    case "empty":
      // yet-to-fill = muted filled check roundel (grey + white tick), not a hollow dot.
      // --check-ink lets the wrapper darken it to "hint" on hover; falls back otherwise.
      return <FilledCheck color="var(--check-ink, var(--color-input-stroke))" />;
    case "success":
      return <FilledCheck color="var(--color-success)" />;
    // verified + userFilled both read as a brand-purple confirmation roundel;
    // the ink colour (purple vs basic) is themed by the wrapper, not the icon.
    default:
      return <FilledCheck color="var(--color-brand-primary)" />;
  }
}

/** Rotating ring spinner (probe / fetch in flight). */
export function Spinner() {
  return (
    <span className={styles.spinner} role="status" aria-label="Loading">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="var(--color-input-stroke)" strokeWidth="2" />
        <path
          d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
          stroke="var(--color-brand-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Filled roundel with a white tick, in an arbitrary colour. */
export function FilledCheck({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path
        d="m4.8 8.2 2 2 4-4.4"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Orange roundel with a "!" — a fuzzy / web-guessed value. */
export function Alert() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="var(--color-brand-secondary)" />
      <path d="M8 4.2v4.4" stroke="var(--color-label-inverse)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.2" r="0.95" fill="var(--color-label-inverse)" />
    </svg>
  );
}

/** Red roundel with a white "×" — an invalid value. */
export function ErrorMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="var(--color-error)" />
      <path
        d="m5.5 5.5 5 5m0-5-5 5"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hollow grey ring — an unselected segmented option. `--dot-ink` lets a hovered
 *  pill darken it to "hint"; falls back to the input stroke otherwise. */
export function MutedDot() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="var(--dot-ink, var(--color-input-stroke))" strokeWidth="1.4" />
    </svg>
  );
}

/** Info "(i)" affordance. */
export function Info() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="var(--color-info)" strokeWidth="1.3" />
      <circle cx="8" cy="5" r="0.9" fill="var(--color-info)" />
      <path d="M8 7.5v4" stroke="var(--color-info)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Clear "×" (small, for the clear-input button). */
export function Clear() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" stroke="var(--color-label-basic)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Chevron for a select control. */
export function ChevronDown() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="m4 6 4 4 4-4" stroke="var(--color-label-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Magnifier for a search control. */
export function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="var(--color-label-tertiary)" strokeWidth="1.5" />
      <path d="m11 11 3 3" stroke="var(--color-label-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
