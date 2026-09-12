import styles from "./IndicatorBadge.module.css";

export interface IndicatorBadgeProps {
  label?: string;
}

/**
 * IndicatorBadge — small "active" badge: green dot + label on a soft green chip.
 * Usage: <IndicatorBadge label="New" />
 */
export function IndicatorBadge({ label = "New" }: IndicatorBadgeProps) {
  return (
    <span className={styles.badge}>
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
