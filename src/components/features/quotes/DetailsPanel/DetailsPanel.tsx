"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { DetailsPanelContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { InteractiveInput } from "@/components/ui/InteractiveInput";
import { NoRecordsBanner, UpgradeBanner, type UpgradeStage } from "../UpgradeBanner";
import { useDemoNotice } from "@/lib/demo-notice";
import styles from "./DetailsPanel.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { EASE_OUT } from "@/lib/motion";
import { useAtMost } from "@/lib/media";

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
  /** Verification already under way: the count starts here and only runs the
   *  last stretch to 100 (Case A, finishing as the page loads). */
  verifyFrom?: number;
  /** Hidden demo shortcut (click "You're Upgraded!"): back to the start. */
  onReset?: () => void;
  /** Case C: no public records, so no verification to show. */
  noRecords?: boolean;
  /** The flow case, for case-specific banner copy. */
  caseId?: QuoteCaseId;
  /** The company the quotes are for (the flow's typed name), shown at the
   *  banner's foot. Omitted off-flow. */
  companyName?: string;
}

/** Panel toggle glyph — `[< |]` (collapse); flipped via CSS to `[| >]` (expand). */
/* Below 1100px the page stacks, so the panel folds up and down (an
   accordion) instead of narrowing to a side rail. */

/** The accordion's chevron: down when folded, up when open. */
function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <Chevron style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.3s ease" }} />
  );
}

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
export function DetailsPanel({ content, values, onEdit, collapsed, onToggleCollapse, stage = "pending", onSimulate, onVerified, onReset, noRecords = false, verifyFrom, companyName, caseId }: DetailsPanelProps) {
  const accordion = useAtMost("stack");
  const notify = useDemoNotice();
  // Mobile: each time the accordion opens, the upgraded banner replays from
  // its dither reveal (counted as the panel opens, during render).
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);
  const [openCount, setOpenCount] = useState(0);
  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);
    if (accordion && !collapsed) setOpenCount((n) => n + 1);
  }
  const reduced = useReducedMotion();
  const start = Math.max(0, Math.min(100, content.upgrade.percent));
  // One progress value for the banner and the collapsed rail.
  const progress = useMotionValue(stage === "upgraded" ? 100 : stage === "verifying" && verifyFrom !== undefined ? verifyFrom : start);
  const railLabel = useTransform(progress, (v) => `${Math.round(v)}%`);
  const railWidth = useTransform(progress, (v) => `${v}%`);

  // Simulated verification: climbs with two believable stalls (~70%, ~90%),
  // holds a beat at 100% for the gold flash, then reports done.
  // Reset: the count eases back down to where verification started.
  useEffect(() => {
    if (stage !== "pending" || progress.get() === start) return;
    const controls = animate(progress, start, { duration: reduced ? 0.01 : 0.7, ease: EASE_OUT });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== "verifying") return;
    let done = false;
    // Resumed (verifyFrom): just the last stall and the climb to 100.
    const resumed = verifyFrom !== undefined;
    const controls = animate(progress, reduced ? 100 : resumed ? [verifyFrom, 91, 100] : [start, 68, 71, 89, 91, 100], {
      // Resumed: sized so Case A's slot turns live 3s after the page opens
      // (page boot + 1.5s skeleton + 0.85s count + a 0.2s beat at 100%).
      duration: reduced ? 0.01 : resumed ? 0.85 : 2.8,
      times: reduced ? undefined : resumed ? [0, 0.4, 1] : [0, 0.34, 0.5, 0.72, 0.84, 1],
      ease: "easeInOut",
    });
    controls.then(() => {
      if (done) return;
      window.setTimeout(() => !done && onVerified?.(), reduced ? 0 : resumed ? 200 : 450);
    });
    return () => {
      done = true;
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);
  // Who the quotes are for: a read-only verified field (purple name, info,
  // purple check), as in the hero's company search.
  const company = companyName ? (
    <InteractiveInput
      value={companyName}
      readOnly
      status="verified"
      size="sm"
      showLabel={false}
      showHelp={false}
      ariaLabel={content.companyLabel}
      infoTooltip={content.companyInfo}
    />
  ) : undefined;

  return (
    <aside className={styles.panel} data-collapsed={collapsed || undefined} data-accordion={accordion || undefined}>
      {/* Expanded layer — defines the panel height; clipped + faded when collapsed
          (on the accordion it stays, only its details list folds). */}
      <div className={styles.expanded} aria-hidden={collapsed && !accordion}>
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
                aria-label={accordion && collapsed ? "Expand details" : "Collapse details"}
                data-tooltip={accordion && collapsed ? "Expand details" : "Collapse details"}
                aria-expanded={accordion ? !collapsed : undefined}
                tabIndex={collapsed && !accordion ? -1 : 0}
              >
                {accordion ? <ChevronGlyph open={!collapsed} /> : <ToggleGlyph />}
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

        {noRecords ? (
          <NoRecordsBanner content={content.noRecords} company={company} onSchedule={() => notify("scheduleCall")} />
        ) : (
          <UpgradeBanner
            stage={stage}
            content={content.upgrade}
            upgraded={{
              ...content.upgraded,
              title: (caseId && content.upgraded.titleByCase?.[caseId]) || content.upgraded.title,
              body: (caseId && content.upgraded.bodyByCase?.[caseId]) || content.upgraded.body,
            }}
            notify={
              caseId && content.upgraded.notifyByCase?.[caseId]
                ? { label: content.upgraded.notifyByCase[caseId]!, onClick: () => notify("notifyReport") }
                : undefined
            }
            progress={progress}
            onSimulate={onSimulate}
            onReset={onReset}
            company={company}
            replayKey={accordion ? openCount : undefined}
          />
        )}
      </div>

      {/* Collapsed rail — toggle at top, progress pinned to the bottom. */}
      <div className={styles.rail} aria-hidden={!collapsed}>
        <div className={styles.railTop}>
          <button
            type="button"
            className={styles.railToggle}
            onClick={onToggleCollapse}
            aria-label="Expand details"
            data-tooltip="Expand details"
            data-tooltip-side="right"
            tabIndex={collapsed ? 0 : -1}
          >
            <ToggleGlyph />
          </button>
        </div>
        {!noRecords && (
          <div className={styles.railMeter}>
            <motion.span className={styles.railPercent}>{railLabel}</motion.span>
            <div className={styles.railTrack}>
              <motion.div className={styles.railFill} style={{ width: railWidth }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
