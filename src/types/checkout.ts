import type { QuoteCaseId } from "@/lib/quote-flow";
import type { AmountWords } from "@/lib/utils";

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
  /** Read off this upload (by key): locked until it's uploaded, then filled
   *  in from the document and editable (the GSTIN from the certificate). */
  readFrom?: string;
  /** The placeholder while it waits for that upload. */
  lockedPlaceholder?: string;
  /** A rupee amount: digits only, Indian grouping as they type, and the
   *  amount in words under the field ("Rupees 800 Crore"). */
  amountWords?: AmountWords;
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
  /** Tooltip on Billing's disabled Edit Details. */
  lockedEditTip: string;
  uploadedLabel: string;
  consentText: string;
  /** Final CTA: immediate purchases pay, priced quotes request. */
  payLabel: string;
  /** Mobile: the footer shows the price beside the CTA. */
  payNowLabel: string;
  requestLabel: string;
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
  /** With an offer, the total before it ("Price"); `totalLabel` is then the amount to pay. */
  priceLabel: string;
  insurerInfoLabel: string;
  /** Tooltips: the tags and the insurer info mark (`{insurer}` filled in). */
  tips: { immediate: string; gold: string; insurer: string };
  /** Badge on the insurer box of a paid Gold Quote (Figma 670:53310). */
  excellentLabel: string;
}

export interface CheckoutContent {
  header: { logoSrc: string; logoAlt: string; supportLabel: string; supportIconSrc: string; cautionIconSrc: string; kolamSrc: string };
  /** Page title (every step) and the back chip to the quotes. */
  title: string;
  backLabel: string;
  /** The back chip after the first step: `{step}` is the previous step's
   *  stepper label ("Back to Billing"). */
  backToStepLabel: string;
  /** Agent Progress above the summary: runs from checkout's first step until
   *  the final CTA is pressed. */
  preparingLabel: string;
  /** Mobile: the pinned footer (Figma 734:35259 / 734:34798): the final
   *  price's label beside the CTA, and the toggle that opens the summary. */
  footer: { totalLabel: string; showSummaryLabel: string; hideSummaryLabel: string };
  /** Step CTA (Billing, Company, KYC). */
  saveLabel: string;
  /** Tooltips on the greyed step CTA: why it can't be pressed yet. */
  ctaBlocked: { fields: string; consent: string };
  /** Verification for guessed (fuzzy) details: steps with a guessed field
   *  need this ticked before Save & Continue (Case B). */
  verifyText: string;
  stepperLabels: Record<CheckoutStepId, string>;
  /** Tooltip on steps not reached yet. */
  stepperUpcomingTip: string;
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
      /** GST state codes by state, to "read" a GSTIN off an uploaded
       *  certificate: code + PAN + "1Z5". */
      gstStateCodes: Record<string, string>;
    };
    review: CheckoutReviewContent;
  };
  upload: CheckoutUploadCopy;
  summary: CheckoutSummaryContent;
  /** `contextual` leads the legal paragraphs: one line per page it's read on. */
  disclaimer: { title: string; toggleLabel: string; contextual: { checkout: string; success: string }; paragraphs: string[] };
  success: CheckoutSuccessContent;
  drawer: { saveLabel: string; closeLabel: string };
  validationMessages: Record<CheckoutValidator, string>;
  /** Buying in another person's name: their email must be at the company's
   *  domain (`{domain}`, from the email on file). */
  companyEmailMessage: string;
  /** [pincode prefix, Place of Incorporation] pairs for the pincode autofill. */
  pincodePlaces: [string, string][];
  /** Lead-flow values used when checkout is opened without a flow (reload / direct URL). */
  fallbackValues: Record<string, string>;
  fallbackCompanyName: string;
}

/** A timeline row on the success page. `{…}` tokens in `body` are filled
 *  and highlighted by the view. */
export interface SuccessTimelineRow {
  title: string;
  body: string;
  /** Status on the right of a done row ("Profiling Done") and its time. */
  statusLabel?: string;
  time?: string;
}

/** A "BimaNetra Suggests" product card. */
export interface SuccessSuggestion {
  name: string;
  body: string;
  iconSrc: string;
  immediate?: boolean;
}

/** Checkout (Success), Figma 670:51168: the end of the journey after Pay. */
export interface CheckoutSuccessContent {
  /** `{name}`, `{company}` and `{order}` (the order number, highlighted). */
  greeting: string;
  orderPrefix: string;
  badgeAlt: string;
  stats: { startLabel: string; endLabel: string; premiumLabel: string; periodLabel: string; periodValue: string };
  /** Left rail pills, in row order. */
  stepLabels: [string, string, string, string, string];
  profiling: SuccessTimelineRow;
  /** Quote Selected: the Gold Quote, or any other quote (`{insurer}`). */
  quoteGold: SuccessTimelineRow;
  quoteOther: SuccessTimelineRow;
  /** Due Diligence per case (A found everything, B confirmed, C typed in),
   *  and for quotes an expert confirms before issuing. `{time}` is how long
   *  checkout took. */
  diligence: Record<QuoteCaseId, SuccessTimelineRow> & { expert: SuccessTimelineRow };
  /** `mandate.body`'s `{mandate}`: the underlined phrase. */
  mandate: SuccessTimelineRow & { link: string };
  issuance: SuccessTimelineRow;
  signLabel: string;
  /** The timeline chevron: show or hide a step's copy. */
  stepToggle: { show: string; hide: string };
  viewPolicyLabel: string;
  /** Tooltip on View Policy Copy before the policy is issued. */
  viewPolicyPendingTip: string;
  /** Text link on the profiling row, in place of its status. */
  riskReportLabel: string;
  /** Bottom line beside the big Sign Mandate Letter button. */
  nextUp: string;
  /** Hides the bottom Next Up bar (kept for later). */
  hideNextUp?: boolean;
  /** Sign Mandate Letter: the letter is emailed (`{email}`). */
  mandateToast: { title: string; description: string };
  /** Summary card, once paid: `{date}`. */
  paidLabel: string;
  coveragesLabel: string;
  personalizedLabel: string;
  rm: { eyebrow: string; name: string; photoSrc: string; body: string; phone: string; phoneHref: string; phoneIconSrc: string };
  suggestions: { title: string; ctaLabel: string; immediateLabel: string; immediateTip: string; items: SuccessSuggestion[] };
  /** Screen-reader note while the page loads. */
  loadingLabel: string;
  /** The Risk Held Letter popup (Figma 683:56601): opens `delayMs` after the
   *  page has loaded, on a lightbox, and can't be dismissed; either action
   *  confirms with a toast (`{email}` / `{phone}`) and closes it. */
  riskHeld: {
    title: string;
    body: string;
    /** The letter preview, drawn in code (683:56607): its header title, the
     *  line naming the policy (`{company}`), and the back sheet's labels. */
    preview: { title: string; forLabel: string; backEyebrow: string; backTitle: string; summaryLabel: string };
    imageAlt: string;
    downloadLabel: string;
    whatsappLabel: string;
    downloadToast: { title: string; description: string };
    whatsappToast: { title: string; description: string };
    delayMs: number;
  };
}
