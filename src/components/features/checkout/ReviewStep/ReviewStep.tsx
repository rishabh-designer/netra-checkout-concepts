import type { CheckoutField, CheckoutReviewContent, CheckoutUpload } from "@/types/checkout";
import styles from "./ReviewStep.module.css";

export type ReviewSection = "billing" | "company" | "kyc";

interface Row {
  key: string;
  label: string;
  value: string;
  wide?: boolean;
}

export interface ReviewStepProps {
  content: CheckoutReviewContent;
  billing: CheckoutField[];
  company: CheckoutField[];
  kyc: CheckoutField[];
  uploads: CheckoutUpload[];
  valueOf: (field: CheckoutField) => string;
  fileOf: (key: string) => string;
  onEdit: (section: "company" | "kyc") => void;
}

const EMPTY = "-";

/**
 * ReviewStep — the three read-back sections of Review (Figma 484:28949):
 * each a lilac header strip (Instrument Serif title + "Edit Details") over a
 * label/value grid. Billing is locked (button disabled, values greyed);
 * Company and KYC open their edit drawer.
 * Usage: <ReviewStep content={review} billing={…} company={…} kyc={…} uploads={…} valueOf={…} fileOf={…} onEdit={…} />
 */
export function ReviewStep({ content, billing, company, kyc, uploads, valueOf, fileOf, onEdit }: ReviewStepProps) {
  const fieldRow = (f: CheckoutField, star = false): Row => {
    const v = valueOf(f);
    return {
      key: f.key,
      label: `${f.reviewLabel ?? f.label}${star && f.mandatory ? "*" : ""}`,
      value: v ? (f.prefix ? `${f.prefix} ${v}` : v) : EMPTY,
      wide: f.control === "textarea",
    };
  };

  const sections: { id: ReviewSection; rows: Row[]; locked: boolean }[] = [
    { id: "billing", rows: billing.map((f) => fieldRow(f, true)), locked: true },
    { id: "company", rows: company.map((f) => fieldRow(f)), locked: false },
    {
      id: "kyc",
      rows: [
        ...kyc.map((f) => fieldRow(f)),
        ...uploads.map((u) => ({ key: u.key, label: u.reviewLabel, value: fileOf(u.key) ? content.uploadedLabel : EMPTY })),
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
            <button
              type="button"
              className={styles.edit}
              disabled={s.locked}
              onClick={s.locked ? undefined : () => onEdit(s.id as "company" | "kyc")}
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
