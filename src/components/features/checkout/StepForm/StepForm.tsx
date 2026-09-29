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
}

export interface StepFormProps {
  step: "billing" | "company" | "kyc";
  fields: Field[];
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
 * `stacked` collapses to one column for the 624px edit drawer.
 * Usage: <StepForm step="kyc" fields={f} uploads={u} uploadCopy={c} model={m} />
 */
export function StepForm({ step, fields, uploads = [], uploadCopy, model, stacked = false }: StepFormProps) {
  const input = (f: Field) => (
    <CheckoutField
      key={f.key}
      field={f}
      value={model.value(f)}
      status={model.status(f)}
      error={model.error(f)}
      onChange={(v) => model.onChange(f.key, v)}
      completions={model.completions?.(f)}
      reserveHelp
    />
  );

  if (step === "billing") {
    return <div className={styles.grid} data-stacked={stacked || undefined}>{fields.map((f) => input(f))}</div>;
  }

  if (step === "company") {
    return (
      <div className={styles.grid} data-stacked={stacked || undefined}>
        {fields.map((f) => (
          <div key={f.key} className={f.control === "textarea" ? styles.full : undefined}>
            {input(f)}
          </div>
        ))}
      </div>
    );
  }

  return (
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
          {/* The number under its document; one read off the upload waits
              (locked) until the document is in. */}
          {fields[i] &&
            input(
              fields[i].readFrom && !model.file(fields[i].readFrom!)
                ? { ...fields[i], locked: true, placeholder: fields[i].lockedPlaceholder ?? fields[i].placeholder }
                : fields[i],
            )}
        </div>
      ))}
    </div>
  );
}
