import type { QuotesHeaderContent } from "@/types/quotesPage";
import styles from "./QuotesHeader.module.css";

export interface QuotesHeaderProps {
  content: QuotesHeaderContent;
}

/**
 * QuotesHeader — the Quotes page's slim top bar: BimaKavach logotype on the
 * left, a single orange "Chat with Us" CTA on the right (lighter than the
 * marketing Navbar). Usage: <QuotesHeader content={content.header} />
 */
export function QuotesHeader({ content }: QuotesHeaderProps) {
  return (
    <header className={styles.bar}>
      <a href="/directors-and-officers-insurance" className={styles.logo} aria-label={content.logoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.logoSrc} alt={content.logoAlt} />
      </a>
      <button type="button" className={styles.cta}>
        <span>{content.ctaLabel}</span>
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
          <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}
