import type { CheckoutField, CheckoutReviewContent, CheckoutUpload } from "@/types/checkout";
import styles from "./ReviewStep.module.css";

export type ReviewSection = "billing" | "verification";

interface Row {
  key: string;
  label: string;
  value: string;
  wide?: boolean;
}

export interface ReviewStepProps {
  content: CheckoutReviewContent;
  billing: CheckoutField[];
  /** KYC numbers, then the company details. */
  verification: CheckoutField[];
  uploads: CheckoutUpload[];
  valueOf: (field: CheckoutField) => string;
  fileOf: (key: string) => string;
  onEdit: (section: "verification") => void;
}

const EMPTY = "-";

/**
 * ReviewStep — the read-back sections of Review (Figma 484:28949), Billing
 * and Verification:
 * each a lilac header strip (Instrument Serif title + "Edit Details") over a
 * label/value grid. Billing is locked (a disabled edit button, values greyed);
 * Verification opens its edit drawer.
 * Usage: <ReviewStep content={review} billing={…} verification={…} uploads={…} valueOf={…} fileOf={…} onEdit={…} />
 */
export function ReviewStep({ content, billing, verification, uploads, valueOf, fileOf, onEdit }: ReviewStepProps) {
  // Read-only summary: no mandatory marks (nothing here is being filled in).
  const fieldRow = (f: CheckoutField): Row => {
    const v = valueOf(f);
    return {
      key: f.key,
      label: f.reviewLabel ?? f.label,
      value: v ? (f.prefix ? `${f.prefix} ${v}` : v) : EMPTY,
      wide: f.control === "textarea",
    };
  };

  const sections: { id: ReviewSection; rows: Row[]; locked: boolean }[] = [
    { id: "billing", rows: billing.map((f) => fieldRow(f)), locked: true },
    // Verification, in the step's order: the KYC numbers and their uploads
    // (index-aligned, one number per document), then the company details.
    {
      id: "verification",
      rows: [
        ...verification.slice(0, uploads.length).map((f) => fieldRow(f)),
        ...uploads.map((u) => ({ key: u.key, label: u.reviewLabel, value: fileOf(u.key) ? content.uploadedLabel : EMPTY })),
        ...verification.slice(uploads.length).map((f) => fieldRow(f)),
      ],
      locked: false,
    },
  ];

  return (
    <div className={styles.sections}>
      {sections.map((s) => (
        <section key={s.id} className={styles.section} data-locked={s.locked || undefined}>
          <header className={styles.strip}>
            <h3 className={styles.stripTitle}>{content.sectionTitles[s.id]}</h3>
            {/* Billing is locked after the first checkout step: its button
                shows, disabled (Figma 638:22646). */}
            <button
              type="button"
              className={styles.edit}
              disabled={s.locked}
              data-tooltip={s.locked ? content.lockedEditTip : undefined}
              onClick={s.locked ? undefined : () => onEdit("verification")}
            >
              {content.editLabel}
            </button>
          </header>
          <dl className={styles.rows}>
            {s.rows.map((r) => (
              <div key={r.key} className={styles.cell} data-wide={r.wide || undefined}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
