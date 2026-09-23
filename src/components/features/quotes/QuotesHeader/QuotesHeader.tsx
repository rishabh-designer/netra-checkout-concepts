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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={content.ctaIconSrc} alt="" className={styles.ctaIcon} />
      </button>
    </header>
  );
}
