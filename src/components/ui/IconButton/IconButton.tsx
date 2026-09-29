import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** The accessible name, and the hover tooltip. */
  label: string;
  /** "md" 24 square (a drawer's or modal's controls), "sm" 18 (pagers, disclosure chevrons). */
  size?: "md" | "sm";
  /** Turns the glyph over (a disclosure chevron's open state). */
  open?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * IconButton — the boxed icon control (Figma chevron.controls, r6 → 8): white,
 * a subtle hairline, the glyph in secondary ink (currentColor), lilac on
 * hover, and a 44px-tall hit area. 24 square for a drawer's or modal's
 * controls, 18 for pagers and disclosure chevrons.
 * Usage: <IconButton label="Back" onClick={back}><Chevron dir="left" /></IconButton>
 */
export function IconButton({ label, size = "md", open, className, children, ref, type = "button", ...rest }: IconButtonProps) {
  return (
    <button ref={ref} type={type} className={cn(styles.button, className)} data-size={size} data-open={open || undefined} aria-label={label} data-tooltip={label} {...rest}>
      {children}
    </button>
  );
}

/**
 * IconBox — IconButton's look for a glyph inside a larger control (the whole
 * row is the button, so no button nests in it): decorative, and it doesn't
 * take the pointer.
 * Usage: <IconBox size="sm" open={open}><Chevron dir="up" size={12} /></IconBox>
 */
export function IconBox({ size = "md", open, className, children }: Pick<IconButtonProps, "size" | "open" | "className" | "children">) {
  return (
    <span className={cn(styles.button, className)} data-box data-size={size} data-open={open || undefined} aria-hidden>
      {children}
    </span>
  );
}

/**
 * CloseButton — the × every drawer and modal closes with: a 24 IconButton
 * holding a 16px cross.
 * Usage: <CloseButton label={content.closeLabel} onClick={onClose} />
 */
export function CloseButton(props: Omit<IconButtonProps, "children" | "size">) {
  return (
    <IconButton {...props}>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </IconButton>
  );
}
