"use client";

import { useRef, type ReactNode } from "react";
import type { QuotesHeaderContent } from "@/types/quotesPage";
import { MailIcon, type MailIconHandle } from "@/components/icons/MailIcon";
import styles from "./QuotesHeader.module.css";

export interface QuotesHeaderProps {
  content: QuotesHeaderContent;
  /** Where the logotype links (defaults to the landing page). */
  logoHref?: string;
  /** Leading CTA icon; defaults to the animated mail icon (Mail Quotes). */
  icon?: ReactNode;
}

/**
 * QuotesHeader — the Quotes page's slim top bar: BimaKavach logotype on the
 * left, a single purple "Mail Quotes" CTA on the right (Figma 584:44872;
 * the mail icon leads the label and animates while the button is hovered).
 * Checkout reuses it with "Contact Support" and a headset icon.
 * Usage: <QuotesHeader content={content.header} />
 */
export function QuotesHeader({ content, logoHref = "/directors-and-officers-insurance", icon }: QuotesHeaderProps) {
  const mailRef = useRef<MailIconHandle>(null);
  return (
    <header className={styles.bar}>
      <a href={logoHref} className={styles.logo} aria-label={content.logoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.logoSrc} alt={content.logoAlt} />
      </a>
      <button
        type="button"
        className={styles.cta}
        onMouseEnter={() => mailRef.current?.startAnimation()}
        onMouseLeave={() => mailRef.current?.stopAnimation()}
      >
        {icon ?? <MailIcon ref={mailRef} size={12} aria-hidden className={styles.ctaIcon} />}
        <span>{content.ctaLabel}</span>
      </button>
    </header>
  );
}
