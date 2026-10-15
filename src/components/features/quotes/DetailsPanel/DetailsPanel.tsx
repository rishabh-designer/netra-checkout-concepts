"use client";

import { scoreWord } from "@/lib/score-band";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { DetailsPanelContent } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { NoRecordsBanner, UpgradeBanner, type UpgradeStage } from "../UpgradeBanner";
import { RiskScoreBadge, ScoreList, Tick } from "../RiskScore";
import { useDemoNotice } from "@/lib/demo-notice";
import styles from "./DetailsPanel.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { EASE_OUT } from "@/lib/motion";
import { useAtMost } from "@/lib/media";
import { NetraBot } from "@/components/ui/NetraBot";
import { FileTextIcon } from "@/components/icons/FileTextIcon";
import { UserIcon } from "@/components/icons/UserIcon";

type Tab = "score" | "chat" | "profile";
/** Scored (A, B): Score leads. */
const TABS: Tab[] = ["score", "chat", "profile"];
/** Case C (not scored): Chat leads and Score goes last. */
const TABS_UNSCORED: Tab[] = ["chat", "profile", "score"];
/** Each tab's mark beside its label (Figma 829:21917), in a 16 slot: the
 *  line icons at the label's 14 so they weigh the same as NetraBot's 16. */
const TAB_ICON: Record<Tab, ReactNode> = {
  score: <FileTextIcon size={14} />,
  chat: <NetraBot state="idle" size={16} />,
  profile: <UserIcon size={14} />,
};

export interface DetailsPanelProps {
  content: DetailsPanelContent;
  /** Live flow values keyed by field; override the row defaults where present. */
  values?: Record<string, string>;
  /** Reopen the pre-filled lead flow. */
  onEdit?: () => void;
  /** Phones (the accordion): folded shut to its tab strip. */
  collapsed?: boolean;
  /** Phones: fold or open the accordion. */
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
  /** Case C: no public records, so no verification and no score. */
  noRecords?: boolean;
  /** The flow case, for case-specific copy and the score. */
  caseId?: QuoteCaseId;
  /** The company the quotes are for (the flow's legal name); Profile's first
   *  row. Omitted off-flow. */
  companyName?: string;
  /** The Score tab's lists: the Gold Quote's coverages and exclusions. */
  scoreLists?: { coverages: string[]; exclusions: string[] };
  /** The Chat tab: Ask BimaNetra, mounted on first open and kept after. */
  chat?: ReactNode;
}

/**
 * DetailsPanel — the left column (Figma 770:26992), full column height: a tab
 * strip (A, B: Score | Chat | Profile; C: Chat | Profile | Score) over the chosen tab. Score is the upgrade
 * banner growing into the risk score badge and the Gold Quote's key coverages
 * and exclusions (Case C: not scored, no badge, and Schedule a Call); Chat is Ask
 * BimaNetra; Profile is Your Details with Edit Details. Phones fold it shut
 * to the tab strip (an accordion).
 * Usage: <DetailsPanel content={detailsPanel} values={values} onEdit={fn} chat={<QuotesChat … />} />
 */
export function DetailsPanel({ content, values, onEdit, collapsed, onToggleCollapse, stage = "pending", onSimulate, onVerified, onReset, noRecords = false, verifyFrom, companyName, caseId, scoreLists, chat }: DetailsPanelProps) {
  const accordion = useAtMost("stack");
  // Phones: a floating dock 12 off the foot that opens upward.
  const dock = useAtMost("mobile");
  const notify = useDemoNotice();
  const baseId = useId();
  // A and B open on Score; Case C has no score to show, so it opens on Chat.
  const tabs = noRecords || caseId === "C" ? TABS_UNSCORED : TABS;
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [chatSeen, setChatSeen] = useState(tab === "chat");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const folded = accordion && collapsed;
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
  const progress = useMotionValue(stage === "upgraded" ? 100 : stage === "verifying" && verifyFrom !== undefined ? verifyFrom : start);
  // Already scored on arrival (a reload): the badge rests.
  const [arrivedUpgraded] = useState(stage === "upgraded");

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

  const choose = (next: Tab) => {
    // Phones' dock: tapping the open tab again (it shows an ×) closes it.
    if (dock && !folded && next === tab) {
      onToggleCollapse?.();
      return;
    }
    setTab(next);
    if (next === "chat") setChatSeen(true);
    // Phones: a tab tap opens the folded accordion.
    if (folded) onToggleCollapse?.();
  };
  const onTabKey = (e: KeyboardEvent) => {
    const i = tabs.indexOf(tab);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + tabs.length) % tabs.length;
    choose(tabs[n]);
    tabRefs.current[n]?.focus();
  };

  // The banners' copy names the business: "We've verified Pepe Jeans …".
  const named = (text: string) => text.replace("{company}", companyName || content.companyFallback);
  const scored = !!caseId && caseId !== "C" && !noRecords;
  const score = scoreWord(scored ? content.score.byCase[caseId] : content.score.byCase.C, content.score.bands);
  const n = content.score.listLength;
  // Under the banner's copy: the badge, then the key lines.
  const badge = (
    <RiskScoreBadge
      score={score}
      label={content.score.label}
      swappable
      info={scored ? content.score.infoByCase?.[caseId] ?? content.score.info : content.score.mutedInfo}
      muted={!scored}
      still={arrivedUpgraded && !openCount}
    />
  );
  const scoreList =
    scored && scoreLists ? (
        <ScoreList
          title={content.score.listTitle.replace("{count}", String(Math.min(n, scoreLists.coverages.length) + Math.min(n, scoreLists.exclusions.length)))}
          items={[
            ...scoreLists.coverages.slice(0, n).map((label) => ({ label, tone: "covered" as const })),
            ...scoreLists.exclusions.slice(0, n).map((label) => ({ label, tone: "excluded" as const })),
          ]}
          delay={0.7}
          still={arrivedUpgraded && !openCount}
        />
    ) : undefined;

  const pane = (key: Tab) => ({
    id: `${baseId}-panel-${key}`,
    role: "tabpanel",
    "aria-labelledby": `${baseId}-tab-${key}`,
    hidden: tab !== key || folded,
  });

  return (
    <aside className={styles.panel} data-collapsed={folded || undefined}>
      <div className={styles.tabBar}>
        <div className={styles.tabs} role="tablist" aria-label={content.title} onKeyDown={onTabKey}>
          {tabs.map((key, i) => (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`${baseId}-panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              className={styles.tab}
              onClick={() => choose(key)}
            >
              {tab === key && !folded && (
                <motion.span layoutId={`${baseId}-ink`} className={styles.ink} transition={{ duration: reduced ? 0 : 0.3, ease: EASE_OUT }} />
              )}
              <span className={styles.tabLabel}>
                <span className={styles.tabIcon} aria-hidden>{TAB_ICON[key]}</span>
                {content.tabs[key]}
                {/* Phones' dock, open: an × on the chosen tab, which closes it. */}
                {dock && !folded && tab === key && (
                  <svg className={styles.tabClose} viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                    <path d="m3 3 6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          ))}
        </div>
        {/* The accordion's chevron; the phones' dock opens and closes from
            its tabs instead. */}
        {accordion && !dock && (
          <button
            type="button"
            className={styles.collapse}
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand details" : "Collapse details"}
            aria-expanded={!collapsed}
          >
            <Chevron style={{ transform: collapsed ? undefined : "rotate(180deg)", transition: "transform 0.3s ease" }} />
          </button>
        )}
      </div>

      {/* Score (Figma 776:32097): the banner, grown into the score. */}
      <div className={styles.pane} {...pane("score")}>
        {noRecords ? (
          <NoRecordsBanner content={{ ...content.noRecords, body: named(content.noRecords.body) }} onTitleCta={() => notify("scheduleCall")} />
        ) : (
          <UpgradeBanner
            stage={stage}
            content={{ ...content.upgrade, body: named(content.upgrade.body) }}
            upgraded={{
              ...content.upgraded,
              title: (caseId && content.upgraded.titleByCase?.[caseId]) || content.upgraded.title,
              body: named((caseId && content.upgraded.bodyByCase?.[caseId]) || content.upgraded.body),
            }}
            notify={
              caseId && content.upgraded.titleCtaByCase?.[caseId]
                ? { label: content.upgraded.titleCtaByCase[caseId]!.label, onClick: () => notify(content.upgraded.titleCtaByCase![caseId]!.notice) }
                : undefined
            }
            progress={progress}
            onSimulate={onSimulate}
            onReset={onReset}
            replayKey={accordion ? openCount : undefined}
          >
            {badge}
            {scoreList}
          </UpgradeBanner>
        )}
      </div>

      {/* Chat (Figma 776:32100): Ask BimaNetra, kept once opened. */}
      <div className={styles.pane} data-chat {...pane("chat")}>
        {chatSeen && chat}
      </div>

      {/* Profile (Figma 776:32413): Your Details. */}
      <div className={styles.pane} {...pane("profile")}>
        <div className={styles.details}>
          <div className={styles.head}>
            <h2 className={styles.title}>{content.title}</h2>
            <button type="button" className={styles.edit} onClick={onEdit}>
              {content.editLabel}
            </button>
          </div>
          <dl className={styles.rows}>
            {companyName && (
              <div className={styles.row}>
                <dt className={styles.label}>{content.legalNameLabel}</dt>
                <dd className={`${styles.value} ${styles.company}`}>
                  {companyName}
                  {/* Confirmed against public records (Cases A and B). */}
                  {!noRecords && (
                    <span className={styles.verified} role="img" aria-label={content.legalNameVerified} data-tooltip={content.legalNameVerified}>
                      <Tick size={12} />
                    </span>
                  )}
                </dd>
              </div>
            )}
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
      </div>
    </aside>
  );
}
