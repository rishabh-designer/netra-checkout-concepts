import type { UpgradeBannerContent, UpgradedBannerContent } from "@/types/quotesPage";
import styles from "./UpgradeBanner.module.css";

export type UpgradeBannerProps =
  | { variant?: "progress"; content: UpgradeBannerContent }
  | { variant: "upgraded"; upgraded: UpgradedBannerContent };

/**
 * UpgradeBanner — pinned under the details list. "progress" (default): "Ready
 * to Upgrade?" — serif italic heading, status line, live progress bar with a
 * % + time left, and "Notify Me". "upgraded" (Figma 564:32956, exact match):
 * "You're Upgraded!" in warm tan on a white → peach wash, no meter or action.
 * Usage: <UpgradeBanner content={upgrade} />
 *        <UpgradeBanner variant="upgraded" upgraded={upgraded} />
 */
export function UpgradeBanner(props: UpgradeBannerProps) {
  if (props.variant === "upgraded") {
    return (
      <div className={styles.upgradedBanner}>
        <p className={styles.upgradedTitle}>{props.upgraded.title}</p>
        <p className={styles.upgradedBody}>{props.upgraded.body}</p>
      </div>
    );
  }
  const { content } = props;
  const percent = Math.max(0, Math.min(100, content.percent));
  return (
    <div className={styles.banner}>
      <p className={styles.title}>{content.title}</p>
      <p className={styles.body}>{content.body}</p>
      <div className={styles.meterRow}>
        <span className={styles.percent}>{percent}%</span>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.timeLeft}>{content.timeLeft}</span>
        <button type="button" className={styles.cta}>
          {content.ctaLabel}
        </button>
      </div>
    </div>
  );
}
