import { cn } from "@/lib/utils";
import styles from "./SquareCheckbox.module.css";

/** DSL tones (Peetal DSL square checkbox, Figma 3467:3524). Only `info` is wired
 *  today; the rest are placeholders for when they're needed. */
export type SquareCheckboxTone = "info" | "brand" | "success" | "warning";
export type SquareCheckboxState = "checked" | "indeterminate" | "unchecked";

export interface SquareCheckboxProps {
  /** Colour tone; drives fill + ring + glow. Defaults to `info`. */
  tone?: SquareCheckboxTone;
  /** checked (tick), indeterminate (minus), or unchecked (empty outline). */
  state?: SquareCheckboxState;
  /** Box edge in px (aspect square). Defaults to 16. */
  size?: number;
  className?: string;
}

/**
 * SquareCheckbox — the Peetal DSL square checkbox (Figma 3467:3524). A rounded
 * square whose filled states (checked / indeterminate) carry a tone fill, a soft
 * same-tone glow, and a light inner ring; unchecked is an empty outlined box.
 * Presentational only (no input) — pair with a real control for interactivity.
 * Usage: <SquareCheckbox tone="info" state="checked" />
 */
export function SquareCheckbox({
  tone = "info",
  state = "checked",
  size = 16,
  className,
}: SquareCheckboxProps) {
  const filled = state !== "unchecked";
  return (
    <span
      aria-hidden
      data-tone={tone}
      className={cn(styles.box, filled && styles.filled, className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
        {/* base square: filled tone, or an empty card box when unchecked */}
        <rect width="16" height="16" rx="4" className={styles.square} />
        {/* light inner ring (0.5px, inset) */}
        <rect x="0.75" y="0.75" width="14.5" height="14.5" rx="3.4" className={styles.ring} />
        {state === "checked" && (
          <path
            d="m4.8 8.2 2 2 4-4.4"
            className={styles.mark}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {state === "indeterminate" && (
          <path d="M4.5 8h7" className={styles.mark} strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </span>
  );
}
