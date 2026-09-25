import type { FeaturesDrawerContent, QuotesPageContent, QuoteCardData } from "@/types/quotesPage";

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

/** "View All Features" drawer copy (Figma 587:63725): standard Indian D&O
 *  cover in plain language, shared by every quote in this mock. */
const FEATURES_DRAWER: FeaturesDrawerContent = {
  title: "View All Features",
  closeLabel: "Close features",
  defaultTab: "coverages",
  tabs: [
    {
      key: "overview",
      label: "Overview",
      tone: "info",
      items: [
        { title: "Who's Covered", body: "Every director, officer and key manager of your company and its subsidiaries, past, present and future. Their spouses and legal heirs are covered too if a claim is made against them." },
        { title: "How Claims Work", body: "This is a claims-made policy. It pays out for claims first made against you while the policy is active, as long as you report them in that same period." },
        { title: "Sum Insured", body: "Your Sum Insured is the most the policy will pay across all claims in a year, and that includes your legal costs." },
        { title: "Past Acts", body: "You're covered for decisions made after the retroactive date. If this is your first D&O policy, all past acts are covered, and that date carries forward every time you renew." },
        { title: "Extra Time to Report", body: "If you don't renew, you still get 12 months to report claims for anything that happened while you were covered." },
      ],
    },
    {
      key: "territory",
      label: "Territory & Jurisdiction",
      tone: "info",
      items: [
        { title: "Where You're Covered", body: "Anywhere in the world. A decision taken in Mumbai, Dubai or London is treated the same, as long as local laws and sanctions allow it." },
        { title: "Where Claims Can Be Filed", body: "In a court in any country except the USA and Canada. Those two need an add-on." },
        { title: "USA & Canada Add-On", body: "Worth adding if you're listed, have a subsidiary or export heavily to North America. It costs a little extra." },
        { title: "Governing Law", body: "The policy follows Indian law. If you ever disagree with the insurer, it's settled through arbitration in India." },
      ],
    },
    {
      key: "exclusions",
      label: "Exclusions",
      tone: "excluded",
      items: [
        { title: "Fraud & Dishonesty", body: "Deliberate fraud, criminal acts or knowingly breaking the law. Your legal costs are still paid until a court rules against you." },
        { title: "Personal Profit", body: "Any money or advantage you weren't legally entitled to." },
        { title: "Earlier Claims", body: "Lawsuits or problems you already knew about, or that were already underway, before your cover started." },
        { title: "Injury & Property Damage", body: "Physical injury, illness or death, and damage to property. Shareholder or regulator claims that follow from these are still covered." },
        { title: "Pollution", body: "Claims caused by pollution. Legal costs and shareholder claims linked to it are still covered." },
        { title: "Claims From Within", body: "Claims one insured person or the company brings against another. Whistle-blower, shareholder and liquidator claims are still covered." },
      ],
    },
    {
      key: "coverages",
      label: "Coverages/Extensions",
      tone: "covered",
      items: [
        { title: "Defence Costs", body: "Your lawyers' fees when a claim is made against a director or officer, paid as the bills come in rather than at the end." },
        { title: "Entity Employment Practices", body: "Protects the company itself when an employee sues for wrongful dismissal, discrimination or harassment." },
        { title: "Regulatory Investigations", body: "Pays for legal help if SEBI, the RBI, the ED or the SFIO questions or investigates one of your directors." },
        { title: "Asset Protection Costs", body: "Pays the legal costs to fight back if a director's personal assets are frozen or seized." },
        { title: "Crisis Management", body: "Brings in PR and crisis experts to protect your reputation when something goes wrong." },
        { title: "Extradition Proceedings", body: "Legal costs to fight an extradition request, including any appeals." },
        { title: "Emergency Costs", body: "Legal costs you had to spend urgently, before the insurer could approve them in writing." },
      ],
    },
    {
      key: "deductibles",
      label: "Deductibles",
      tone: "info",
      items: [
        { title: "Directors & Officers (Side A)", body: "Nil. Directors and officers pay nothing when the company can't cover them." },
        { title: "Company Reimbursement (Side B)", body: "₹2,50,000 per claim, paid by the company when it covers its directors." },
        { title: "Entity Employment Practices", body: "₹5,00,000 per claim, paid by the company." },
        { title: "Securities Claims", body: "₹10,00,000 per claim. This only applies to listed companies." },
      ],
    },
  ],
};

/** Fixture for the Quotes results page (Figma node 309:33542). The detailsPanel
 *  rows carry flow-field `key`s so live entries override the Case-C defaults. */
export const mockQuotesPageContent: QuotesPageContent = {
  header: {
    logoSrc: "/figma/logotype.svg",
    logoAlt: "BimaKavach",
    ctaLabel: "Mail Quotes",
  },
  detailsPanel: {
    title: "Your Details",
    editLabel: "Edit Details",
    rows: [
      { label: "Enter Company Type", value: "Private Limited Company", key: "type" },
      { label: "Type of Business", value: "IT & Digital Businesses", key: "business" },
      { label: "Company's Annual Turnover", value: "₹50 Cr to ₹250 Cr", key: "turnover" },
      { label: "Company PAN", value: "-", key: "cin" },
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
    availableLabel: "{count} Quotes Available",
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
      chatLabel: "Chat with Us",
      chatIconSrc: "/media/chat-sparkle.svg",
    },
    filterLabel: "Filtering: All",
    filterOptions: ["All Insurance Brokers", "PSU Insurers", "Private Insurers"],
    sortLabel: "Sorting: Default",
    sortOptions: ["Match", "Premium: Low to High", "Sum Insured: High to Low"],
    switchLabel: "Immediate Purchase Only",
    quotes: QUOTES,
    quotesByCase: { A: [GOLD_QUOTE, ...MATCHED_QUOTES], B: MATCHED_QUOTES },
    viewFeaturesLabel: "View All Features",
    featuresDrawer: FEATURES_DRAWER,
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
      visualSrc: "/media/risk-report-stack.webp",
      visualAlt: "BimaNetra Security Risk Report preview",
      sentText: "Your Risk Report has been sent to your Inbox!",
      sentEmphasis: "sent to your Inbox",
    },
    testimonial: {
      quote:
        "BimaKavach made getting our D&O cover genuinely painless. Real quotes in minutes, no jargon, and a team that actually picks up the phone.",
      name: "Nikhil Kamath",
      role: "CEO",
      company: "Zerodha",
      photoSrc: "/media/testimonial/photo.webp",
      logoSrc: "/media/testimonial/logo.webp",
    },
  },
};
