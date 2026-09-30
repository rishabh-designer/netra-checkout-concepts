import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Box edge: 16 (default) or 12 (the checkout footer's consent). */
  size?: 16 | 12;
}

/**
 * Checkbox — the one consent tick: a real checkbox drawn as a white r4 box
 * with a faint ring, filled brand purple with a white tick when checked, and
 * a focus ring for the keyboard. Used by the checkout consent (StepConsent)
 * and the quote form's consent.
 * Usage: <label><Checkbox checked={c} onChange={toggle} /> I agree</label>
 */
export function Checkbox({ size = 16, className, ...rest }: CheckboxProps) {
  return <input type="checkbox" className={cn(styles.box, className)} data-size={size} {...rest} />;
}
