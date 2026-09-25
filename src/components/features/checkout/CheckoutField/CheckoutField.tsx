"use client";

import { InteractiveInput, type FieldStatus } from "@/components/ui/InteractiveInput";
import { formatPhone } from "@/lib/utils";
import type { CheckoutField as Field } from "@/types/checkout";

export interface CheckoutFieldProps {
  field: Field;
  value: string;
  status: FieldStatus;
  error: string | null;
  onChange: (value: string) => void;
  /** "boxed" for Billing (Figma 484:25880); underline elsewhere. */
  variant?: "boxed" | "underline";
  /** Reserve the 28px help row even without a message (Company / KYC grids). */
  reserveHelp?: boolean;
}

/**
 * CheckoutField — one checkout input on the shared InteractiveInput at the
 * 18px checkout size: formats phones, uppercases GSTIN/PAN, and shows the
 * validation line in the help row.
 * Usage: <CheckoutField field={f} value={v} status={s} error={e} onChange={set} />
 */
export function CheckoutField({ field, value, status, error, onChange, variant = "underline", reserveHelp = false }: CheckoutFieldProps) {
  const format = (v: string) => (field.validate === "phone" ? formatPhone(v) : field.upper ? v.toUpperCase() : v);
  return (
    <InteractiveInput
      size="lg"
      variant={variant}
      label={field.label}
      showLabel={!field.hideLabel}
      ariaLabel={field.label}
      mandatory={field.mandatory}
      control={field.control}
      options={field.options}
      placeholder={field.placeholder}
      prefix={field.prefix}
      inputMode={field.inputMode}
      maxLength={field.maxLength}
      value={value}
      onChange={(v) => onChange(format(v))}
      clearable
      status={error ? "error" : status}
      helpText={error ?? undefined}
      helpTone={error ? "error" : "neutral"}
      showHelp={reserveHelp || !!error}
    />
  );
}
