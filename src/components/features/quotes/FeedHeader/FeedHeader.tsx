import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import type { QuotesFeedContent } from "@/types/quotesPage";
import styles from "./FeedHeader.module.css";

export interface FeedHeaderProps {
  content: QuotesFeedContent;
}

/**
 * FeedHeader — the top of the right feed: breadcrumb + icon/title on the left,
 * the "Need Help?" expert banner (avatars + phone) on the right.
 * Usage: <FeedHeader content={feed} />
 */
export function FeedHeader({ content }: FeedHeaderProps) {
  const { needHelp } = content;
  const tel = needHelp.phone.replace(/[^+\d]/g, "");
  return (
    <header className={styles.header}>
      <div className={styles.lead}>
        <BreadcrumbTrail items={content.breadcrumb} />
        <div className={styles.titleRow}>
          {content.iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.iconSrc} alt="" className={styles.icon} />
          ) : (
            <span className={styles.icon} aria-hidden />
          )}
          <h1 className={styles.title}>{content.title}</h1>
        </div>
      </div>

      <div className={styles.needHelp}>
        <div className={styles.needTop}>
          <div className={styles.needText}>
            <p className={styles.needTitle}>{needHelp.title}</p>
            <p className={styles.needSub}>{needHelp.subtitle}</p>
          </div>
          <div className={styles.avatars}>
            {Array.from({ length: needHelp.avatarCount }, (_, i) => (
              <span key={i} className={styles.avatar} style={{ zIndex: needHelp.avatarCount - i }} />
            ))}
          </div>
        </div>
        <a href={`tel:${tel}`} className={styles.phone}>
          <span>{needHelp.phone}</span>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
            <path
              d="M5.5 3.2 6.7 5a1 1 0 0 1-.2 1.3l-.9.7a7 7 0 0 0 3.4 3.4l.7-.9a1 1 0 0 1 1.3-.2l1.8 1.2a1 1 0 0 1 .3 1.3l-.6 1c-.3.5-.9.8-1.5.7C7.6 13.6 2.4 8.4 1.5 3.8 1.4 3.2 1.7 2.6 2.2 2.3l1-.6a1 1 0 0 1 1.3.3l1 1.2Z"
              fill="var(--color-brand-primary)"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}
