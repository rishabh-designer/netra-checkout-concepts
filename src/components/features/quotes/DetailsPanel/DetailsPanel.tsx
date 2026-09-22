import type { DetailsPanelContent } from "@/types/quotesPage";
import { UpgradeBanner } from "../UpgradeBanner";
import styles from "./DetailsPanel.module.css";

export interface DetailsPanelProps {
  content: DetailsPanelContent;
  /** Live flow values keyed by field; override the row defaults where present. */
  values?: Record<string, string>;
  /** Reopen the pre-filled lead flow. */
  onEdit?: () => void;
}

/**
 * DetailsPanel — the left "Your Details" column: a header (title + Edit Details
 * + a static collapse icon), the entered detail rows (live values from the flow
 * override the Case-C defaults), and the "Ready to Upgrade?" banner.
 * Usage: <DetailsPanel content={detailsPanel} values={values} onEdit={fn} />
 */
export function DetailsPanel({ content, values, onEdit }: DetailsPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title}>{content.title}</h2>
        <div className={styles.headActions}>
          <button type="button" className={styles.edit} onClick={onEdit}>
            {content.editLabel}
          </button>
          {/* Presentational only — no collapse behavior (per spec). */}
          <span className={styles.collapse} aria-hidden>
            <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
              <rect x="1.5" y="2.5" width="15" height="13" rx="3" stroke="var(--color-label-secondary)" strokeWidth="1.4" />
              <path d="M11.5 2.5v13" stroke="var(--color-label-secondary)" strokeWidth="1.4" />
              <path d="M4 7l2 2-2 2" stroke="var(--color-label-secondary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
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
    </aside>
  );
}
