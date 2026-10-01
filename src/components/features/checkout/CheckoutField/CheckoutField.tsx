"use client";

import { useState } from "react";
import { InteractiveInput, type FieldStatus } from "@/components/ui/InteractiveInput";
import { formatINR, formatPhone, inrInWords } from "@/lib/utils";
import { useFieldTip } from "@/lib/field-tips";
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
  /** Phrases for the inline ghost completion. */
  completions?: string[];
  /** A neutral help line when there's no error (e.g. where the value was read from). */
  note?: string;
}

/**
 * CheckoutField — one checkout input on the shared InteractiveInput at the
 * 18px checkout size: formats phones, uppercases GSTIN/PAN, and shows the
 * validation line in the help row. Errors wait for blur (a half-typed value
 * reads neutral, not wrong); once shown they clear live as the user fixes it.
 * Usage: <CheckoutField field={f} value={v} status={s} error={e} onChange={set} />
 */
export function CheckoutField({ field, value, status, error, onChange, variant = "underline", reserveHelp = false, completions, note }: CheckoutFieldProps) {
  // A prefilled value counts as touched, so a bad seed still shows its error.
  const [touched, setTouched] = useState(value !== "");
  const tip = useFieldTip(field.key);
  const shown = touched ? error : null;
  const format = (v: string) =>
    field.validate === "phone" ? formatPhone(v) : field.amountWords ? formatINR(v) : field.upper ? v.toUpperCase() : v;
  // Amounts read back in words as they're typed.
  const words = field.amountWords && value ? inrInWords(value, field.amountWords) : "";
  return (
    <InteractiveInput
      size="lg"
      variant={variant}
      label={field.label}

      ariaLabel={field.label}
      infoTooltip={tip}
      mandatory={field.mandatory}
      control={field.control}
      options={field.options}
      placeholder={field.placeholder}
      prefix={field.prefix}
      inputMode={field.inputMode}
      maxLength={field.maxLength}
      value={value}
      onChange={(v) => onChange(format(v))}
      clearable={!field.locked}
      locked={field.locked}
      status={field.locked ? "empty" : shown ? "error" : error ? "empty" : status}
      helpText={shown ?? (words || note || undefined)}
      helpTone={shown ? "error" : "neutral"}
      showHelp={reserveHelp || !!shown || !!field.amountWords}
      onFocus={() => !error && setTouched(false)}
      onBlur={() => setTouched(true)}
      completions={completions}
    />
  );
}
