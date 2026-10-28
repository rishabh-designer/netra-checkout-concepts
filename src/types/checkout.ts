import type { QuoteCaseId } from "@/lib/quote-flow";
import type { AmountWords } from "@/lib/utils";

export type CheckoutStepId = "billing" | "verification" | "review";

/** The form sections: Billing, and the two that make up Verification (KYC
 *  first, then Company). */
export type CheckoutSection = "billing" | "company" | "kyc";

/** What a form helper takes: a section, or the Verification step (KYC +
 *  Company together). */
export type CheckoutFormPart = CheckoutSection | "verification";

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
  sectionTitles: Record<"billing" | "verification", string>;
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
  productLines: [string, string];
  productIconSrc: string;
  priceTitle: string;
  /** Paid: the one chevron's labels, opening and closing the details. */
  detailsShowLabel: string;
  detailsHideLabel: string;
  premiumLabel: string;
  gstLabel: string;
  totalLabel: string;
  /** GST rate as a fraction (0.18). */
  gstRate: number;
  insurerInfoLabel: string;
  /** Tooltips: the tags and the insurer info mark (`{insurer}` filled in). */
  tips: { immediate: string; insurer: string };
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
  /** Step CTA (Billing, Verification). */
  saveLabel: string;
  /** Tooltips on the greyed step CTA: why it can't be pressed yet. */
  ctaBlocked: { fields: string; consent: string };
  stepperLabels: Record<CheckoutStepId, string>;
  /** The journey's last step, after checkout (Policy Issuance): never
   *  reached here, it says a few small tasks follow payment. */
  stepperFinal: { label: string; tip: string };
  /** Tooltip on steps not reached yet. */
  stepperUpcomingTip: string;
  stepperAriaLabel: string;
  otherPersonLabel: string;
  steps: {
    billing: CheckoutStepChrome & { fields: CheckoutField[] };
    /** KYC + Company on one step: its title, banner and first section title;
     *  `mandate` adds the broker-mandate tick by the CTA (the cases listed). */
    verification: CheckoutStepChrome & { mandate?: CheckoutMandateContent };
    /** Company Registration Details (Verification's second section). */
    company: CheckoutStepChrome & { cases: Record<QuoteCaseId, CheckoutField[]> };
    kyc: CheckoutStepChrome & {
      uploads: CheckoutUpload[];
      cases: Record<QuoteCaseId, CheckoutField[]>;
      /** Documents already fetched from the MCA, by upload key (Case A). */
      fetched?: Partial<Record<QuoteCaseId, Record<string, string>>>;
      /** What "OCR" reads off either document (the GST certificate or the
       *  PAN card), by field key, per case: it fills the KYC numbers and the
       *  company details. */
      ocr: Record<QuoteCaseId, Record<string, string>>;
      /** The help line under a field the OCR filled, by upload key ("Read
       *  from your GST certificate"). */
      ocrNotes: Record<string, string>;
      /** Placeholder while a document is being read. */
      readingLabel: string;
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

/** A next step on the success page. `{…}` tokens in `body` are filled
 *  and highlighted by the view. */
export interface SuccessTimelineRow {
  title: string;
  /** Copy under the title; the row shows only its title without it. */
  body?: string;
}

/** A "BimaNetra Suggests" product card. */
export interface SuccessSuggestion {
  name: string;
  body: string;
  iconSrc: string;
  immediate?: boolean;
  /** The NetraBot reaction (an animation key) played when the card is hovered. */
  botReaction?: string;
}

/** Checkout (Success), Figma 670:51168: the end of the journey after Pay. */
export interface CheckoutSuccessContent {
  /** The greeting card's serif headline (692:58159); `{name}` is the buyer's
   *  first name. */
  headline: string;
  /** Under the greeting card's rule, once the mandate is e-Signed:
   *  `{riskHeld}` and `{dashboard}` are links; `lead` opens it, in bold;
   *  `{issueDate}` is `issueWorkingDays` working days after payment (DD/MM/YYYY),
   *  also filled in the Policy Issuance row. */
  upNext: { lead: string; body: string; riskHeld: string; dashboard: string; issueWorkingDays: number };
  badgeAlt: string;
  /** Start, end and period (the premium is in the Purchase Summary). */
  stats: { startLabel: string; endLabel: string; periodLabel: string; periodValue: string };
  /** The journey's pills over the greeting card, in order (Due Diligence
   *  only while the mandate is still to sign). */
  stepLabels: [string, string, string, string, string];
  /** Labels over the next steps: now, and after `{days}` working days. */
  next: { now: string; after: string };
  /** The next action once the mandate is given: the Risk Held Letter. */
  riskHeldStep: SuccessTimelineRow;
  /** `mandate.body`'s `{mandate}`: the underlined phrase. */
  mandate: SuccessTimelineRow & { link: string };
  issuance: SuccessTimelineRow;
  signLabel: string;
  /** The Mandate Letter already e-Signed: Checkout's action in place of Due Diligence. */
  riskHeldLabel: string;
  /** A scored quote's pill: "{count} Key Features". */
  keyLinesLabel: string;
  /** The header action, with the mandate already signed. */
  dashboardLabel: string;
  viewPolicyLabel: string;
  /** Tooltip on View Policy Copy before the policy is issued. */
  viewPolicyPendingTip: string;
  /** The Purchase Summary's paid footer: a small button for the tax invoice. */
  invoiceLabel: string;
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
  /** `body`, a line about them, is optional (left out for now). */
  rm: { eyebrow: string; name: string; photoSrc: string; body?: string; phone: string; phoneHref: string; phoneIconSrc: string };
  suggestions: { title: string; ctaLabel: string; immediateLabel: string; immediateTip: string; items: SuccessSuggestion[] };
  /** Screen-reader note while the page loads. */
  loadingLabel: string;
  /** The Risk Held Letter popup (Figma 683:56601): opens `delayMs` after the
   *  page has loaded, on a lightbox, and can't be dismissed; either action
   *  confirms with a toast (`{email}` / `{phone}`) and closes it. */
  riskHeld: {
    title: string;
    /** The opening line, in the primary label colour (same weight): cover has started. */
    lead: string;
    body: string;
    /** The × in the top-right corner. */
    closeLabel: string;
    /** The letter preview, drawn in code (683:56607): its header title, the
     *  line naming the policy (`{company}`), and the back sheet's labels. */
    preview: { title: string; forLabel: string; backEyebrow: string; backTitle: string };
    imageAlt: string;
    downloadLabel: string;
    whatsappLabel: string;
    downloadToast: { title: string; description: string };
    whatsappToast: { title: string; description: string };
    delayMs: number;
  };
}

/** Verification's broker mandate: a consent tick (blue, info) that gates
 *  Save & Continue in the listed cases. */
export interface CheckoutMandateContent {
  cases: QuoteCaseId[];
  consentText: string;
  /** The link after the tick's text: opens `letter`. */
  viewLabel: string;
  /** The letter preview: `{company}` in the paragraphs and sign-off, `{date}` (DD/MM/YYYY) in `dateLabel`. */
  letter: {
    title: string;
    closeLabel: string;
    dateLabel: string;
    to: string[];
    subject: string;
    paragraphs: string[];
    signOff: string;
    signatory: string;
  };
}
