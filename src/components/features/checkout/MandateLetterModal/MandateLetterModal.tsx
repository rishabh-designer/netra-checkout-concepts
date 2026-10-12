"use client";

import type { CheckoutMandateContent } from "@/types/checkout";
import { SideDrawer } from "@/components/ui/SideDrawer";
import styles from "./MandateLetterModal.module.css";

export interface MandateLetterModalProps {
  open: boolean;
  onClose: () => void;
  content: CheckoutMandateContent["letter"];
  /** Who gives the mandate, named in the letter. */
  company: string;
  logoSrc: string;
  logoAlt: string;
}

/**
 * MandateLetterModal — a plain letter preview of the broker mandate that
 * Verification's tick agrees to: the logotype, date, addressee, subject, the
 * body, and the company's sign-off. A prototype sheet, not the legal copy.
 * Usage: <MandateLetterModal open={o} onClose={fn} content={mandate.letter} company="…" logoSrc="…" logoAlt="…" />
 */
export function MandateLetterModal({ open, onClose, content, company, logoSrc, logoAlt }: MandateLetterModalProps) {
  const fill = (t: string) => t.replace("{company}", company);
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <SideDrawer open={open} onClose={onClose} title={content.title} closeLabel={content.closeLabel} placement="center" width={560}>
      <article className={styles.sheet}>
        <header className={styles.head}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt={logoAlt} className={styles.logo} />
          <span className={styles.date}>{content.dateLabel.replace("{date}", date)}</span>
        </header>
        <p className={styles.to}>
          {content.to.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <p className={styles.subject}>{content.subject}</p>
        {content.paragraphs.map((p) => (
          <p key={p} className={styles.para}>
            {fill(p)}
          </p>
        ))}
        <footer className={styles.sign}>
          <span>{fill(content.signOff)}</span>
          <span className={styles.line} aria-hidden />
          <span className={styles.signatory}>{content.signatory}</span>
        </footer>
      </article>
    </SideDrawer>
  );
}
