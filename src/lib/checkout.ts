import type { CheckoutField, CheckoutValidator } from "@/types/checkout";
import type { FieldStatus } from "@/components/ui/InteractiveInput";

const RULES: Record<CheckoutValidator, (v: string) => boolean> = {
  phone: (v) => v.replace(/\D/g, "").length === 10,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  pincode: (v) => /^[1-9]\d{5}$/.test(v.trim()),
  gstin: (v) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.trim()),
  pan: (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v.trim()),
};

/** Whether a filled value passes its format rule (empty values pass). */
export function passesRule(rule: CheckoutValidator, value: string): boolean {
  return !value.trim() || RULES[rule](value);
}

/** The validation message for a filled value, or null when it's fine (or empty).
 *  Messages come from content (`validationMessages`). */
export function validateField(
  field: CheckoutField,
  value: string,
  messages: Record<CheckoutValidator, string>,
): string | null {
  if (!field.validate || !value.trim()) return null;
  return RULES[field.validate](value) ? null : messages[field.validate];
}

/**
 * The status a checkout field shows, mirroring the quote modal: empty until
 * filled; a system value keeps its seeded tone (verified / success / fuzzy /
 * userFilled) until the user edits it, after which it reads as confirmed
 * (success). Fuzzy guesses therefore turn green once corrected.
 */
export function statusFor(field: CheckoutField, value: string, seed: string, manual = false): FieldStatus {
  if (!value.trim()) return "empty";
  if (manual || field.status === "empty") return "success";
  if (value !== seed) return "success";
  return field.status;
}

/** The Place of Incorporation a valid pincode points to, or null. */
export function placeForPincode(pin: string, table: [string, string][]): string | null {
  const v = pin.trim();
  if (!RULES.pincode(v)) return null;
  return table.find(([prefix]) => v.startsWith(prefix))?.[1] ?? null;
}

/** Split a GST-inclusive total ("₹10,000") into premium + GST at `rate`. */
export function splitPrice(total: string, rate: number): { premium: number; gst: number; total: number } {
  const t = Number(total.replace(/[^\d]/g, "")) || 0;
  const premium = Math.round(t / (1 + rate));
  return { premium, gst: t - premium, total: t };
}

/** ₹ with Indian digit grouping ("₹8,475"). */
export function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
