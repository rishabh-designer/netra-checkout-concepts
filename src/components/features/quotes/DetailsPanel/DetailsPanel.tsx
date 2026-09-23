import type { DetailsPanelContent } from "@/types/quotesPage";
import { UpgradeBanner } from "../UpgradeBanner";
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
 * DetailsPanel — the left "Your Details" column. Expanded: a header (title +
 * Edit Details + collapse toggle), the entered detail rows (live values from the
 * flow override the Case-C defaults) and the "Ready to Upgrade?" banner.
 * Collapsed: a narrow rail showing only the (flipped) toggle and the progress %.
 * Usage: <DetailsPanel content={detailsPanel} values={values} onEdit={fn}
 *          collapsed={bool} onToggleCollapse={fn} />
 */
export function DetailsPanel({ content, values, onEdit, collapsed, onToggleCollapse }: DetailsPanelProps) {
  const percent = Math.max(0, Math.min(100, content.upgrade.percent));
  return (
    <aside className={styles.panel} data-collapsed={collapsed || undefined}>
      {/* Expanded layer — defines the panel height; clipped + faded when collapsed. */}
      <div className={styles.expanded} aria-hidden={collapsed}>
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

        <UpgradeBanner content={content.upgrade} />
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
          <span className={styles.railPercent}>{percent}%</span>
          <div className={styles.railTrack}>
            <div className={styles.railFill} style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
