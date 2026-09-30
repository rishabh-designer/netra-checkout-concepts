import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from "react";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { cn } from "@/lib/utils";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "primary" purple; "secondary" orange (BimaNetra's own actions: Gold,
   *  research); "outline" white with a purple label. */
  tone?: "primary" | "secondary" | "outline";
  /** A trailing arrow at the label's size (16) that nudges right on hover. */
  arrow?: boolean;
  /** Full width: the label on the left, the arrow on the right. */
  block?: boolean;
  /** The tooltip while it's disabled: why it's blocked. */
  blockedTip?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Button — the large action button (Figma 638:17439): 16/28, a hairline,
 * r16 → 24 (house rule), a 16px SemiBold label. Every step CTA, drawer save
 * and popup action uses it; disabled reads the same everywhere.
 * Usage: <Button arrow disabled={!ok} blockedTip="Fill in every field" onClick={next}>Continue</Button>
 */
export function Button({ tone = "primary", arrow, block, blockedTip, disabled, className, children, ref, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(styles.button, className)}
      data-tone={tone}
      data-arrow={arrow || undefined}
      data-block={block || undefined}
      disabled={disabled}
      data-tooltip={disabled ? blockedTip : undefined}
      {...rest}
    >
      {arrow ? <span>{children}</span> : children}
      {arrow && <ArrowRight size={16} className={styles.arrow} />}
    </button>
  );
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, Pick<ButtonProps, "tone" | "arrow" | "block"> {}

/**
 * ButtonLink — Button's look on a link (a tel: or a page), for an action
 * that navigates.
 * Usage: <ButtonLink tone="secondary" arrow block href="tel:…">Speak to an Expert</ButtonLink>
 */
export function ButtonLink({ tone = "primary", arrow, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <a className={cn(styles.button, className)} data-tone={tone} data-arrow={arrow || undefined} data-block={block || undefined} {...rest}>
      {arrow ? <span>{children}</span> : children}
      {arrow && <ArrowRight size={16} className={styles.arrow} />}
    </a>
  );
}
