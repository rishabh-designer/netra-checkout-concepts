"use client";

import { useCallback, useMemo } from "react";
import { useQuoteFlow, type QuoteCaseId } from "@/lib/quote-flow";
import { formatPhone } from "@/lib/utils";
import { placeForPincode, statusFor, validateField } from "@/lib/checkout";
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
  /** The patch for one edit, plus anything it fills in (a pincode sets the
   *  Place of Incorporation). `current` reads the values being edited. */
  patchFor: (key: string, value: string, current: (key: string) => string) => Record<string, string>;
  otherPerson: boolean;
  setOtherPerson: (on: boolean) => void;
  /** The company's email domain, from the email on file ("studio2rs.in"). */
  companyDomain: string;
  /** Mandatory fields filled + valid, and uploads done on KYC. A guessed
   *  (fuzzy) value needs no tick: Save & Continue is the confirmation. */
  isComplete: (step: Exclude<CheckoutStepId, "review">) => boolean;
  /** How much of a step is done: its mandatory fields (filled and valid)
   *  and its uploads. */
  progressOf: (step: Exclude<CheckoutStepId, "review">) => { done: number; total: number };
  /** The upload (or a draft `value` for it) is still the document fetched
   *  from the MCA. */
  isFetched: (key: string, value?: string) => boolean;
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
  // Documents the MCA already returned (Case A): they stand in for uploads
  // until the customer swaps one out.
  const fetched = useMemo(() => content.steps.kyc.fetched?.[caseId] ?? {}, [content, caseId]);
  const get = useCallback((key: string) => checkout[key] ?? fetched[key] ?? "", [checkout, fetched]);

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
  // Billing fields that swap to someone else's details (the company stays).
  const isPersonal = useCallback(
    (field: CheckoutField) => content.steps.billing.fields.includes(field) && !field.keepForOtherPerson,
    [content],
  );

  // The company's email domain, from the email on file (studio2rs.in).
  const companyDomain = (flow.email ?? "").split("@")[1]?.trim().toLowerCase() ?? "";
  const errorOf = useCallback(
    (field: CheckoutField, value?: string) => {
      const v = value ?? valueOf(field);
      const error = validateField(field, v, content.validationMessages);
      if (error) return error;
      // Someone else buying for the company writes from the company's domain.
      if (otherPerson && field.validate === "email" && companyDomain && v.trim() && v.trim().split("@")[1]?.toLowerCase() !== companyDomain)
        return content.companyEmailMessage.replace("{domain}", companyDomain);
      return null;
    },
    [valueOf, content.validationMessages, content.companyEmailMessage, otherPerson, companyDomain],
  );

  const statusOf = useCallback(
    (field: CheckoutField, value?: string) =>
      statusFor(field, value ?? valueOf(field), seedOf(field), otherPerson && isPersonal(field)),
    [valueOf, seedOf, otherPerson, isPersonal],
  );

  const set = useCallback((patch: Record<string, string>) => setCheckout({ ...checkout, ...patch }), [checkout, setCheckout]);

  // On: clear the Billing fields for someone else's details. Off: drop the
  // overrides so the user's own details come back.
  const setOtherPerson = useCallback(
    (on: boolean) => {
      const next = { ...checkout };
      for (const f of content.steps.billing.fields) {
        if (f.keepForOtherPerson) continue;
        if (on) next[f.key] = "";
        else delete next[f.key];
      }
      if (on) next[OTHER_PERSON_KEY] = "1";
      else delete next[OTHER_PERSON_KEY];
      setCheckout(next);
    },
    [checkout, content, setCheckout],
  );

  // The place follows the pincode unless the user picked a different one:
  // fill it only when it's empty or still matches the old pincode's place.
  const patchFor = useCallback(
    (key: string, value: string, current: (key: string) => string) => {
      const patch: Record<string, string> = { [key]: value };
      // An upload a field reads from: a new document fills the field in
      // (demo: the GSTIN from the state code + PAN); removing it clears it.
      const reader = content.steps.kyc.cases[caseId].find((f) => f.readFrom === key);
      if (reader) {
        const read = (k: string) => {
          const f = [...fieldsFor("company"), ...fieldsFor("kyc")].find((x) => x.key === k);
          return current(k) || (f ? valueOf(f) : "");
        };
        const state = read("place").split(",")[1]?.trim() ?? "";
        const pan = read("pan").trim().toUpperCase();
        patch[reader.key] = value && pan ? `${content.steps.kyc.gstStateCodes[state] ?? "19"}${pan}1Z5` : "";
        return patch;
      }
      if (key !== "pincode") return patch;
      const next = placeForPincode(value, content.pincodePlaces);
      const place = current("place");
      if (next && (!place || place === placeForPincode(current("pincode"), content.pincodePlaces))) patch.place = next;
      return patch;
    },
    [content, caseId, fieldsFor, valueOf],
  );

  const isComplete = useCallback(
    (step: Exclude<CheckoutStepId, "review">) => {
      const fieldsOk = fieldsFor(step).every((f) => !f.mandatory || (valueOf(f).trim() && !errorOf(f)));
      const uploadsOk = step !== "kyc" || content.steps.kyc.uploads.every((u) => !!get(u.key));
      return fieldsOk && uploadsOk;
    },
    [fieldsFor, valueOf, errorOf, content, get],
  );

  const progressOf = useCallback(
    (step: Exclude<CheckoutStepId, "review">) => {
      const fields = fieldsFor(step).filter((f) => f.mandatory);
      const uploads = step === "kyc" ? content.steps.kyc.uploads : [];
      const done = fields.filter((f) => valueOf(f).trim() && !errorOf(f)).length + uploads.filter((u) => !!get(u.key)).length;
      return { done, total: fields.length + uploads.length };
    },
    [fieldsFor, content, valueOf, errorOf, get],
  );

  const isFetched = useCallback(
    (key: string, value?: string) => !!fetched[key] && (value ?? get(key)) === fetched[key],
    [fetched, get],
  );

  return useMemo(
    () => ({
      caseId,
      quote: selectedQuote ?? fallbackQuote,
      fieldsFor,
      valueOf,
      statusOf,
      errorOf,
      get,
      set,
      patchFor,
      otherPerson,
      setOtherPerson,
      companyDomain,
      isComplete,
      progressOf,
      isFetched,
    }),
    [caseId, selectedQuote, fallbackQuote, fieldsFor, valueOf, statusOf, errorOf, get, set, patchFor, otherPerson, setOtherPerson, companyDomain, isComplete, progressOf, isFetched],
  );
}
