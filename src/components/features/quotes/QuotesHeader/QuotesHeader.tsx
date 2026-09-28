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
  onCta?: () => void;
  /** CTA copy in place of `content.ctaLabel` (e.g. once a one-shot is done). */
  label?: string;
  /** CTA fill: brand primary (default) or brand secondary (Ask BimaNetra). */
  tone?: "primary" | "secondary";
  /** The CTA reads as pressed (a toggle, e.g. the grid experiment). */
  ctaPressed?: boolean;
  /** Put `icon` after the label (an arrow, e.g. "Speak to an Expert →"). */
  iconAfter?: boolean;
  /** Outline instead of fill (Contact Support beside a primary action). */
  variant?: "fill" | "outline";
  /** A second, filled button before the CTA (Sign Mandate Letter). */
  leadCta?: { label: string; onClick: () => void };
}

/**
 * QuotesHeader — the Quotes page's slim top bar: BimaKavach logotype on the
 * left, a single purple "Mail Quotes" CTA on the right (Figma 584:44872;
 * the mail icon leads the label and animates while the button is hovered).
 * Checkout reuses it with "Contact Support" and a headset icon.
 * Usage: <QuotesHeader content={content.header} />
 */
export function QuotesHeader({ content, logoHref = "/directors-and-officers-insurance", icon, onCta, ctaPressed, iconAfter = false, label, tone = "primary", variant = "fill", leadCta }: QuotesHeaderProps) {
  const mailRef = useRef<MailIconHandle>(null);
  return (
    <header className={styles.bar}>
      <a href={logoHref} className={styles.logo} aria-label={content.logoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.logoSrc} alt={content.logoAlt} />
      </a>
      <div className={styles.actions}>
      {leadCta && (
        <button type="button" className={styles.cta} onClick={leadCta.onClick}>
          {leadCta.label}
        </button>
      )}
      <button
        type="button"
        className={styles.cta}
        data-tone={tone === "secondary" ? "secondary" : undefined}
        data-variant={variant === "outline" ? "outline" : undefined}
        onClick={onCta}
        aria-pressed={ctaPressed}
        onMouseEnter={() => mailRef.current?.startAnimation()}
        onMouseLeave={() => mailRef.current?.stopAnimation()}
      >
        {!iconAfter && (icon ?? <MailIcon ref={mailRef} size={12} aria-hidden className={styles.ctaIcon} />)}
        <span>{label ?? content.ctaLabel}</span>
        {iconAfter && icon}
      </button>
      </div>
    </header>
  );
}
