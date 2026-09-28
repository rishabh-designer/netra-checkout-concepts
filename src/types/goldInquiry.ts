import type { BreadcrumbItem } from "./productPage";

/** One contact button in the Need Help card. */
export interface GoldInquiryContact {
  label: string;
  href: string;
  iconSrc: string;
  /** The filled purple one (Schedule a Call). */
  primary?: boolean;
}

/** The page after "Unlock Price" (Figma 642:30248): the Gold Quote is held
 *  for the customer while an expert calls to finish it. */
export interface GoldInquiryContent {
  headerCtaLabel: string;
  /** Tapping the header's "Speak to an Expert". */
  expertHref: string;
  backLabel: string;
  breadcrumb: BreadcrumbItem[];
  title: string;
  intro: string;
  /** "What happens next", each with a green tick. */
  steps: string[];
  tickSrc: string;
  /** "Have questions? Reach out to us on {email}". */
  questions: { text: string; email: string };
  inquiry: {
    title: string;
    ctaLabel: string;
    policyLabel: string;
    policyValue: string;
    sumInsuredLabel: string;
    riskReportLabel: string;
    riskReportValue: string;
    /** Case B's Additional Details: missing (a call was scheduled instead of
     *  the form) or verifying (the form was sent with Unlock Quote). */
    detailsLabel: string;
    detailsMissing: string;
    detailsVerifying: string;
  };
  /** `showing` fills {total} (the other quotes on offer). */
  otherQuotes: { title: string; showing: string; prevLabel: string; nextLabel: string };
  needHelp: {
    title: string;
    subtitle: string;
    avatarsSrc: string;
    avatarsAlt: string;
    contacts: GoldInquiryContact[];
  };
  /** The variant for an offline quote's Get Quote: a quote request to that
   *  insurer (`{insurer}` is its name). Replaces the Gold-only copy and stats. */
  quoteRequest: {
    breadcrumbCurrent: string;
    title: string;
    steps: string[];
    /** A priced insurer that isn't on sale online yet: its price is in,
     *  its checks aren't. `{insurer}`, `{price}`. */
    pricedSteps: string[];
    priceLabel: string;
    inquiryTitle: string;
    insurerLabel: string;
    statusLabel: string;
    statusValue: string;
  };
  rate: {
    title: string;
    subtitle: string;
    badgeSrc: string;
    options: string[];
    submitLabel: string;
    /** Tooltip on Submit before a rating is picked. */
    submitBlockedTip: string;
    thanks: string;
  };
}
