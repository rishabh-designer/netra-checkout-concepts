"use client";

import { useRef } from "react";
import type { QuotesHeaderContent } from "@/types/quotesPage";
import { MailIcon, type MailIconHandle } from "@/components/icons/MailIcon";
import styles from "./QuotesHeader.module.css";

export interface QuotesHeaderProps {
  content: QuotesHeaderContent;
}

/**
 * QuotesHeader — the Quotes page's slim top bar: BimaKavach logotype on the
 * left, a single purple "Mail Quotes" CTA on the right (Figma 584:44872;
 * the mail icon leads the label and animates while the button is hovered). Usage: <QuotesHeader content={content.header} />
 */
export function QuotesHeader({ content }: QuotesHeaderProps) {
  const mailRef = useRef<MailIconHandle>(null);
  return (
    <header className={styles.bar}>
      <a href="/directors-and-officers-insurance" className={styles.logo} aria-label={content.logoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.logoSrc} alt={content.logoAlt} />
      </a>
      <button
        type="button"
        className={styles.cta}
        onMouseEnter={() => mailRef.current?.startAnimation()}
        onMouseLeave={() => mailRef.current?.stopAnimation()}
      >
        <MailIcon ref={mailRef} size={12} aria-hidden className={styles.ctaIcon} />
        <span>{content.ctaLabel}</span>
      </button>
    </header>
  );
}
