import type { SVGProps } from "react";

export interface DownloadIconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** Rendered size in px: the label's font size (house rule). */
  size?: number;
}

/**
 * DownloadIcon — a button's leading download mark: an arrow dropping into a
 * tray, a 16 box and a 1.4 round stroke in currentColor (like ArrowRight).
 * Usage: <DownloadIcon size={14} />
 */
export function DownloadIcon({ size = 16, ...rest }: DownloadIconProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden {...rest}>
      <path d="M8 2.5v7.5M4.8 7l3.2 3.2L11.2 7M2.5 11v1.5c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
