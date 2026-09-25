import styles from "./IndicatorBadge.module.css";

export interface IndicatorBadgeProps {
  label?: string;
  /** indicator = teal "New" (default); success / info / caution / disabled =
   *  the quote-rating chips (Figma 584:45338 / 45382 / 45476 / 45508). */
  tone?: "indicator" | "success" | "info" | "caution" | "disabled";
  /** md = 14px label (default); sm = 12px label, 2px dot gap. */
  size?: "md" | "sm";
}

/**
 * IndicatorBadge — small "active" badge: a 4px dot + label on a soft tinted
 * chip. Tones recolour the chip/dot; `disabled` also greys the label.
 * Usage: <IndicatorBadge label="New" />
 *        <IndicatorBadge label="Excellent" tone="success" size="sm" />
 */
export function IndicatorBadge({ label = "New", tone = "indicator", size = "md" }: IndicatorBadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone} data-size={size}>
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </span>
  );
}
