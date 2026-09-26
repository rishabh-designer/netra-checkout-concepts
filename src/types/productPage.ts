import type { CheckoutValidator } from "./checkout";

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
  variant: "success" | "special" | "secondary";
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

export interface CompanySearchContent {
  /** Beside the divider above the registry names. */
  recordsLabel: string;
  /** Characters typed before suggestions show. */
  minChars: number;
  /** One entry per known company: the best match, then its MCA records. */
  companies: { best: string; records: string[] }[];
}

export interface KnowMoreContent {
  title: string;
  intro: string;
  points: { title: string; body: string }[];
  closeLabel: string;
}

export interface LeadFormContent {
  priceKicker: string;
  priceHeadline: string;
  promoBadge: string;
  promoLabel: string;
  promoLinkLabel: string;
  /** The "Know More" popup explaining BimaNetra (placeholder until marketing
   *  supplies final copy). */
  knowMore: KnowMoreContent;
  inputPlaceholder: string;
  /** Type-ahead under the company name: pick the entity before continuing. */
  companySearch: CompanySearchContent;
  /** Body copy for the company-name field's info-icon tooltip. */
  inputTooltip: string;
  /** Demo shortcut: clicking the input's info icon cycles through these
   *  company names (one per case); clearing the field resets the cycle. */
  demoNames?: string[];
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

export type QuoteFieldHelpTone = "neutral" | "error" | "success" | "basic";

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
  /** Hover tooltip on the field's info (i) icon. */
  infoTooltip?: string;
  /** Format rule, checked on blur and before the step can continue. */
  validate?: CheckoutValidator;
  inputMode?: "text" | "numeric" | "email" | "tel";
  maxLength?: number;
  /** Uppercase as typed (PAN). */
  upper?: boolean;
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

/** One data source the engine checks while it researches. */
export interface QuoteResearchSource {
  label: string;
  /** What it returned: a match, a weak / partial match, or nothing. */
  result: "hit" | "partial" | "miss";
}

export interface QuoteSearchPanel {
  query: string;
  tabs: string[];
  /** null when the probe found nothing (Case C). */
  body: QuoteSearchBody | null;
  emptyNote?: string;
  /** Sources lit up in turn while the engine scans. */
  sources: QuoteResearchSource[];
  /** Closing readout; `{sources}` = sources that returned something,
   *  `{fields}` = fields filled. */
  verdict: string;
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
  /** Demo shortcut: clicking the step title fills these values (by field key). */
  demoFill?: Record<string, string>;
}

/** One form step in the modal flow (Profile → Business → Risk). */
export interface QuoteStep {
  key: string;
  /** Header title, e.g. "Profile" / "Business" / "Risk". */
  title: string;
  /** Which left-panel search tab reads active on this step (Business = first
   *  "Netra Mode", Insurance = last "News"; "" when the step has no search). */
  activeTab: string;
  /** Data-collection step (Profile): field status reacts to whether each field is
   *  filled, rather than to the resolved A/B/C case. */
  collectMode?: boolean;
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
  /** Agent Progress verb under the result tabs while details load. */
  progressLabel: string;
  tasks: EngineTask[];
}

/** Routes a typed company name to a flow case. */
export interface QuoteCaseMatch {
  caseId: "A" | "B" | "C";
  /** Matched trimmed, case-insensitive, whitespace-collapsed. */
  aliases: string[];
  /** Replaces the typed name in the modal + Quotes page (e.g. the legal name). */
  canonicalName?: string;
  /** Help line under the company name when it was swapped for the legal name,
   *  with an action that closes the modal so the name can be re-typed. */
  nameHelp?: { text: string; actionLabel: string };
}

export interface QuoteModalContent {
  /** Typed-name → case routing; unmatched names resolve to Case C. */
  caseMatches: QuoteCaseMatch[];
  /** Ordered form steps; `stepIndex` walks these. */
  steps: QuoteStep[];
  /** The left-panel task-runner (index-aligned to `steps`). */
  engine: IntelligenceEngine;
  /** Denominator for the live progress meter — total mandatory questions across
   *  the whole flow (incl. the future Report step). Tune to re-anchor the %. */
  totalFlowQuestions: number;
  /** CTA on every step but the last (which shows `ctaLabel`). */
  continueLabel: string;
  /** Error lines for fields with a `validate` rule. */
  validationMessages: Partial<Record<CheckoutValidator, string>>;
  /** Footer-stepper pills — labels only; the last ("Quotes") is a future step
   *  with no form. Earlier than the current step = done/green. */
  stepperLabels: string[];
  ctaLabel: string;
  /** Help-row error under the company name when the form is sent empty. */
  emptyNameError: string;
  /** Shown when the terminal "Go to Quotes" CTA is pressed (Quotes page pending). */
  completeToast: { title: string; description: string };
}

/** The product mark's micro-animations (click the icon to cycle). */
export type PlpMarkMode = "sunrise" | "strokes" | "tilt" | "spill";

export interface PlpMarkModeContent {
  id: PlpMarkMode;
  name: string;
  description: string;
}

/** Copy for the "Focus" landing concept (single-column, offer-led hero). */
export interface FocusHeroContent {
  eyebrow: string;
  /** Product icon between the pills (shown top half, shimmering). */
  plpIconSrc: string;
  /** Accessible name of the icon button that cycles its animation. */
  markLabel: string;
  /** Animation modes in click order (the first plays on load). */
  markModes: PlpMarkModeContent[];
  /** Toast title on switch; "{name}" is the mode's name. */
  markToastTitle: string;
  /** Headline in two parts: the cover (orange, small) + the price (purple). */
  headlineCover: string;
  headlinePrice: string;
  /** What the policy covers — rotated in the chip under the subtitle. */
  coveredChips: string[];
  /** Green tick shared with the Quote Card coverage chips. */
  coveredIconSrc: string;
  /** Reassurance under the CTA. */
  privacyLine: string;
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
  focusHero: FocusHeroContent;
}
