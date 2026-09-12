import { cn } from "@/lib/utils";
import styles from "./TagPill.module.css";

export interface TagPillProps {
  label?: string;
  /** success = green "Immediate Purchase" style; special = teal gradient style. */
  variant?: "success" | "special";
  /** Icon slot (12px). Omit to render the design's grey placeholder square. */
  icon?: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
}

/**
 * TagPill — a small gradient product tag with a 12px icon slot and label.
 * Usage: <TagPill label="Immediate Purchase" variant="success" />
 */
export function TagPill({
  label = "Tag",
  variant = "success",
  icon,
  onMouseEnter,
  onMouseLeave,
  className,
}: TagPillProps) {
  return (
    <div
      className={cn(styles.pill, styles[variant], className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={styles.iconSlot}>{icon ?? <span className={styles.placeholder} />}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
