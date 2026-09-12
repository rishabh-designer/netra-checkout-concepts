import { cn } from "@/lib/utils";
import styles from "./IkkatLine.module.css";

export interface IkkatLineProps {
  /** Any CSS color; defaults to the brand primary token. */
  color?: string;
  className?: string;
}

/**
 * IkkatLine — the repeating diamond-studded rule (see Context/ikkat-divider.md).
 * A color-filled bar masked by a repeat-x tile that alternates the two ikkat
 * patterns; more diamonds appear as the container widens.
 * Usage: <IkkatLine className={styles.rule} />
 */
export function IkkatLine({ color, className }: IkkatLineProps) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn(styles.line, className)}
      style={color ? ({ "--ikkat-color": color } as React.CSSProperties) : undefined}
    />
  );
}
