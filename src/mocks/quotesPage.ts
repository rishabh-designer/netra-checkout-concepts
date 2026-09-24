import type { QuotesPageContent, QuoteCardData } from "@/types/quotesPage";

const ICICI = "/Insurance.Comp/ICICI.webp";
const NATIONAL = "/Insurance.Comp/National.webp";
const GENERALI = "/Insurance.Comp/Generali.webp";
const HDFC = "/Insurance.Comp/HDFC.webp";
const ROYAL = "/Insurance.Comp/Royal.webp";
const BAJAJ = "/Insurance.Comp/Bajaj.webp";
const SBI = "/Insurance.Comp/SBI.webp";

/* Nine mock quotes mirroring the Figma grid states: immediate-purchase carry a
   price pill + are comparable; some show an "X% Match" bar; non-comparable ones
   read "Comparison Unavailable". Order follows the Figma (immediate lead). */
const QUOTES: QuoteCardData[] = [
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", immediate: true, price: "₹10,000", comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "Generali Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Crore", immediate: true, matchPercent: 32, comparable: true },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", matchPercent: 12, comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", matchPercent: 43, comparable: false },
];

/* Fuzzy case (B): HDFC/Generali lead as immediate purchases; Royal is priced but
   not immediate (same purple price pill); Bajaj/SBI/ICICI are unpriced "Get Quote".
   The feed interleaves the divider + secondary stack after the first 5 (see
   secondaryAfterByCase), so ICICI lands below the risk-report banner. */
const FUZZY_QUOTES: QuoteCardData[] = [
  { insurer: "HDFC ERGO General Insurance", logoSrc: HDFC, sumInsured: "₹5 Crore", immediate: true, price: "₹7,000", comparable: true },
  { insurer: "Generali Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Crore", immediate: true, price: "₹8,000", comparable: true },
  { insurer: "Royal Sundaram General Insurance", logoSrc: ROYAL, sumInsured: "₹5 Crore", price: "₹12,000", comparable: true },
  { insurer: "Bajaj General Insurance", logoSrc: BAJAJ, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "SBI General Insurance", logoSrc: SBI, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", comparable: false },
];

/** Fixture for the Quotes results page (Figma node 309:33542). The detailsPanel
 *  rows carry flow-field `key`s so live entries override the Case-C defaults. */
export const mockQuotesPageContent: QuotesPageContent = {
  header: {
    logoSrc: "/figma/logotype.svg",
    logoAlt: "BimaKavach",
    ctaLabel: "Chat with Us",
    ctaIconSrc: "/media/chat-with-us.svg",
  },
  detailsPanel: {
    title: "Your Details",
    editLabel: "Edit Details",
    rows: [
      { label: "Enter Company Type", value: "Private Limited Company", key: "type" },
      { label: "Type of Business", value: "IT & Digital Businesses", key: "business" },
      { label: "Company's Annual Turnover", value: "₹ 0Cr – 5 Cr", key: "turnover" },
      { label: "Company PAN", value: "—", key: "cin" },
      { label: "Existing Directors and Officers Policy", value: "No", key: "existingPolicy" },
      { label: "Claims or Incidents in the Last 5 Years", value: "No", key: "claims5y" },
    ],
    upgrade: {
      title: "Ready to Upgrade?",
      body: "We're verifying your business now and are preparing a special quote for you. We'll inform you when it's ready.",
      percent: 29,
      timeLeft: "3:20 Hrs. Left",
      ctaLabel: "Notify Me",
    },
  },
  feed: {
    breadcrumb: [
      { label: "HOME", href: "/directors-and-officers-insurance" },
      { label: "DIRECTOR’S & OFFICER’S INSURANCE", href: "/directors-and-officers-insurance" },
      { label: "LIVE QUOTES" },
    ],
    title: "Director’s & Officer’s Insurance Quotes",
    iconSrc: "/media/do-icon.webp",
    needHelp: {
      title: "Need Help?",
      subtitle: "Contact our IRDAI-certified Bima experts",
      phone: "+91-90072-96854",
      avatarCount: 4,
    },
    filterLabel: "Filtering: All Insurance Brokers",
    filterOptions: ["All Insurance Brokers", "PSU Insurers", "Private Insurers"],
    sortLabel: "Sort Quotes By Match",
    sortOptions: ["Match", "Premium: Low to High", "Sum Insured: High to Low"],
    switchLabel: "Immediate Purchase Only",
    quotes: QUOTES,
    quotesByCase: { B: FUZZY_QUOTES },
    viewFeaturesLabel: "View All Features",
    compareLabel: "Add To Compare",
    comparisonUnavailableLabel: "Unavailable",
    getQuoteLabel: "Get Quote",
    sumInsuredLabel: "Sum Insured",
    immediatePurchaseLabel: "Immediate Purchase",
    revealQuoteLabel: "Reveal Quote",
    riskReport: {
      question: "Are you Interested in a customized Risk Report?",
      emphasis: "customized Risk Report?",
      ctaLabel: "Send Risk Report",
      visualSrc: "/Form/risk.report.svg",
      visualAlt: "BimaNetra Security Risk Report preview",
      sentText: "Your Risk Report has been sent to your Inbox!",
      sentEmphasis: "sent to your Inbox",
    },
    testimonial: {
      quote:
        "BimaKavach made getting our D&O cover genuinely painless — real quotes in minutes, no jargon, and a team that actually picks up the phone.",
      name: "Nikhil Kamath",
      role: "CEO • Zerodha",
    },
  },
};
