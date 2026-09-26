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
  /** Hide the label row on the step page (Billing, per Figma). */
  hideLabel?: boolean;
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
  /** Largest accepted file, in bytes. */
  maxBytes: number;
}

export interface CheckoutProgress {
  percent: number;
  timeLeft: string;
}

/** Shared chrome of a form step. */
export interface CheckoutStepChrome {
  title: string;
  backLabel: string;
  banner: string;
  sectionTitle: string;
  progress: CheckoutProgress;
  /** Smaller banner (16px icon, 12px text) for long copy (Billing). */
  bannerCompact?: boolean;
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
  productLines: [string, string];
  productIconSrc: string;
  priceTitle: string;
  premiumLabel: string;
  gstLabel: string;
  totalLabel: string;
  /** GST rate as a fraction (0.18). */
  gstRate: number;
  saveLabel: string;
  badgeSrc: string;
  insurerInfoLabel: string;
}

export interface CheckoutContent {
  header: { logoSrc: string; logoAlt: string; supportLabel: string; supportIconSrc: string; cautionIconSrc: string; watermarkSrc: string };
  stepperLabels: Record<CheckoutStepId, string>;
  stepperAriaLabel: string;
  otherPersonLabel: string;
  steps: {
    billing: CheckoutStepChrome & { fields: CheckoutField[] };
    company: CheckoutStepChrome & { cases: Record<QuoteCaseId, CheckoutField[]> };
    kyc: CheckoutStepChrome & { uploads: CheckoutUpload[]; cases: Record<QuoteCaseId, CheckoutField[]> };
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
