"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { CheckoutSuccessContent } from "@/types/checkout";
import styles from "./RiskLetterPreview.module.css";

export interface RiskLetterPreviewProps {
  content: CheckoutSuccessContent["riskHeld"]["preview"];
  /** Who the policy is for, in the letter's header. */
  company: string;
  label: string;
}

/* Skeleton row widths (Figma 683:56668): label bar, value bar. */
const ROWS: [number, number][] = [
  [113, 140],
  [113, 181],
  [113, 231],
  [113, 161],
  [113, 104],
  [113, 217],
];
/* The stage's drawn size (Figma 683:56607); narrower boxes scale it down whole. */
const STAGE_W = 484;

/* The row where the caret types (a blue cursor over a pale highlight). */
const TYPING = 4;
const SUMMARY = [343, 259, 254, 352, 334, 286, 321, 259];

function Sheet({ children, back = false }: { children: React.ReactNode; back?: boolean }) {
  return <div className={back ? styles.backSheet : styles.sheet}>{children}</div>;
}

function Rows() {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.barLilac} style={{ width: 140 }} />
      </div>
      <div className={styles.rows}>
        {ROWS.map(([a, b], i) => (
          <div key={i} className={styles.row}>
            <span className={i % 2 ? styles.barLight : styles.bar} style={{ width: a }} />
            <span className={i % 2 ? styles.bar : styles.barLight} style={{ width: b }} />
            {i === TYPING && (
              <span className={styles.typing} aria-hidden>
                <span className={styles.caret} />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RiskLetterPreview — the Risk Held Letter popup's illustration (Figma
 * 683:56607), drawn in code so it names the customer's company: a back sheet
 * (a risk report, turned -11°) behind the letter itself — a header with the
 * BimaKavach mark, "Risk Held Letter" and the policy line, a section of
 * skeleton rows with a still caret in one, an Executive Summary, and an
 * orange pointer. Decorative; the container labels it. Drawn at 484 × 300
 * and scaled down as one piece when its box is narrower (phones).
 * Usage: <RiskLetterPreview content={riskHeld.preview} company="Pepe Jeans…" label="…" />
 */
export function RiskLetterPreview({ content, company, label }: RiskLetterPreviewProps) {
  const fitRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / STAGE_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={fitRef} className={styles.fit} style={{ "--stage-scale": scale } as CSSProperties}>
    <div className={styles.stage} role="img" aria-label={label}>
      <Sheet back>
        <div className={styles.backHead}>
          <span className={styles.mark} aria-hidden />
          <div>
            <p className={styles.backEyebrow}>{content.backEyebrow}</p>
            <p className={styles.backTitle}>{content.backTitle}</p>
          </div>
        </div>
        <Rows />
      </Sheet>
      <Sheet>
        <div className={styles.head}>
          <span className={styles.mark} aria-hidden />
          <p className={styles.title}>{content.title}</p>
          <p className={styles.for}>{content.forLabel.replace("{company}", company)}</p>
        </div>
        <Rows />
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.summaryLabel}>{content.summaryLabel}</span>
          </div>
          <div className={styles.summary}>
            {SUMMARY.map((w, i) => (
              <span key={i} className={i % 3 === 1 ? styles.bar : styles.barLight} style={{ width: w }} />
            ))}
          </div>
        </div>
        <svg viewBox="0 0 16 16" width="16" height="16" className={styles.pointer} aria-hidden>
          <path
            d="M8.88 15.67c-.15 0-.3-.01-.44-.04-.96-.17-1.93-.95-1.93-2.3V9.15H2.35C.99 9.15.21 8.18.04 7.22-.14 6.27.26 5.09 1.52 4.61L12.23.17c.96-.36 1.99-.14 2.7.57.71.71.93 1.74.58 2.68L11.05 14.17c-.4 1.06-1.31 1.5-2.17 1.5Z"
            fill="var(--color-brand-secondary)"
          />
        </svg>
      </Sheet>
    </div>
    </div>
  );
}
