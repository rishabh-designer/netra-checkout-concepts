import type { BreadcrumbItem } from "./productPage";
import type { QuoteCaseId } from "@/lib/quote-flow";

/** Minimal page header: logotype + a single right-side CTA ("Chat with Us"). */
export interface QuotesHeaderContent {
  logoSrc: string;
  logoAlt: string;
  ctaLabel: string;
  ctaIconSrc: string;
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
}

/** "You're Upgraded!" — the exact-match (Case A) banner once the Gold Quote
 *  is revealed (Figma 564:32956): title + one line, no meter or action. */
export interface UpgradedBannerContent {
  title: string;
  body: string;
}

export interface DetailsPanelContent {
  title: string;
  editLabel: string;
  rows: QuoteDetailRow[];
  upgrade: UpgradeBannerContent;
  upgraded: UpgradedBannerContent;
}

/** "Need Help?" banner in the feed header — IRDAI experts + phone. */
export interface NeedHelpContent {
  title: string;
  subtitle: string;
  phone: string;
  /** Stacked expert photos, pre-composited into one image (Figma 564:35811). */
  avatarsSrc: string;
  avatarsAlt: string;
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
  /** 0–100; renders a "X% Match" progress bar when set. */
  matchPercent?: number;
  /** true → "Add to Compare" checkbox; false/undefined → "Comparison Unavailable". */
  comparable?: boolean;
  /** true → a locked "ghost" card whose only action is "Reveal Quote" (fuzzy match). */
  ghost?: boolean;
  /** "Top Coverages" chips; omitted on unpriced Get Quote cards. */
  coverages?: string[];
  /** The revealed exact-match "Gold Quote" (Figma 553:29978): caution-gold card,
   *  "Powered by BimaNetra" pill, orange Get Quote. */
  gold?: boolean;
  /** How this quote compares against the Gold Quote — set by the feed only
   *  when a Gold Quote is present (exact match). */
  rating?: QuoteRating;
}

export type QuoteRating = "excellent" | "good" | "average" | "na";

/** The risk-report banner (item 9 left). Copy flips on the carried Yes/No answer. */
export interface RiskReportBannerContent {
  /** "No" state — the offer. `emphasis` is the purple-italic tail of `question`. */
  question: string;
  emphasis: string;
  ctaLabel: string;
  visualSrc: string;
  visualAlt: string;
  /** "Yes"/sent state. `sentEmphasis` is the purple-italic span within `sentText`. */
  sentText: string;
  sentEmphasis: string;
}

export interface TestimonialContent {
  quote: string;
  name: string;
  role: string;
}

export interface QuotesFeedContent {
  breadcrumb: BreadcrumbItem[];
  needHelp: NeedHelpContent;
  filterLabel: string;
  filterOptions: string[];
  sortLabel: string;
  sortOptions: string[];
  switchLabel: string;
  quotes: QuoteCardData[];
  /** Per-case quote list override (e.g. fuzzy B). Falls back to `quotes`. */
  quotesByCase?: Partial<Record<QuoteCaseId, QuoteCardData[]>>;
  viewFeaturesLabel: string;
  compareLabel: string;
  comparisonUnavailableLabel: string;
  getQuoteLabel: string;
  sumInsuredLabel: string;
  immediatePurchaseLabel: string;
  revealQuoteLabel: string;
  topCoveragesLabel: string;
  /** Rating chip copy (shown beside "Top Coverages" when a Gold Quote leads). */
  ratingLabels: Record<QuoteRating, string>;
  poweredByLabel: string;
  riskReport: RiskReportBannerContent;
  testimonial: TestimonialContent;
}

/** Fixture for the Quotes results page (Figma node 309:33542). */
export interface QuotesPageContent {
  header: QuotesHeaderContent;
  detailsPanel: DetailsPanelContent;
  feed: QuotesFeedContent;
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
