"use client";

import { useState } from "react";
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
 * validation line in the help row. Errors wait for blur (a half-typed value
 * reads neutral, not wrong); once shown they clear live as the user fixes it.
 * Usage: <CheckoutField field={f} value={v} status={s} error={e} onChange={set} />
 */
export function CheckoutField({ field, value, status, error, onChange, variant = "underline", reserveHelp = false }: CheckoutFieldProps) {
  // A prefilled value counts as touched, so a bad seed still shows its error.
  const [touched, setTouched] = useState(value !== "");
  const shown = touched ? error : null;
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
      status={shown ? "error" : error ? "empty" : status}
      helpText={shown ?? undefined}
      helpTone={shown ? "error" : "neutral"}
      showHelp={reserveHelp || !!shown}
      onFocus={() => !error && setTouched(false)}
      onBlur={() => setTouched(true)}
    />
  );
}
