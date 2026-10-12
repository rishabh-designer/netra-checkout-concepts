"use client";

import type { FieldStatus } from "@/components/ui/InteractiveInput";
import { UploadField } from "@/components/ui/UploadField";
import type { CheckoutField as Field, CheckoutUpload, CheckoutUploadCopy } from "@/types/checkout";
import { CheckoutField } from "../CheckoutField";
import styles from "./StepForm.module.css";

/** Where a StepForm reads and writes: the live checkout, or an edit-drawer draft. */
export interface FormModel {
  value: (field: Field) => string;
  status: (field: Field) => FieldStatus;
  error: (field: Field) => string | null;
  file: (key: string) => string;
  /** The upload still holds the document fetched from the MCA. */
  fetched?: (key: string) => boolean;
  onChange: (key: string, value: string) => void;
  /** Phrases a field's ghost can complete to. */
  completions?: (field: Field) => string[];
  /** A neutral help line under a field (e.g. "Read from your GST certificate"). */
  note?: (field: Field) => string | undefined;
  /** The field as shown: e.g. a "Reading your document…" placeholder while
   *  its document is read. */
  show?: (field: Field) => Field;
}

export interface StepFormProps {
  /** "verification": KYC (`fields`, with the uploads), then Company
   *  (`companyFields`) under `companyTitle`. */
  step: "billing" | "company" | "kyc" | "verification";
  fields: Field[];
  companyFields?: Field[];
  companyTitle?: string;
  uploads?: CheckoutUpload[];
  uploadCopy: CheckoutUploadCopy;
  model: FormModel;
  /** Single column (edit drawer). */
  stacked?: boolean;
}

/**
 * StepForm — the field layout for one checkout step:
 *  - Billing (638:16876): four labelled fields in a 2 × 2 grid (the company
 *    name locked).
 *  - Company (638:20126): Pincode + Place side by side, Address full width.
 *  - KYC (638:22763): the GST and PAN numbers side by side, their uploads
 *    under them.
 *  - Verification: KYC, then Company under its own title (one step).
 * `stacked` collapses to one column for the 624px edit drawer.
 * Usage: <StepForm step="verification" fields={kyc} companyFields={company} companyTitle="…" uploads={u} uploadCopy={c} model={m} />
 */
export function StepForm({ step, fields, companyFields = [], companyTitle, uploads = [], uploadCopy, model, stacked = false }: StepFormProps) {
  const input = (raw: Field) => {
    const f = model.show?.(raw) ?? raw;
    return (
      <CheckoutField
        key={f.key}
        field={f}
        value={model.value(raw)}
        status={model.status(raw)}
        error={model.error(raw)}
        note={model.note?.(raw)}
        onChange={(v) => model.onChange(f.key, v)}
        completions={model.completions?.(raw)}
        reserveHelp
      />
    );
  };

  if (step === "billing") {
    return <div className={styles.grid} data-stacked={stacked || undefined}>{fields.map((f) => input(f))}</div>;
  }

  const company = (list: Field[]) => (
    <div className={styles.grid} data-stacked={stacked || undefined}>
      {list.map((f) => (
        <div key={f.key} className={f.control === "textarea" ? styles.full : undefined}>
          {input(f)}
        </div>
      ))}
    </div>
  );

  if (step === "company") return company(fields);

  const kyc = (
    <div className={styles.grid} data-stacked={stacked || undefined} data-kyc>
      {uploads.map((u, i) => (
        <div key={u.key} className={styles.kycColumn}>
          <UploadField
            label={u.label}
            title={u.title}
            mandatory
            fileName={model.file(u.key)}
            fetched={model.fetched?.(u.key)}
            onChange={(name) => model.onChange(u.key, name)}
            copy={uploadCopy}
          />
          {/* The number under its document. */}
          {fields[i] && input(fields[i])}
        </div>
      ))}
    </div>
  );

  if (step === "kyc") return kyc;

  // Verification: the documents and numbers first, then the company.
  return (
    <div className={styles.parts}>
      {kyc}
      <div className={styles.part}>
        {companyTitle && <h2 className={styles.partTitle}>{companyTitle}</h2>}
        <hr className={styles.partRule} />
        {company(companyFields)}
      </div>
    </div>
  );
}
