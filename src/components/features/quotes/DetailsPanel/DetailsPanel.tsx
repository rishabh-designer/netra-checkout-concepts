"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { DetailsPanelContent } from "@/types/quotesPage";
import { UpgradeBanner, type UpgradeStage } from "../UpgradeBanner";
import styles from "./DetailsPanel.module.css";

export interface DetailsPanelProps {
  content: DetailsPanelContent;
  /** Live flow values keyed by field; override the row defaults where present. */
  values?: Record<string, string>;
  /** Reopen the pre-filled lead flow. */
  onEdit?: () => void;
  /** Collapsed = narrow rail (icon + progress only). */
  collapsed?: boolean;
  /** Toggle the collapsed rail. */
  onToggleCollapse?: () => void;
  /** Verification stage: "pending" shows "Ready to Upgrade?" at the mock %,
   *  "verifying" runs the simulated count, "upgraded" shows "You're Upgraded!". */
  stage?: UpgradeStage;
  /** Hidden demo shortcut (click the %): start the simulated verification. */
  onSimulate?: () => void;
  /** The simulated count reached 100%. */
  onVerified?: () => void;
  /** Hidden demo shortcut (click "You're Upgraded!"): back to the start. */
  onReset?: () => void;
}

/** Panel toggle glyph — `[< |]` (collapse); flipped via CSS to `[| >]` (expand). */
function ToggleGlyph() {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden>
      <rect x="1.5" y="2.5" width="15" height="13" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.5 2.5v13" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 7l-2 2 2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * DetailsPanel — the left "Your Details" column (Figma 564:32918), full column
 * height. Expanded: a header (title + Edit Details + collapse toggle), the
 * entered detail rows (live values from the flow override the Case-C defaults)
 * and, pinned to the bottom, the upgrade banner: "Ready to Upgrade?" (click
 * the % to simulate verification) morphing into "You're Upgraded!".
 * Collapsed: a narrow rail showing only the (flipped) toggle and the progress %.
 * Usage: <DetailsPanel content={detailsPanel} values={values} onEdit={fn}
 *          collapsed={bool} onToggleCollapse={fn} />
 */
export function DetailsPanel({ content, values, onEdit, collapsed, onToggleCollapse, stage = "pending", onSimulate, onVerified, onReset }: DetailsPanelProps) {
  const reduced = useReducedMotion();
  const start = Math.max(0, Math.min(100, content.upgrade.percent));
  // One progress value for the banner and the collapsed rail.
  const progress = useMotionValue(stage === "upgraded" ? 100 : start);
  const railLabel = useTransform(progress, (v) => `${Math.round(v)}%`);
  const railWidth = useTransform(progress, (v) => `${v}%`);

  // Simulated verification: climbs with two believable stalls (~70%, ~90%),
  // holds a beat at 100% for the gold flash, then reports done.
  // Reset: the count eases back down to where verification started.
  useEffect(() => {
    if (stage !== "pending" || progress.get() === start) return;
    const controls = animate(progress, start, { duration: reduced ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== "verifying") return;
    let done = false;
    const controls = animate(progress, reduced ? 100 : [start, 68, 71, 89, 91, 100], {
      duration: reduced ? 0.01 : 2.8,
      times: reduced ? undefined : [0, 0.34, 0.5, 0.72, 0.84, 1],
      ease: "easeInOut",
    });
    controls.then(() => {
      if (done) return;
      window.setTimeout(() => !done && onVerified?.(), reduced ? 0 : 450);
    });
    return () => {
      done = true;
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);
  return (
    <aside className={styles.panel} data-collapsed={collapsed || undefined}>
      {/* Expanded layer — defines the panel height; clipped + faded when collapsed. */}
      <div className={styles.expanded} aria-hidden={collapsed}>
        <div className={styles.details}>
          <div className={styles.head}>
            <h2 className={styles.title}>{content.title}</h2>
            <div className={styles.headActions}>
              <button type="button" className={styles.edit} onClick={onEdit}>
                {content.editLabel}
              </button>
              <button
                type="button"
                className={styles.collapse}
                onClick={onToggleCollapse}
                aria-label="Collapse details"
                tabIndex={collapsed ? -1 : 0}
              >
                <ToggleGlyph />
              </button>
            </div>
          </div>

          <dl className={styles.rows}>
            {content.rows.map((row) => {
              const live = row.key ? values?.[row.key]?.trim() : "";
              return (
                <div key={row.label} className={styles.row}>
                  <dt className={styles.label}>{row.label}</dt>
                  <dd className={styles.value}>{live || row.value}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        <UpgradeBanner
          stage={stage}
          content={content.upgrade}
          upgraded={content.upgraded}
          progress={progress}
          onSimulate={onSimulate}
          onReset={onReset}
        />
      </div>

      {/* Collapsed rail — toggle at top, progress pinned to the bottom. */}
      <div className={styles.rail} aria-hidden={!collapsed}>
        <div className={styles.railTop}>
          <button
            type="button"
            className={styles.railToggle}
            onClick={onToggleCollapse}
            aria-label="Expand details"
            tabIndex={collapsed ? 0 : -1}
          >
            <ToggleGlyph />
          </button>
        </div>
        <div className={styles.railMeter}>
          <motion.span className={styles.railPercent}>{railLabel}</motion.span>
          <div className={styles.railTrack}>
            <motion.div className={styles.railFill} style={{ width: railWidth }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
