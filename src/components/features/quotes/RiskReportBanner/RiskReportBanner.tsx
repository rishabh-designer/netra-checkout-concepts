"use client";

import { useState } from "react";
import type { RiskReportBannerContent } from "@/types/quotesPage";
import styles from "./RiskReportBanner.module.css";

export interface RiskReportBannerProps {
  content: RiskReportBannerContent;
  /** true when the user already chose "Yes" in the flow → start in the sent state. */
  sent?: boolean;
}

/** Split `text` around the first occurrence of `mark` → [before, mark, after]. */
function split(text: string, mark: string): [string, string, string] {
  const i = mark ? text.indexOf(mark) : -1;
  if (i < 0) return [text, "", ""];
  return [text.slice(0, i), mark, text.slice(i + mark.length)];
}

/**
 * RiskReportBanner — the risk-report offer at the foot of the Help Desk stack
 * (Figma 584:44155): a centred serif question whose tail is purple italic on
 * its own line, a cropped preview of the report, and "Send Risk Report". Once
 * sent (or when the user answered "Yes" in the flow) the heading flips to
 * "…sent to your Inbox!" and the button goes away.
 * Usage: <RiskReportBanner content={riskReport} sent={interest==="Yes"} />
 */
export function RiskReportBanner({ content, sent = false }: RiskReportBannerProps) {
  const [isSent, setIsSent] = useState(sent);
  const [before, em, after] = isSent
    ? split(content.sentText, content.sentEmphasis)
    : split(content.question, content.emphasis);

  return (
    <div className={styles.banner} data-sent={isSent || undefined}>
      <h2 className={styles.heading}>
        {before}
        <span className={styles.em}>{em}</span>
        {after}
      </h2>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.visualSrc} alt={content.visualAlt} className={styles.visual} />
      {!isSent && (
        <button type="button" className={styles.cta} onClick={() => setIsSent(true)}>
          <span>{content.ctaLabel}</span>
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
            <path d="M6.65 2.65a.5.5 0 0 1 .7 0l3 3a.5.5 0 0 1 0 .7l-3 3a.5.5 0 0 1-.7-.7L8.79 6.5H2a.5.5 0 0 1 0-1h6.79L6.65 3.35a.5.5 0 0 1 0-.7Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
