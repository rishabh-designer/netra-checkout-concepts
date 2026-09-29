"use client";

import { useId, useState } from "react";
import styles from "./Disclaimer.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { IconButton } from "@/components/ui/IconButton";

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
        <IconButton size="sm" label={toggleLabel} open={open} aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((o) => !o)}>
          <Chevron size={14} />
        </IconButton>
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
