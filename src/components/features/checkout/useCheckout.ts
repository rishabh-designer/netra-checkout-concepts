"use client";

import { useCallback, useMemo } from "react";
import { useQuoteFlow, type QuoteCaseId } from "@/lib/quote-flow";
import { formatPhone } from "@/lib/utils";
import { statusFor, validateField } from "@/lib/checkout";
import type { CheckoutContent, CheckoutField, CheckoutStepId } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import type { FieldStatus } from "@/components/ui/InteractiveInput";

/** Set while "Buy in Another Person's Name" is on (Billing fields go manual). */
export const OTHER_PERSON_KEY = "otherPerson";

export interface CheckoutState {
  caseId: QuoteCaseId;
  quote: QuoteCardData;
  /** The fields for a step (Billing, or the case's Company / KYC list). */
  fieldsFor: (step: Exclude<CheckoutStepId, "review">) => CheckoutField[];
  valueOf: (field: CheckoutField) => string;
  /** Status / validation for a field, optionally for a draft value (edit drawer). */
  statusOf: (field: CheckoutField, value?: string) => FieldStatus;
  errorOf: (field: CheckoutField, value?: string) => string | null;
  /** Current value of any key (uploads store the file name). */
  get: (key: string) => string;
  set: (patch: Record<string, string>) => void;
  otherPerson: boolean;
  setOtherPerson: (on: boolean) => void;
  /** Mandatory fields filled + valid (and uploads done on KYC). */
  isComplete: (step: Exclude<CheckoutStepId, "review">) => boolean;
}

/**
 * useCheckout — the checkout's view of the shared flow store. Seeds every field
 * from the lead flow (or the Case C fallback when opened cold), overlays what
 * the user has typed in checkout, and derives status / validation per field.
 * Usage: const co = useCheckout(content, fallbackQuote);
 */
export function useCheckout(content: CheckoutContent, fallbackQuote: QuoteCardData): CheckoutState {
  const { result, selectedQuote, checkout, setCheckout } = useQuoteFlow();
  const caseId: QuoteCaseId = result?.caseId ?? "C";
  const flow = result?.values ?? content.fallbackValues;
  const companyName = result?.companyName || content.fallbackCompanyName;
  const otherPerson = checkout[OTHER_PERSON_KEY] === "1";

  const fieldsFor = useCallback(
    (step: Exclude<CheckoutStepId, "review">) =>
      step === "billing" ? content.steps.billing.fields : content.steps[step].cases[caseId],
    [content, caseId],
  );

  const seedOf = useCallback(
    (field: CheckoutField) => {
      const raw = field.seedFrom === "companyName" ? companyName : field.seedFrom ? flow[field.seedFrom] ?? "" : field.value ?? "";
      return field.validate === "phone" ? formatPhone(raw) : raw;
    },
    [companyName, flow],
  );

  const valueOf = useCallback((field: CheckoutField) => checkout[field.key] ?? seedOf(field), [checkout, seedOf]);
  const isBilling = useCallback((field: CheckoutField) => content.steps.billing.fields.includes(field), [content]);

  const errorOf = useCallback(
    (field: CheckoutField, value?: string) => validateField(field, value ?? valueOf(field), content.validationMessages),
    [valueOf, content.validationMessages],
  );

  const statusOf = useCallback(
    (field: CheckoutField, value?: string) =>
      statusFor(field, value ?? valueOf(field), seedOf(field), otherPerson && isBilling(field)),
    [valueOf, seedOf, otherPerson, isBilling],
  );

  const set = useCallback((patch: Record<string, string>) => setCheckout({ ...checkout, ...patch }), [checkout, setCheckout]);

  // On: clear the Billing fields for someone else's details. Off: drop the
  // overrides so the user's own details come back.
  const setOtherPerson = useCallback(
    (on: boolean) => {
      const next = { ...checkout };
      for (const f of content.steps.billing.fields) {
        if (on) next[f.key] = "";
        else delete next[f.key];
      }
      if (on) next[OTHER_PERSON_KEY] = "1";
      else delete next[OTHER_PERSON_KEY];
      setCheckout(next);
    },
    [checkout, content, setCheckout],
  );

  const isComplete = useCallback(
    (step: Exclude<CheckoutStepId, "review">) => {
      const fieldsOk = fieldsFor(step).every((f) => !f.mandatory || (valueOf(f).trim() && !errorOf(f)));
      const uploadsOk = step !== "kyc" || content.steps.kyc.uploads.every((u) => !!checkout[u.key]);
      return fieldsOk && uploadsOk;
    },
    [fieldsFor, valueOf, errorOf, content, checkout],
  );

  return useMemo(
    () => ({
      caseId,
      quote: selectedQuote ?? fallbackQuote,
      fieldsFor,
      valueOf,
      statusOf,
      errorOf,
      get: (key: string) => checkout[key] ?? "",
      set,
      otherPerson,
      setOtherPerson,
      isComplete,
    }),
    [caseId, selectedQuote, fallbackQuote, fieldsFor, valueOf, statusOf, errorOf, checkout, set, otherPerson, setOtherPerson, isComplete],
  );
}
