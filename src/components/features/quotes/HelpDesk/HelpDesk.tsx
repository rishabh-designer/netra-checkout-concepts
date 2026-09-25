import type { NeedHelpContent, RiskReportBannerContent, TestimonialContent } from "@/types/quotesPage";
import { RiskReportBanner } from "../RiskReportBanner";
import { TestimonialCard } from "../TestimonialCard";
import styles from "./HelpDesk.module.css";

export interface HelpDeskProps {
  content: NeedHelpContent;
  testimonial: TestimonialContent;
  riskReport: RiskReportBannerContent;
  /** "Yes" | "No" | "" from the flow; "Yes" starts the risk report as sent. */
  reportInterest?: string;
}

/**
 * HelpDesk — the fixed right column of the Quotes page (Figma 584:44134): a
 * stack of the "Need Help?" card (expert photos + tap-to-call pill), the
 * testimonial and the risk-report offer, split by hairline rules, with a
 * "Chat with Us" CTA (593:64948) pinned to the bottom. The stack scrolls on
 * short screens; the CTA stays put.
 * Usage: <HelpDesk content={feed.needHelp} testimonial={feed.testimonial} riskReport={feed.riskReport} />
 */
export function HelpDesk({ content, testimonial, riskReport, reportInterest }: HelpDeskProps) {
  const tel = content.phone.replace(/[^+\d]/g, "");
  return (
    <aside className={styles.column}>
      <div className={styles.stack}>
        <div className={styles.card}>
          <div className={styles.top}>
            <div className={styles.text}>
              <p className={styles.title}>{content.title}</p>
              <p className={styles.sub}>{content.subtitle}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.avatarsSrc} alt={content.avatarsAlt} className={styles.avatars} />
          </div>
          <a href={`tel:${tel}`} className={styles.phone}>
            <span>{content.phone}</span>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
              <path
                d="M5.5 3.2 6.7 5a1 1 0 0 1-.2 1.3l-.9.7a7 7 0 0 0 3.4 3.4l.7-.9a1 1 0 0 1 1.3-.2l1.8 1.2a1 1 0 0 1 .3 1.3l-.6 1c-.3.5-.9.8-1.5.7C7.6 13.6 2.4 8.4 1.5 3.8 1.4 3.2 1.7 2.6 2.2 2.3l1-.6a1 1 0 0 1 1.3.3l1 1.2Z"
                fill="var(--color-brand-primary)"
              />
            </svg>
          </a>
        </div>
        <hr className={styles.rule} />
        <TestimonialCard content={testimonial} />
        <hr className={styles.rule} />
        <RiskReportBanner content={riskReport} sent={reportInterest === "Yes"} />
      </div>
      <button type="button" className={styles.chat}>
        <span>{content.chatLabel}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.chatIconSrc} alt="" aria-hidden className={styles.chatIcon} />
      </button>
    </aside>
  );
}
