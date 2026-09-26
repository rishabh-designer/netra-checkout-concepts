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
  onChange: (key: string, value: string) => void;
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
 *  - Billing (484:25880): four boxed fields in a 2 × 2 grid, 16 apart, no labels.
 *  - Company (484:26443): Pincode + Place side by side, Address full width.
 *  - KYC (484:26922): two columns, each an upload above its number field.
 * `stacked` collapses to one column for the 624px edit drawer.
 * Usage: <StepForm step="kyc" fields={f} uploads={u} uploadCopy={c} model={m} />
 */
export function StepForm({ step, fields, uploads = [], uploadCopy, model, stacked = false }: StepFormProps) {
  const input = (f: Field, variant: "boxed" | "underline" = "underline") => (
    <CheckoutField
      key={f.key}
      field={f}
      value={model.value(f)}
      status={model.status(f)}
      error={model.error(f)}
      onChange={(v) => model.onChange(f.key, v)}
      variant={variant}
      reserveHelp={step !== "billing"}
    />
  );

  if (step === "billing") {
    return <div className={styles.billing} data-stacked={stacked || undefined}>{fields.map((f) => input(f, "boxed"))}</div>;
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
            onChange={(name) => model.onChange(u.key, name)}
            copy={uploadCopy}
          />
          {fields[i] && input(fields[i])}
        </div>
      ))}
    </div>
  );
}
