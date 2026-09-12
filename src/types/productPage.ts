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
  noiseSrc: string;
}

export interface LeadFormContent {
  priceKicker: string;
  priceHeadline: string;
  promoBadge: string;
  promoLabel: string;
  promoLinkLabel: string;
  inputPlaceholder: string;
  ctaLabel: string;
  ctaMeta: string;
  providersHeading: string;
  /**
   * Each entry is one slot in the logo wall; the slot cycles through its
   * logos (one per "set") with a staggered blur cross-fade.
   */
  providerShowcase: InsurerLogo[][];
}

export type QuoteFieldControl = "text" | "select";
/** verified = Name (purple), success = confirmed (green), fuzzy = guess
 *  (orange), empty = nothing found (grey placeholder). */
export type QuoteFieldStatus = "verified" | "success" | "fuzzy" | "empty";

export interface QuoteModalField {
  key: string;
  label: string;
  mandatory?: boolean;
  control: QuoteFieldControl;
  /** Filled value (A/B) or "" when empty (C). */
  value: string;
  placeholder?: string;
  /** Options for a `select` control — lets Case C be filled in. */
  options?: string[];
  status: QuoteFieldStatus;
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

export interface QuoteCase {
  fields: QuoteModalField[];
  requiresConsent: boolean;
  consentText?: string;
  search: QuoteSearchPanel;
}

export interface QuoteModalContent {
  stepLabel: string;
  title: string;
  ctaLabel: string;
  emptyNameToast: { title: string; description: string };
  cases: { A: QuoteCase; B: QuoteCase; C: QuoteCase };
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
