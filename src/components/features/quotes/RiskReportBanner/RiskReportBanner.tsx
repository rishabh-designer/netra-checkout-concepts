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
 * RiskReportBanner — the offer banner (item 9 left). When the user answered "No"
 * (or hasn't answered), it invites them to get a customized Risk Report; the
 * emphasis tail is purple italic serif. When they answered "Yes" — or press
 * "Send Risk Report" — it flips to "…sent to your Inbox!" (that span purple
 * italic). Usage: <RiskReportBanner content={riskReport} sent={interest==="Yes"} />
 */
export function RiskReportBanner({ content, sent = false }: RiskReportBannerProps) {
  const [isSent, setIsSent] = useState(sent);
  const [before, em, after] = isSent
    ? split(content.sentText, content.sentEmphasis)
    : split(content.question, content.emphasis);

  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        <h2 className={styles.heading}>
          {before}
          <span className={styles.em}>{em}</span>
          {after}
        </h2>
        {!isSent && (
          <button type="button" className={styles.cta} onClick={() => setIsSent(true)}>
            <span>{content.ctaLabel}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
              <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={content.visualSrc} alt={content.visualAlt} className={styles.visual} />
    </div>
  );
}
