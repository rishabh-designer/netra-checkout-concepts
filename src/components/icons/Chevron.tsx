import type { SVGProps } from "react";

const PATHS = {
  down: "m4 6 4 4 4-4",
  up: "m4 10 4-4 4 4",
  left: "M10 4 6 8l4 4",
  right: "m6 4 4 4-4 4",
} as const;

export interface ChevronProps extends Omit<SVGProps<SVGSVGElement>, "color" | "ref"> {
  /** Which way it points. */
  dir?: keyof typeof PATHS;
  /** Rendered size in px; the stroke scales with it (1.5 at 16, 1.1 at 12). */
  size?: number;
  /** Stroke colour, currentColor by default. */
  color?: string;
}

/**
 * Chevron — the one chevron glyph: a 16 box, a 1.5 round stroke, any
 * direction and size. Rotate it in CSS to show an open state.
 * Usage: <Chevron dir="right" size={12} />
 */
export function Chevron({ dir = "down", size = 16, color = "currentColor", ...rest }: ChevronProps) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden {...rest}>
      <path d={PATHS[dir]} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
