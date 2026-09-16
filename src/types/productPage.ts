/** Shared content types for the product page. All copy flows from /lib/api. */

export interface NavItem {
  label: string;
  hoverLabel: string;
  hasDropdown?: boolean;
  href: string;
}

export interface NavContent {
  logoSrc: string;
  logoAlt: string;
  items: NavItem[];
  loginLabel: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProductTag {
  label: string;
  variant: "success" | "special";
  /** Which animated icon fills the tag's icon slot; "placeholder" keeps the grey square. */
  icon: "placeholder" | "shoppingBag" | "eye";
}

export interface TrustStat {
  value: string;
  label: string;
}

export interface InsurerLogo {
  src: string;
  alt: string;
  width: number;
}

export interface VideoSource {
  src: string;
  /** MIME type, e.g. "video/webm" or "video/mp4". */
  type: string;
}

export interface MediaContent {
  /** Ordered by preference; the browser picks the first it can play. */
  videoSources: VideoSource[];
  stillSrc: string;
  stillAlt: string;
}

export interface LeadFormContent {
  priceKicker: string;
  priceHeadline: string;
  promoBadge: string;
  promoLabel: string;
  promoLinkLabel: string;
  inputPlaceholder: string;
  /** Body copy for the company-name field's info-icon tooltip. */
  inputTooltip: string;
  ctaLabel: string;
  ctaMeta: string;
  providersHeading: string;
  /**
   * Each entry is one slot in the logo wall; the slot cycles through its
   * logos (one per "set") with a staggered blur cross-fade.
   */
  providerShowcase: InsurerLogo[][];
}

export type QuoteFieldControl = "text" | "select" | "toggle" | "search";
/** verified = Name (purple), success = confirmed/match (green), userFilled =
 *  user-supplied under review (purple, basic ink), fuzzy = web guess (orange),
 *  empty = nothing found (grey placeholder), error = invalid (red). */
export type QuoteFieldStatus =
  | "verified"
  | "success"
  | "userFilled"
  | "fuzzy"
  | "empty"
  | "error";

export type QuoteFieldHelpTone = "neutral" | "error" | "success";

export interface QuoteModalField {
  key: string;
  label: string;
  mandatory?: boolean;
  control: QuoteFieldControl;
  /** Filled value (A/B) or "" when empty (C). */
  value: string;
  placeholder?: string;
  /** Fixed, non-editable affix shown before the input (e.g. "+91" on Phone). */
  prefix?: string;
  /** Options for a `select` control — lets Case C be filled in. */
  options?: string[];
  status: QuoteFieldStatus;
  /** Contextual help/disclaimer shown in the reserved help row (see helpTone). */
  helpText?: string;
  helpTone?: QuoteFieldHelpTone;
}

export interface QuoteSearchBody {
  cinSentence?: string;
  cinHighlight?: string;
  detailsHeading: string;
  details: string[];
  founderTag?: string;
  footer: string;
  /** true = hedged "best guess" styling (Case B). */
  tentative?: boolean;
}

export interface QuoteSearchPanel {
  query: string;
  tabs: string[];
  /** null when the probe found nothing (Case C). */
  body: QuoteSearchBody | null;
  emptyNote?: string;
}

/** Auto-personalize badge (Insurance case A): "New · Being Personalized" while
 *  the probe runs, then "Personalized!" once resolved. */
export interface QuotePersonalize {
  pendingLabel: string;
  doneLabel: string;
  skipLabel: string;
}

export interface QuoteCase {
  fields: QuoteModalField[];
  requiresConsent: boolean;
  consentText?: string;
  search: QuoteSearchPanel;
  personalize?: QuotePersonalize;
}

/** The "Before you Insure" step — a skippable Risk-Report offer. When present on
 *  a step, the modal renders the report layout (document mockup + one Yes/No
 *  question) instead of the Intelligence Engine split. */
export interface QuoteReport {
  /** The single question, e.g. "Are you interested in a free customized Risk Report?" */
  question: string;
  /** Blue helper line shown once the user answers "Yes". */
  yesInfo: string;
  /** The document-mockup asset shown on the left (public/Form/risk.report.svg). */
  visualSrc: string;
  visualAlt: string;
}

/** One form step in the modal flow (Profile → Business → Insurance → Report). */
export interface QuoteStep {
  key: string;
  /** Header title, e.g. "Profile" / "Business" / "Before you Insure". */
  title: string;
  /** Which left-panel search tab reads active on this step (Business = first
   *  "Netra Mode", Insurance = last "News"; "" when the step has no search). */
  activeTab: string;
  /** Data-collection step (Profile / Report): field status reacts to whether each
   *  field is filled, rather than to the resolved A/B/C case. */
  collectMode?: boolean;
  /** Present on the Report step — switches the modal to the report layout. */
  report?: QuoteReport;
  /** Per-step CTA override (Report = "Go to Quotes"); falls back to content.ctaLabel. */
  ctaLabel?: string;
  cases: { A: QuoteCase; B: QuoteCase; C: QuoteCase };
}

/** One row of the Intelligence Engine task-runner, index-aligned to `steps`. */
export interface EngineTask {
  /** Label while the task is running/pending (e.g. "Confirm your Insurance"). */
  activeLabel: string;
  /** Optional swap once the step's inputs are complete (Profile only:
   *  "Ready to Confirm Profile"). */
  readyLabel?: string;
  /** Collapsed label once the task is done ("Profile Confirmed"). */
  doneLabel: string;
  /** true = the active task expands the Netra search viz (Business/Insurance);
   *  false = no search body (Profile). */
  hasSearch: boolean;
}

/** The persistent left-panel "Intelligence Engine" — a request bubble, the
 *  engine's reply, a live progress meter and the 3-task runner. */
export interface IntelligenceEngine {
  /** The opt-in the user checked on the product page ("Personalize My Quote"). */
  requestLabel: string;
  /** Engine reply; `{company}` is replaced with the typed company name. */
  messageTemplate: string;
  /** Progress-meter heading ("Getting Started"). */
  headingLabel: string;
  tasks: EngineTask[];
}

export interface QuoteModalContent {
  /** Ordered form steps; `stepIndex` walks these. */
  steps: QuoteStep[];
  /** The left-panel task-runner (index-aligned to `steps`). */
  engine: IntelligenceEngine;
  /** Denominator for the live progress meter — total mandatory questions across
   *  the whole flow (incl. the future Report step). Tune to re-anchor the %. */
  totalFlowQuestions: number;
  /** Footer-stepper pills — labels only; the last ("Quotes") is a future step
   *  with no form. Earlier than the current step = done/green. */
  stepperLabels: string[];
  ctaLabel: string;
  emptyNameToast: { title: string; description: string };
  /** Shown when the terminal "Go to Quotes" CTA is pressed (Quotes page pending). */
  completeToast: { title: string; description: string };
}

export interface ProductPageContent {
  nav: NavContent;
  breadcrumbs: BreadcrumbItem[];
  tags: ProductTag[];
  title: string;
  subtitle: string;
  stats: TrustStat[];
  media: MediaContent;
  leadForm: LeadFormContent;
  quoteModal: QuoteModalContent;
  tickerPhrases: string[];
  flourishSrc: string;
}
