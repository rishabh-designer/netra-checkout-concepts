import type { QuotesPageContent, QuoteCardData } from "@/types/quotesPage";

const ICICI = "/Insurance.Comp/ICICI.webp";
const NATIONAL = "/Insurance.Comp/National.webp";
const GENERALI = "/Insurance.Comp/Generali.webp";
const HDFC = "/Insurance.Comp/HDFC.webp";
const ROYAL = "/Insurance.Comp/Royal.webp";
const BAJAJ = "/Insurance.Comp/Bajaj.webp";
const SBI = "/Insurance.Comp/SBI.webp";

/* Standard D&O heads of cover, mixed per insurer for the "Top Coverages" chips. */
const DEFENCE = "Defence Costs";
const EPL = "Entity Employment Practices";
const REGULATORY = "Regulatory Investigations";
const ASSETS = "Personal Asset Protection";
const EMERGENCY = "Emergency Costs";
const CRISIS = "Crisis Management";
const EXTRADITION = "Extradition Costs";

/* Default list (Cases A/C): immediate-purchase quotes carry a price and are
   comparable; unpriced "Get Quote" ones have no coverage chips and read
   "Unavailable" for compare. */
const QUOTES: QuoteCardData[] = [
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", immediate: true, price: "₹10,000", comparable: true, coverages: [DEFENCE, EPL, REGULATORY] },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", comparable: false },
  { insurer: "Generali Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Crore", immediate: true, matchPercent: 32, comparable: true, coverages: [DEFENCE, ASSETS, CRISIS] },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Crore", matchPercent: 12, comparable: true },
  { insurer: "National Insurance Company", logoSrc: NATIONAL, sumInsured: "₹5 Crore", matchPercent: 43, comparable: false },
];

/* Exact match (A): the Gold Quote is revealed on arrival and leads the stack. */
const GOLD_QUOTE: QuoteCardData = {
  insurer: "Your Personalized Insurance Quote",
  logoSrc: "",
  sumInsured: "₹5 Crore",
  gold: true,
  comparable: true,
  coverages: [DEFENCE, EPL, REGULATORY, ASSETS],
};

/* Cases A and B share this sequence (Figma 571 stack): two immediate
   purchases, one priced quote, then the unpriced "Get Quote" insurers. A leads
   it with the Gold Quote; B with the ghost "Reveal Quote" card. */
const MATCHED_QUOTES: QuoteCardData[] = [
  { insurer: "Generali Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Crore", immediate: true, price: "₹10,000", comparable: true, coverages: [DEFENCE, REGULATORY, ASSETS, EXTRADITION] },
  { insurer: "HDFC ERGO General Insurance", logoSrc: HDFC, sumInsured: "₹5 Crore", immediate: true, price: "₹10,000", comparable: true, coverages: [DEFENCE, EPL, EMERGENCY] },
  { insurer: "Royal Sundaram General Insurance", logoSrc: ROYAL, sumInsured: "₹5 Crore", price: "₹12,000", comparable: true, coverages: [DEFENCE, EPL, CRISIS] },
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
      { label: "Company's Annual Turnover", value: "₹50 Cr to ₹250 Cr", key: "turnover" },
      { label: "Company PAN", value: "—", key: "cin" },
      { label: "Existing Directors and Officers Policy", value: "No", key: "existingPolicy" },
      { label: "Claims or Incidents in the Last 5 Years", value: "No", key: "claims5y" },
      { label: "Sum Insured", value: "₹5 Crore", key: "coverage" },
    ],
    upgrade: {
      title: "Ready to Upgrade?",
      body: "We're verifying your business now and are preparing a special quote for you. We'll inform you when it's ready.",
      percent: 29,
      timeLeft: "3:20 Hrs. Left",
      ctaLabel: "Notify Me",
    },
    upgraded: {
      title: "You’re Upgraded!",
      body: "We’ve verified your Business and have created a Gold Quote just for you!",
    },
  },
  feed: {
    breadcrumb: [
      { label: "HOME", href: "/directors-and-officers-insurance" },
      { label: "DIRECTOR’S & OFFICER’S INSURANCE", href: "/directors-and-officers-insurance" },
      { label: "LIVE QUOTES" },
    ],
    needHelp: {
      title: "Need Help?",
      subtitle: "Contact our IRDAI-certified Bima experts",
      phone: "+91-90072-96854",
      avatarsSrc: "/media/experts/avatars.webp",
      avatarsAlt: "BimaKavach insurance experts",
    },
    filterLabel: "Filtering: All",
    filterOptions: ["All Insurance Brokers", "PSU Insurers", "Private Insurers"],
    sortLabel: "Sorting: Default",
    sortOptions: ["Match", "Premium: Low to High", "Sum Insured: High to Low"],
    switchLabel: "Immediate Purchase Only",
    quotes: QUOTES,
    quotesByCase: { A: [GOLD_QUOTE, ...MATCHED_QUOTES], B: MATCHED_QUOTES },
    viewFeaturesLabel: "View All Features",
    compareLabel: "Add To Compare",
    comparisonUnavailableLabel: "Unavailable",
    getQuoteLabel: "Get Quote",
    sumInsuredLabel: "Sum Insured",
    immediatePurchaseLabel: "Immediate Purchase",
    revealQuoteLabel: "Reveal Quote",
    topCoveragesLabel: "Top Coverages",
    ratingLabels: { excellent: "Excellent", good: "Good", average: "Average", na: "N/A" },
    poweredByLabel: "Powered by BimaNetra",
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
