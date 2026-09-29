import type { SVGProps } from "react";

export interface ArrowRightProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** Rendered size in px: the label's font size (house rule). */
  size?: number;
}

/**
 * ArrowRight — the one static arrow for a button's trailing icon: a 16 box
 * and a 1.4 round stroke in currentColor. Size it to the label.
 * Usage: <ArrowRight size={14} />
 */
export function ArrowRight({ size = 16, ...rest }: ArrowRightProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden {...rest}>
      <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
