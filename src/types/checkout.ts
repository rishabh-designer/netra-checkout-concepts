import type { QuoteCaseId } from "@/lib/quote-flow";

export type CheckoutStepId = "billing" | "company" | "kyc" | "review";

/** How a field's status reads before the user touches it. */
export type CheckoutFieldStatus = "verified" | "success" | "fuzzy" | "userFilled" | "empty";

/** Named validators (see lib/checkout.ts). */
export type CheckoutValidator = "phone" | "email" | "pincode" | "gstin" | "pan";

/** One checkout input. `value` is the per-case default; `seedFrom` pulls a live
 *  value from the lead flow instead ("companyName" or a flow field key). */
export interface CheckoutField {
  key: string;
  label: string;
  /** Label on the Review page (defaults to `label`). */
  reviewLabel?: string;
  mandatory?: boolean;
  control: "text" | "select" | "textarea";
  value?: string;
  seedFrom?: string;
  status: CheckoutFieldStatus;
  placeholder?: string;
  prefix?: string;
  options?: string[];
  inputMode?: "text" | "numeric" | "email" | "tel";
  maxLength?: number;
  validate?: CheckoutValidator;
  /** Uppercase as the user types (GSTIN, PAN). */
  upper?: boolean;
  /** Stays put when "Buy in Another Person's Name" is on (the company is
   *  still the one being insured). */
  keepForOtherPerson?: boolean;
  /** Shown but not editable (greyed): the company name on Billing. */
  locked?: boolean;
}

/** A document upload (KYC). The stored value is the uploaded file's name. */
export interface CheckoutUpload {
  key: string;
  label: string;
  reviewLabel: string;
  title: string;
}

export interface CheckoutUploadCopy {
  hint: string;
  successTitle: string;
  /** `{file}` is replaced with the file name. */
  successBody: string;
  failureTitle: string;
  tooLarge: string;
  wrongType: string;
  cancelLabel: string;
  retryLabel: string;
  disabledTitle: string;
  disabledBody: string;
  /** Auto-fetched from the MCA (Case A's KYC): title, body (`{file}`), and
   *  the button that swaps in the customer's own file. */
  fetchedTitle: string;
  fetchedBody: string;
  fetchedAction: string;
  /** Largest accepted file, in bytes. */
  maxBytes: number;
}

/** Shared chrome of a form step. */
export interface CheckoutStepChrome {
  title: string;
  banner: string;
  sectionTitle: string;
  /** "Buy in Another Person's Name": live on Billing, faded on Review, hidden elsewhere. */
  otherPerson: "live" | "faded" | "hidden";
}

export interface CheckoutReviewContent extends CheckoutStepChrome {
  sectionTitles: Record<"billing" | "company" | "kyc", string>;
  editLabel: string;
  uploadedLabel: string;
  consentText: string;
  /** Final CTA: immediate purchases pay, priced quotes request. */
  payLabel: string;
  requestLabel: string;
  postCheckoutToast: { title: string; description: string };
}

export interface CheckoutSummaryContent {
  title: string;
  immediateLabel: string;
  /** Pill on the Gold Quote's summary (in place of Immediate Purchase). */
  poweredByLabel: string;
  productLines: [string, string];
  productIconSrc: string;
  priceTitle: string;
  premiumLabel: string;
  gstLabel: string;
  totalLabel: string;
  /** GST rate as a fraction (0.18). */
  gstRate: number;
  /** The BimaNetra offer (quotes with an original price): label, and the
   *  percent note after the saving ("{pct}" is the rounded percent off). */
  offerLabel: string;
  offerPercent: string;
  finalLabel: string;
  insurerInfoLabel: string;
}

export interface CheckoutContent {
  header: { logoSrc: string; logoAlt: string; supportLabel: string; supportIconSrc: string; cautionIconSrc: string; kolamSrc: string };
  /** Page title (every step) and the back chip to the quotes. */
  title: string;
  backLabel: string;
  /** Agent Progress above the summary: runs from checkout's first step until
   *  the final CTA is pressed. */
  preparingLabel: string;
  /** Step CTA (Billing, Company, KYC). */
  saveLabel: string;
  /** Verification for guessed (fuzzy) details: steps with a guessed field
   *  need this ticked before Save & Continue (Case B). */
  verifyText: string;
  stepperLabels: Record<CheckoutStepId, string>;
  stepperAriaLabel: string;
  otherPersonLabel: string;
  steps: {
    billing: CheckoutStepChrome & { fields: CheckoutField[] };
    company: CheckoutStepChrome & { cases: Record<QuoteCaseId, CheckoutField[]> };
    kyc: CheckoutStepChrome & {
      uploads: CheckoutUpload[];
      cases: Record<QuoteCaseId, CheckoutField[]>;
      /** Documents already fetched from the MCA, by upload key (Case A). */
      fetched?: Partial<Record<QuoteCaseId, Record<string, string>>>;
    };
    review: CheckoutReviewContent;
  };
  upload: CheckoutUploadCopy;
  summary: CheckoutSummaryContent;
  disclaimer: { title: string; toggleLabel: string; paragraphs: string[] };
  drawer: { saveLabel: string; closeLabel: string };
  validationMessages: Record<CheckoutValidator, string>;
  /** [pincode prefix, Place of Incorporation] pairs for the pincode autofill. */
  pincodePlaces: [string, string][];
  /** Lead-flow values used when checkout is opened without a flow (reload / direct URL). */
  fallbackValues: Record<string, string>;
  fallbackCompanyName: string;
}
