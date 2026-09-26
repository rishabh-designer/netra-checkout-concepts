"use client";

import { useId, useState } from "react";
import styles from "./Disclaimer.module.css";

export interface DisclaimerProps {
  title: string;
  toggleLabel: string;
  paragraphs: string[];
}

/**
 * Disclaimer — the legal accordion under every checkout step (Figma 613:67716):
 * a muted title over a hairline rule with a boxed chevron, then the broker's
 * disclosures. Collapsed by default; the chevron opens it.
 * Usage: <Disclaimer title="Disclaimer" toggleLabel="…" paragraphs={[…]} />
 */
export function Disclaimer({ title, toggleLabel, paragraphs }: DisclaimerProps) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={toggleLabel}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden data-open={open || undefined}>
            <path d="M2.25 4.125 6 7.875l3.75-3.75" stroke="var(--color-brand-primary-deep)" strokeWidth="1.24" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {open && (
        <div id={bodyId} className={styles.body}>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      )}
    </section>
  );
}
