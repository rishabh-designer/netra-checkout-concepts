"use client";

import Link from "next/link";
import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import styles from "./BackButton.module.css";

export interface BackButtonProps {
  children: ReactNode;
  /** A link when set; otherwise a button that calls `onClick`. */
  href?: string;
  onClick?: () => void;
  className?: string;
  ref?: Ref<HTMLAnchorElement & HTMLButtonElement>;
}

/**
 * BackButton — the lilac-outlined "← Back to …" chip (Checkout, Gold
 * Inquiry, Compare): 12px SemiBold muted purple, arrow first, tinted on hover.
 * Usage: <BackButton href="/quotes">Back to Quotes</BackButton>
 */
export function BackButton({ children, href, onClick, className, ref }: BackButtonProps) {
  const inner = (
    <>
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
        <path d="M10 6H2m3-3L2 6l3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </>
  );
  return href ? (
    <Link ref={ref} href={href} className={cn(styles.back, className)} onClick={onClick}>
      {inner}
    </Link>
  ) : (
    <button ref={ref} type="button" className={cn(styles.back, className)} onClick={onClick}>
      {inner}
    </button>
  );
}
