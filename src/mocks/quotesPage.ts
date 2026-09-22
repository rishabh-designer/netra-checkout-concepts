import type { QuotesPageContent, QuoteCardData } from "@/types/quotesPage";

const ICICI = "/Insurance.Comp/ICICI.webp";
const NATIONAL = "/Insurance.Comp/National.webp";
const GENERALI = "/Insurance.Comp/Generali.webp";

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
  { insurer: "Future Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Crore", immediate: true, matchPercent: 32, comparable: true },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", matchPercent: 12, comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", matchPercent: 43, comparable: false },
];

/** Fixture for the Quotes results page (Figma node 309:33542). The detailsPanel
 *  rows carry flow-field `key`s so live entries override the Case-C defaults. */
export const mockQuotesPageContent: QuotesPageContent = {
  header: {
    logoSrc: "/figma/logotype.svg",
    logoAlt: "BimaKavach",
    ctaLabel: "Chat with Us",
  },
  detailsPanel: {
    title: "Your Details",
    editLabel: "Edit Details",
    rows: [
      { label: "Enter Company Type", value: "Private Limited Company", key: "type" },
      { label: "Type of Business", value: "IT & Digital Businesses", key: "business" },
      { label: "Company's Annual Turnover", value: "₹ 0Cr – 5 Cr", key: "turnover" },
      { label: "Company CIN", value: "—", key: "cin" },
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
    iconSrc: "",
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
    viewFeaturesLabel: "View All Features",
    compareLabel: "Add to Compare",
    comparisonUnavailableLabel: "Comparison Unavailable",
    getQuoteLabel: "Get Quote",
    sumInsuredLabel: "Sum Insured",
    immediatePurchaseLabel: "Immediate Purchase",
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
