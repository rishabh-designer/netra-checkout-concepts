import type { UpgradeBannerContent } from "@/types/quotesPage";
import styles from "./UpgradeBanner.module.css";

export interface UpgradeBannerProps {
  content: UpgradeBannerContent;
}

/**
 * UpgradeBanner — the "Ready to Upgrade?" panel pinned under the details list:
 * a serif italic heading, a status line, a live progress bar with a % + time
 * left, and a "Notify Me" action. Its own component (the design owner is
 * expanding its behavior). Usage: <UpgradeBanner content={upgrade} />
 */
export function UpgradeBanner({ content }: UpgradeBannerProps) {
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
