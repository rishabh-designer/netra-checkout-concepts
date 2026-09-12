import { cn } from "@/lib/utils";
import styles from "./IkkatMark.module.css";

export interface IkkatMarkProps {
  /** Which woven-diamond mark: 1 = outlined diamond, 2 = ornate cluster,
      3 = solid single bead (the divider mark, Figma 280:19402). */
  pattern?: 1 | 2 | 3;
  /** Any CSS color; defaults to the brand primary token. */
  color?: string;
  /** Width in px; height is locked to the source SVG's 2:1 aspect ratio. */
  width?: number;
  className?: string;
}

/**
 * IkkatMark — a single woven-diamond mark (see Context/ikkat-divider.md).
 * Shape comes from an SVG mask (Ikkat1/Ikkat2), color from CSS, and the height
 * is always derived from the width via the source's locked 2:1 aspect ratio.
 * Usage: <IkkatMark pattern={2} color="var(--color-brand-secondary)" width={8} />
 */
export function IkkatMark({ pattern = 1, color, width, className }: IkkatMarkProps) {
  return (
    <span
      aria-hidden
      data-pattern={pattern}
      className={cn(styles.mark, className)}
      style={
        {
          ...(color ? { "--ikkat-color": color } : {}),
          ...(width ? { width: `${width}px` } : {}),
        } as React.CSSProperties
      }
    />
  );
}
