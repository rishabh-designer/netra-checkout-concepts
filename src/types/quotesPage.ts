import type { BreadcrumbItem } from "./productPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import type { CheckoutField, CheckoutUpload, CheckoutUploadCopy } from "./checkout";

/** Minimal page header: logotype + a single right-side CTA ("Chat with Us"). */
export interface QuotesHeaderContent {
  logoSrc: string;
  logoAlt: string;
  ctaLabel: string;
  /** The CTA once pressed, when it is a one-shot action (Send Risk Report). */
  ctaSentLabel?: string;
  /** The CTA while the compare view is open (Quotes page). */
  compareCtaLabel?: string;
}

/** One "Your Details" row. `key` (a flow field key) overrides `value` with the
 *  live value the user entered, when present. */
export interface QuoteDetailRow {
  label: string;
  value: string;
  key?: string;
}

/** The "Ready to Upgrade?" banner under the details list (progress + Notify Me). */
export interface UpgradeBannerContent {
  title: string;
  body: string;
  percent: number;
  timeLeft: string;
  ctaLabel: string;
  /** Top-right alert once Notify Me is pressed. */
  notifyToast: { title: string; description: string };
  /** Hidden demo shortcut: the percent is a button that simulates verification. */
  simulateLabel: string;
  /** Time-left readouts rolled through as the simulated count passes each
   *  third of the way to 100%. */
  timeSteps: string[];
}

/** "You're Upgraded!" — the exact-match (Case A) banner once the Gold Quote
 *  is revealed (Figma 564:32956): title + one line, no meter or action. */
export interface UpgradedBannerContent {
  title: string;
  body: string;
  /** A case's own title / body where they differ (B: only partly verified). */
  titleByCase?: Partial<Record<QuoteCaseId, string>>;
  bodyByCase?: Partial<Record<QuoteCaseId, string>>;
  /** A case's Notify Me under the body (B: we'll call once the report can price it). */
  notifyByCase?: Partial<Record<QuoteCaseId, string>>;
  /** Hidden demo shortcut: clicking the banner resets verification to the start. */
  resetLabel: string;
}

export interface DetailsPanelContent {
  title: string;
  editLabel: string;
  rows: QuoteDetailRow[];
  upgrade: UpgradeBannerContent;
  upgraded: UpgradedBannerContent;
  /** Case C (no public records): nothing to verify, so no progress; point the
   *  customer to an expert instead. */
  noRecords: NoRecordsBannerContent;
  /** The company the quotes are for, at the banner's foot (Figma 683:57069):
   *  its field label (screen readers) and the info icon's tooltip. */
  companyLabel: string;
  companyInfo: string;
}

export interface NoRecordsBannerContent {
  title: string;
  body: string;
  ctaLabel: string;
  /** Where the CTA goes (a tel: link to the experts) on phones. */
  ctaHref: string;
  /** On larger screens, a meeting booking in place of the call. */
  webCtaLabel: string;
}

/** "Need Help?" banner in the feed header — IRDAI experts + phone. */
export interface NeedHelpContent {
  title: string;
  subtitle: string;
  phone: string;
  /** Stacked expert photos, pre-composited into one image (Figma 564:35811). */
  avatarsSrc: string;
  avatarsAlt: string;
  /** "Chat with Us" CTA pinned to the bottom of the Help Desk column (593:64948). */
  chatLabel: string;
  chatIconSrc: string;
}

/** One insurer quote card. */
export interface QuoteCardData {
  insurer: string;
  logoSrc: string;
  sumInsured: string;
  /** Immediate-purchase quotes surface first, carry a price, and are comparable. */
  immediate?: boolean;
  /** Shown as a filled price pill instead of "Get Quote" (immediate purchase). */
  price?: string;
  /** The price before the offer, shown struck through beside `price`. */
  originalPrice?: string;
  /** 0–100; renders a "X% Match" progress bar when set. */
  matchPercent?: number;
  /** true → "Add to Compare" checkbox; false/undefined → "Comparison Unavailable". */
  comparable?: boolean;
  /** true → a locked "ghost" card whose only action is "Reveal Quote" (fuzzy match). */
  ghost?: boolean;
  /** "Top Coverages" chips; omitted on unpriced Get Quote cards. */
  coverages?: string[];
  /** The revealed exact-match "Gold Quote" (Figma 553:29978): caution-gold card,
   *  "Secured with BimaNetra" pill, orange Get Quote. */
  gold?: boolean;
  /** How this quote compares against the Gold Quote — set by the feed only
   *  when a Gold Quote is present (exact match). */
  rating?: QuoteRating;
  /** Where the policy covers you — a purple tag on the card, left of
   *  Immediate Purchase / Secured with BimaNetra. */
  territory?: QuoteTerritory;
  /** This quote's own policy wording for the details modal (Overview,
   *  Coverages/Extensions, Exclusions); the other tabs stay standard. */
  policy?: QuotePolicy;
}

export type QuoteTerritory = "worldwide" | "india";

/** One quote's policy wording. `top` names its top coverages (all titles in
 *  `coverages`); for priced quotes they're also the card's `coverages`. */
export interface QuotePolicy {
  top: string[];
  overview: FeatureItem[];
  coverages: FeatureItem[];
  exclusions: FeatureItem[];
  /** Compare view values by row key (CompareRow.key). Comparable quotes only. */
  compare?: Record<string, string>;
}

/** One row of the compare table. `source` rows read the quote itself
 *  (premium, Sum Insured, territory, top coverages); the rest read
 *  `policy.compare[key]`, falling back to `CompareViewContent.notIncludedLabel`. */
export interface CompareRow {
  key: string;
  title: string;
  /** Plain-language explainer, shown when the row is expanded. */
  body?: string;
  source?: "premium" | "sumInsured" | "territory" | "top";
}

export interface CompareSection {
  key: string;
  /** Which tab the section sits under. */
  tab: string;
  title: string;
  /** Section mark: tick (covered), cross (excluded) or info dot. */
  tone: FeatureTab["tone"];
  rows: CompareRow[];
}

/** The compare view (Compare Now): picked quotes side by side. */
export interface CompareViewContent {
  title: string;
  /** Under the title; `{count}` is the number of quotes. */
  subtitle: string;
  backLabel: string;
  /** An open column: back to the quotes to pick another. */
  addLabel: string;
  /** `{insurer}` fills the remove button's label. */
  removeLabel: string;
  differencesLabel: string;
  expandLabel: string;
  collapseLabel: string;
  notIncludedLabel: string;
  /** Premium cell of a quote without a price. */
  onRequestLabel: string;
  tabs: { key: string; label: string }[];
  sections: CompareSection[];
}

export type QuoteRating = "excellent" | "good" | "average" | "na";

/** One entry in a features-drawer tab: a titled line with its explanation. */
export interface FeatureItem {
  title: string;
  body: string;
}

/** A features-drawer tab (Figma 587:64696). `tone` picks the item marker:
 *  covered → green tick (587:63851), excluded → red cross, info → purple dot. */
export interface FeatureTab {
  key: string;
  label: string;
  tone: "covered" | "excluded" | "info";
  items: FeatureItem[];
}

/** "View All Features" drawer (Figma 587:63725). */
export interface FeaturesDrawerContent {
  /** Labels the modal for screen readers (the design shows no title). */
  title: string;
  closeLabel: string;
  /** Pagination over the shown quotes (727:34231): each chevron's tooltip
   *  names the quote it goes to, "Quote {n} of {total}". */
  pagerTip: string;
  prevQuoteLabel: string;
  nextQuoteLabel: string;
  /** Foot of the modal's summary card: the D&O mark over the product name
   *  (two lines, split at the newline). */
  productIconSrc: string;
  productName: string;
  /** Territory & Jurisdiction per the quote's territory tag; quotes without
   *  one use the tab's own (worldwide) items. */
  territoryItems: Record<QuoteTerritory, FeatureItem[]>;
  /** Pill on a quote's top coverages in the Coverages/Extensions tab. */
  topFeatureLabel: string;
  /** The Gold Quote's pill in place of `topFeatureLabel`. */
  personalizedLabel: string;
  /** Pill tooltips: what Top Feature / Personalized mean. */
  topFeatureTip: string;
  personalizedTip: string;
  /** Tab key opened first — the card's "Top Coverages" leads into coverages. */
  defaultTab: string;
  tabs: FeatureTab[];
}

/** "all", or one insurer's name (the feed builds the list from its quotes). */
export type QuoteFilter = string;
/** Feed order: the insurer default, premium either way, or most coverages first. */
/** By price, the quote as shown (GST included). */
export type QuoteSort = "priceLow" | "priceHigh";

/** How a quote's price follows the business: each mock price is for
 *  `referenceCrore` of cover at the reference turnover (factor 1). */
export interface QuotePricing {
  referenceCrore: number;
  /** Price grows with cover as (cover / reference) ^ exponent (under 1:
   *  each extra crore costs a little less). */
  coverExponent: number;
  /** Multiplier per turnover band (the flow's option labels). */
  turnoverFactors: Record<string, number>;
  /** Round prices to this many rupees. */
  roundTo: number;
}

export interface QuotesFeedContent {
  /** Where a quote's price button leads (checkout, first step). */
  checkoutHref: string;
  /** Where an offline quote's Get Quote leads (the quote request page). */
  quoteInquiryHref: string;
  /** Feed title under the breadcrumb (658:45856); `{count}` is the number of quotes. */
  availableLabel: string;
  /** D&O product mark before the title (32px). */
  titleIconSrc: string;
  breadcrumb: BreadcrumbItem[];
  needHelp: NeedHelpContent;
  /** Labels over the two dropdowns (658:50289 / 50311). */
  filterFieldLabel: string;
  sortFieldLabel: string;
  /** Dropdown trigger copy; `{option}` is the chosen option's label. */
  filterLabel: string;
  /** The "every insurer" option; the insurers themselves come from the quotes. */
  filterAllLabel: string;
  /** Trigger value for two or more picks: `{count}`. */
  filterCountLabel: string;
  filterResetLabel: string;
  filterApplyLabel: string;
  /** Mobile: the "Sort & Filter" button, its sheet's title and ×. */
  sortFilterLabel: string;
  sortFilterTitle: string;
  sortFilterCloseLabel: string;
  sortLabel: string;
  sortOptions: { id: QuoteSort; label: string }[];
  switchLabel: string;
  /** Shown when the filters leave no quotes. */
  noResults: { title: string; body: string; resetLabel: string };
  quotes: QuoteCardData[];
  /** Per-case quote list override (e.g. fuzzy B). Falls back to `quotes`. */
  quotesByCase?: Partial<Record<QuoteCaseId, QuoteCardData[]>>;
  viewFeaturesLabel: string;
  featuresDrawer: FeaturesDrawerContent;
  compareLabel: string;
  comparisonUnavailableLabel: string;
  /** The compare bar (Figma BK Website 689:3123): up to `max` quotes, at
   *  least `min` to compare. `{insurer}` fills the remove button's label. */
  compareSheet: {
    title: string;
    ctaLabel: string;
    removeLabel: string;
    min: number;
    max: number;
    minTip: string;
    /** Phones: the Gold Quote's slot name (a third of the row can't hold the full title). */
    goldShortName: string;
  };
  compareView: CompareViewContent;
  getQuoteLabel: string;
  sumInsuredLabel: string;
  immediatePurchaseLabel: string;
  /** Card territory tags ("Worldwide Coverage", "India Only Coverage"). */
  territoryLabels: Record<QuoteTerritory, string>;
  /** Quote card tag tooltips: what each tag means. */
  cardTips: { immediate: string; gold: string; compareOff: string; compareFull: string; offer: string; territory: Record<QuoteTerritory, string> };
  revealQuoteLabel: string;
  /** Under the locked Reveal button, before verification completes. */
  revealLockedHint: string;
  /** Under the Reveal button once it unlocks. */
  revealReadyHint: string;
  /** The Gold Quote a fuzzy match (Case B) reveals once verified. */
  /** Prices scale with Sum Insured and turnover (see QuotePricing). */
  pricing: QuotePricing;
  goldQuote: QuoteCardData;
  /** A case's own Gold Quote where it differs (A's offer); else `goldQuote`. */
  goldQuoteByCase?: Partial<Record<QuoteCaseId, QuoteCardData>>;
  /** Cases whose Gold Quote is gated (B, fuzzy): its Get Quote opens a
   *  modal (schedule a call, or proceed online), then Additional Details. */
  goldGateByCase?: Partial<Record<QuoteCaseId, GoldGateContent>>;
  /** An offline quote's Get Quote: the same underwriting questions, blank,
   *  before the request goes to the insurer. */
  quoteRequestDrawer: GoldGateContent["drawer"];
  topCoveragesLabel: string;
  /** The coverages chip on offline quote cards. */
  viewCoveragesLabel: string;
  /** Card coverages chip; `{count}` is the number of coverages. */
  coverageCountLabel: string;
  /** The Gold Quote's chip ("4 Personalized Coverages"). */
  personalizedCountLabel: string;
  /** Compact grid: the coverage box of an offline quote (no coverages). */
  coveragesUnavailableLabel: string;
  /** Rating chip copy (shown beside "Top Coverages" when a Gold Quote leads). */
  ratingLabels: Record<QuoteRating, string>;
  poweredByLabel: string;
}

/** The gate on an unpriced Gold Quote (Case B): a centred modal, then the
 *  Additional Details drawer. Proceeding prices the Gold Quote for checkout. */
export interface GoldGateContent {
  modal: {
    /** Labels the popup for screen readers (the design shows no title). */
    title: string;
    body: string;
    visualSrc: string;
    visualAlt: string;
    callLabel: string;
    onlineLabel: string;
    closeLabel: string;
  };
  drawer: {
    title: string;
    intro: string;
    /** The intro when the insurer has already priced the cover. */
    pricedIntro?: string;
    ctaLabel: string;
    closeLabel: string;
    /** Prefilled ones carry a `value`; the rest are the customer's to fill. */
    fields: CheckoutField[];
    upload: CheckoutUpload;
    uploadCopy: CheckoutUploadCopy;
    /** Ask the questions as a BimaNetra chat instead of the fields (Request
     *  a Quote); its answers replace the fields and the upload. */
    chat?: RequestChatContent;
  };
  /** Where "Schedule A Call" and "Unlock Quote" go: the Gold Inquiry page
   *  (an expert calls to finish the quote). */
  inquiryHref: string;
}

/** Fixture for the Quotes results page (Figma node 309:33542). */
/** Ask BimaNetra (the Quotes page chat): its chrome, starter questions and
 *  reply templates. `{…}` slots are filled from the page (quotes, details). */
export interface QuotesChatContent {
  /** The header CTA while the chat is open. */
  closeLabel: string;
  title: string;
  subtitle: string;
  placeholder: string;
  sendLabel: string;
  thinkingLabel: string;
  /** `{company}`, `{count}`. */
  greeting: string;
  suggestions: string[];
  replies: {
    count: string;
    cheapest: string;
    cheapestTied: string;
    price: string;
    priceOffline: string;
    priciest: string;
    immediate: string;
    offline: string;
    worldwide: string;
    india: string;
    coverages: string;
    exclusions: string;
    compare: string;
    goldLocked: string;
    goldRevealed: string;
    sumInsured: string;
    details: string;
    noRecommend: string;
    whatIsDo: string;
    claimsBasis: string;
    help: string;
    thanks: string;
    greet: string;
    fallback: string;
    /** Joins list items: ", " and " and ". */
    and: string;
  };
}

export interface QuotesPageContent {
  header: QuotesHeaderContent;
  detailsPanel: DetailsPanelContent;
  feed: QuotesFeedContent;
  chat: QuotesChatContent;
}

/** What the landing page needs to draw the Quotes page skeleton behind the
 *  quote modal ("results working in the background"). */
export interface QuotesPreview {
  header: QuotesHeaderContent;
  /** Your Details rows to mirror. */
  rowCount: number;
  /** Cards per case (incl. Case B's ghost card). */
  cardCounts: Record<QuoteCaseId, number>;
}

/** Request a Quote's chat: each question in turn, typed (a date) or tapped. */
export interface RequestChatContent {
  steps: { key: string; question: string; answer: "date" | "choice"; options?: string[]; placeholder?: string }[];
  /** After the last answer. */
  done: string;
  /** A date that isn't a real past DD/MM/YYYY. */
  invalidDate: string;
  thinkingLabel: string;
  sendLabel: string;
  iconSrc: string;
}
