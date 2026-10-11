"use client";

import type { ReactNode } from "react";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { CloseButton } from "@/components/ui/IconButton";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { Cross, Tick } from "../RiskScore";
import styles from "./ScoreIntro.module.css";

export interface ScoreIntroProps {
  open: boolean;
  onClose: () => void;
  /** The banner's title and copy for this case ("You're Upgraded!"). */
  title: string;
  body: string;
  /** The Business Health badge, as the Score tab shows it. */
  badge: ReactNode;
  /** "11 Key Coverages & Exclusions". */
  listTitle: string;
  coverages: string[];
  exclusions: string[];
  /** The info line under the heading, the button and the ×'s name. */
  hint: string;
  ctaLabel: string;
  closeLabel: string;
}

/**
 * ScoreIntro — the popup that greets a verified business on arrival (Figma
 * 830:21946): left, the upgrade title and copy over the Business Health
 * badge on a warm dashed panel; right, the key coverages and exclusions the
 * quotes are matched against, in two columns, then an info line over Show
 * All, which closes it onto the quotes.
 * Usage: <ScoreIntro open={o} onClose={c} title="You're Upgraded!" body="…" badge={<RiskScoreBadge … />} … />
 */
export function ScoreIntro({ open, onClose, title, body, badge, listTitle, coverages, exclusions, hint, ctaLabel, closeLabel }: ScoreIntroProps) {
  return (
    <SideDrawer open={open} onClose={onClose} title={title} closeLabel={closeLabel} width={910} placement="center" bare className={styles.panel}>
      <div className={styles.modal}>
        <section className={styles.score}>
          <div className={styles.copy}>
            <p className={styles.title}>{title}</p>
            <p className={styles.body}>{body}</p>
          </div>
          <div className={styles.badge}>{badge}</div>
        </section>

        <section className={styles.lines}>
          <div className={styles.section}>
            <div className={styles.head}>
              <h2 className={styles.listTitle}>{listTitle}</h2>
              <CloseButton label={closeLabel} onClick={onClose} className={styles.close} />
            </div>
            <hr className={styles.rule} />
            <div className={styles.columns}>
              <ul className={styles.items}>
                {coverages.map((label) => (
                  <li key={label} className={styles.item}>
                    <span className={styles.mark}><Tick size={10} /></span>
                    {label}
                  </li>
                ))}
              </ul>
              <ul className={styles.items}>
                {exclusions.map((label) => (
                  <li key={label} className={styles.item}>
                    <span className={styles.mark}><Cross size={10} /></span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.foot}>
            <hr className={styles.rule} />
            <p className={styles.hint}>
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                <circle cx="6" cy="6" r="5.35" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="6" cy="3.7" r="0.7" fill="currentColor" />
                <path d="M6 5.6v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              {hint}
            </p>
            <button type="button" className={styles.cta} onClick={onClose}>
              {ctaLabel}
              <ArrowRight size={12} />
            </button>
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}
