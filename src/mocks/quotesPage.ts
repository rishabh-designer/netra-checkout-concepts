import type { CompareViewContent, FeaturesDrawerContent, GoldGateContent, QuotesPageContent, QuoteCardData, RequestChatContent } from "@/types/quotesPage";
import { TAG_TIPS } from "./tagTips";
import { mockCheckoutContent } from "./checkout";
import { GOLD_A_POLICY, GOLD_B_POLICY, INSURER_POLICIES } from "./policies";

const ICICI = "/Insurance.Comp/ICICI.webp";
const GENERALI = "/Insurance.Comp/Generali.webp";
const HDFC = "/Insurance.Comp/HDFC.webp";
const ROYAL = "/Insurance.Comp/Royal.webp";
const BAJAJ = "/Insurance.Comp/Bajaj.webp";
const SBI = "/Insurance.Comp/SBI.webp";

/* The Gold Quote (A and B): unveiled from the Reveal slot that leads the stack. */
const GOLD_QUOTE: QuoteCardData = {
  insurer: "Your Personalised Insurance Quote",
  logoSrc: GENERALI,
  sumInsured: "₹5 Cr",
  gold: true,
  comparable: true,
  territory: "worldwide",
};

/* Case A's Gold Quote carries an offer: ₹10,000 struck down to ₹8,500. Its
   insurer and price are known, so it's named for Generali and on sale now
   (Immediate Purchase). */
const CASE_A_GOLD: QuoteCardData = { ...GOLD_QUOTE, insurer: "Generali Central Insurance", immediate: true, price: "₹8,500", originalPrice: "₹10,000", coverages: GOLD_A_POLICY.top, policy: GOLD_A_POLICY };
/* Case B's records are fuzzy, so its Gold Quote can't be mapped to an insurer
   or a price yet: no logo, and the button reads Get Quote. */
const CASE_B_GOLD: QuoteCardData = { ...GOLD_QUOTE, logoSrc: "", coverages: GOLD_B_POLICY.top, policy: GOLD_B_POLICY };

/* The questions BimaNetra asks in chat (the Gold Quote's Additional
   Details and every Request a Quote), one at a time. */
const REQUEST_CHAT: RequestChatContent = {
  steps: [
    { key: "incorporatedOn", question: "When was your company incorporated?", answer: "date", placeholder: "DD/MM/YYYY" },
    { key: "listingStatus", question: "What's your company's listing status?", answer: "choice", options: ["Unlisted", "Listed on NSE / BSE", "Listed Overseas"] },
    { key: "pendingClaims", question: "Are there any pending claims against your directors?", answer: "choice", options: ["Yes", "No"] },
  ],
  done: "Thanks, that's everything. Tap Request Quote and we'll send it to the insurer.",
  invalidDate: "That doesn't look like a date. Could you type it as DD/MM/YYYY?",
  thinkingLabel: "Thinking",
  sendLabel: "Send",
  iconSrc: "/media/chat-sparkle.svg",
};

/* Case B's gate: the Additional Details go to an expert, who calls to price
   and finish the Gold Quote (the Gold Inquiry page). */
const CASE_B_GOLD_GATE: GoldGateContent = {
  modal: {
    title: "Almost There",
    body: "Your Gold Quote opens up for Immediate Purchase once your customised Risk Report is ready. Until then, schedule a quick call and our experts will put it together with you, or share a few more details online.",
    visualSrc: "/media/gold-inquiry/risk-report.png",
    visualAlt: "BimaNetra Risk Report preview",
    callLabel: "Schedule a Call",
    onlineLabel: "Proceed Online",
    closeLabel: "Close",
  },
  drawer: {
    title: "Additional Details",
    intro: "A few quick questions and your Gold Quote is ready to buy.",
    ctaLabel: "Unlock Quote",
    closeLabel: "Close",
    fields: [
      { key: "directorsCount", label: "Number of Directors & Officers", mandatory: true, control: "text", value: "6", status: "verified", inputMode: "numeric", maxLength: 3 },
      { key: "incorporatedOn", label: "Date of Incorporation", mandatory: true, control: "text", value: "12/02/2021", status: "verified", placeholder: "DD/MM/YYYY", inputMode: "numeric", maxLength: 10 },
      { key: "listingStatus", label: "Listing Status", mandatory: true, control: "select", value: "Unlisted", status: "verified", options: ["Unlisted", "Listed on NSE / BSE", "Listed Overseas"] },
      { key: "operations", label: "Countries of Operation", mandatory: true, control: "select", value: "India Only", status: "fuzzy", options: ["India Only", "India + 1 to 3 Countries", "India + 4 or More Countries"] },
      { key: "netWorth", label: "Net Worth (Last Financial Year)", mandatory: true, control: "text", status: "empty", prefix: "₹", placeholder: "Amount in Rupees", inputMode: "numeric", maxLength: 21, amountWords: { template: "Rupees {amount}", crore: "Crore", lakh: "Lakh", thousand: "Thousand" } },
      { key: "litigation", label: "Any pending claims against directors?", mandatory: true, control: "select", status: "empty", placeholder: "Select", options: ["No", "Yes"] },
    ],
    upload: {
      key: "auditedFinancials",
      label: "Latest Audited Financial Statement",
      reviewLabel: "Audited Financials",
      title: "Upload Financial Statement",
    },
    uploadCopy: mockCheckoutContent.upload,
    chat: { ...REQUEST_CHAT, done: "Thanks, that's everything. Tap Unlock Quote to see your Gold Quote." },
  },
  inquiryHref: "/directors-and-officers-insurance/quotes/gold-inquiry",
};

/* An offline insurer prices by hand, so its Get Quote asks the same
   underwriting questions as the Gold gate, blank, then sends the request. */
const QUOTE_REQUEST_DRAWER: GoldGateContent["drawer"] = {
  ...CASE_B_GOLD_GATE.drawer,
  title: "Request a Quote",
  intro: "A few details help the insurer price your cover. Answer these and we'll send your request.",
  ctaLabel: "Request Quote",
  pricedIntro: "This insurer has priced your cover, but needs a few more details before it can sell online. Answer these and our expert will finish the rest.",
  fields: CASE_B_GOLD_GATE.drawer.fields.map((f) => ({ ...f, value: undefined, status: "empty" as const })),
  chat: { ...REQUEST_CHAT, done: "Thanks, that's everything. Tap Request Quote and we'll send it to the insurer." },
};


/* Cases A and B share this sequence (Figma 571 stack): two immediate
   purchases, one priced quote, then the unpriced "Get Quote" insurers. Both
   lead it with the ghost "Reveal Quote" card. */
const MATCHED_ROWS: QuoteCardData[] = [
  { insurer: "Generali Central Insurance", logoSrc: GENERALI, sumInsured: "₹5 Cr", immediate: true, price: "₹10,000", comparable: true, territory: "worldwide" },
  { insurer: "HDFC ERGO General Insurance", logoSrc: HDFC, sumInsured: "₹5 Cr", immediate: true, price: "₹10,000", comparable: true, territory: "worldwide" },
  { insurer: "Royal Sundaram General Insurance", logoSrc: ROYAL, sumInsured: "₹5 Cr", price: "₹12,000", comparable: true, territory: "india" },
  { insurer: "Bajaj General Insurance", logoSrc: BAJAJ, sumInsured: "₹5 Cr", comparable: false },
  { insurer: "SBI General Insurance", logoSrc: SBI, sumInsured: "₹5 Cr", comparable: false },
  { insurer: "ICICI Lombard General Insurance", logoSrc: ICICI, sumInsured: "₹5 Cr", comparable: false },
];
/* Each insurer carries its own policy; priced quotes show its top coverages
   on the card (offline ones keep a plain "Top Coverages" chip). */
const MATCHED_QUOTES: QuoteCardData[] = MATCHED_ROWS.map((q) => {
  const policy = INSURER_POLICIES[q.insurer];
  return policy ? { ...q, policy, ...(q.price ? { coverages: policy.top } : {}) } : q;
});

/* Case C (no data, also the fallback for any unmatched name): the same six
   insurers as B, minus the locked card. Its prices follow its own Sum
   Insured and turnover through `pricing`, like every case. */
const QUOTES: QuoteCardData[] = MATCHED_QUOTES;

/* Territory & Jurisdiction, per the card's territory tag. */
const WORLDWIDE_TERRITORY = [
        { title: "Where You're Covered", body: "Anywhere in the world. A decision taken in Mumbai, Dubai or London is treated the same, as long as local laws and sanctions allow it." },
        { title: "Where Claims Can Be Filed", body: "In a court in any country except the USA and Canada. Those two need an add-on." },
        { title: "USA & Canada Add-On", body: "Worth adding if you're listed, have a subsidiary or export heavily to North America. It costs a little extra." },
        { title: "Governing Law", body: "The policy follows Indian law. If you ever disagree with the insurer, it's settled through arbitration in India." },
];

const INDIA_TERRITORY = [
  { title: "Where You're Covered", body: "Within India only. Decisions taken and claims made outside India aren't covered." },
  { title: "Where Claims Can Be Filed", body: "Only in Indian courts, tribunals and regulators." },
  { title: "Overseas Business", body: "Subsidiaries, offices or directors' work abroad aren't covered. You can ask for worldwide cover at renewal." },
  { title: "Governing Law", body: "The policy follows Indian law. If you ever disagree with the insurer, it's settled through arbitration in India." },
];

/** The compare view (Compare Now): the picked quotes side by side, row by
 *  row. Facts only, the same rows for every quote, no ranking. */
const COMPARE_VIEW: CompareViewContent = {
  title: "Compare Quotes",
  subtitle: "{count} quotes, side by side",
  backLabel: "Back to Quotes",
  addLabel: "Add Quote",
  removeLabel: "Remove {insurer} from compare",
  differencesLabel: "Show Differences Only",
  expandLabel: "Show Details",
  collapseLabel: "Hide Details",
  notIncludedLabel: "Not included",
  onRequestLabel: "On request",
  tabs: [
    { key: "covered", label: "What's Covered" },
    { key: "excluded", label: "What's Not Covered" },
  ],
  sections: [
    {
      key: "facts",
      tab: "covered",
      title: "Key Facts",
      tone: "info",
      rows: [
        { key: "premium", title: "Price", body: "The yearly price, GST included.", source: "premium" },
        { key: "sumInsured", title: "Sum Insured", body: "The most the policy pays across all claims in a year, legal costs included.", source: "sumInsured" },
        { key: "territory", title: "Territory", body: "Where decisions and claims are covered.", source: "territory" },
        { key: "top", title: "Top Coverages", body: "The coverages this quote leads with.", source: "top" },
        { key: "purchase", title: "How You Buy", body: "Whether the policy is issued online or after a check." },
        { key: "claimsBasis", title: "Claims Basis", body: "Claims made: pays for claims first made against you while the policy is active." },
        { key: "reporting", title: "Extra Time to Report", body: "How long you can still report a claim if you don't renew." },
        { key: "pastActs", title: "Past Acts", body: "How far back the decisions you're covered for can go." },
      ],
    },
    {
      key: "core",
      tab: "covered",
      title: "Core Protection",
      tone: "covered",
      rows: [
        { key: "defence", title: "Defence Costs", body: "Your lawyers' fees when a claim is made against a director or officer." },
        { key: "epl", title: "Entity Employment Practices", body: "Protects the company when an employee sues for wrongful dismissal, discrimination or harassment." },
        { key: "regulatory", title: "Regulatory Investigations", body: "Legal help if SEBI, the RBI, the ED or the SFIO questions a director." },
        { key: "assets", title: "Personal Asset Protection", body: "Legal costs to fight back if a director's personal assets are frozen or seized." },
        { key: "crisis", title: "Crisis Management", body: "PR and crisis experts to protect your reputation when something goes wrong." },
        { key: "extradition", title: "Extradition Costs", body: "Legal costs to fight an extradition request, including appeals." },
        { key: "emergency", title: "Emergency Costs", body: "Legal costs spent urgently, before the insurer could approve them in writing." },
        { key: "outside", title: "Outside Directorship", body: "Covers directors on another company's or a non-profit's board at your request." },
        { key: "pollution", title: "Pollution Defence Costs", body: "Defence costs if a director is blamed for pollution from the company's operations." },
        { key: "bail", title: "Bail Bond Costs", body: "Pays the bail bond if a director is arrested over a covered claim." },
      ],
    },
    {
      key: "deductibles",
      tab: "covered",
      title: "Deductibles",
      tone: "info",
      rows: [
        { key: "sideA", title: "Directors & Officers (Side A)", body: "What a director pays when the company can't cover them." },
        { key: "sideB", title: "Company Reimbursement (Side B)", body: "What the company pays per claim when it covers its directors." },
        { key: "eplDed", title: "Entity Employment Practices", body: "What the company pays per employee claim." },
        { key: "securities", title: "Securities Claims", body: "Only applies to listed companies." },
      ],
    },
    {
      key: "exclusions",
      tab: "excluded",
      title: "Exclusions",
      tone: "excluded",
      rows: [
        { key: "fraud", title: "Fraud & Dishonesty", body: "Deliberate fraud or knowingly breaking the law." },
        { key: "prior", title: "Earlier Claims", body: "Claims or problems you knew about before the cover started." },
        { key: "injury", title: "Injury & Property Damage", body: "Physical injury, illness or death, and damage to property." },
        { key: "pollutionX", title: "Pollution", body: "Claims caused by pollution, and the cost of cleaning it up." },
        { key: "insuredVs", title: "Claims From Within", body: "Claims one insured person or the company brings against another." },
        { key: "sanctions", title: "Sanctioned Countries", body: "Business in countries under Indian or UN sanctions." },
        { key: "majorHolder", title: "Major Shareholder Claims", body: "Claims brought by a large shareholder of the company." },
        { key: "fines", title: "Fines & Penalties", body: "Fines imposed by a regulator or court." },
      ],
    },
  ],
};

/** "View All Features" drawer copy (Figma 587:63725): standard Indian D&O
 *  cover in plain language, shared by every quote in this mock. */
const FEATURES_DRAWER: FeaturesDrawerContent = {
  title: "Policy Details",
  closeLabel: "Close policy details",
  pagerTip: "Quote {n} of {total}",
  prevQuoteLabel: "Previous Quote",
  nextQuoteLabel: "Next Quote",
  productIconSrc: "/media/checkout/product-icon.png",
  productName: "Directors & Officers\nInsurance",
  territoryItems: { worldwide: WORLDWIDE_TERRITORY, india: INDIA_TERRITORY },
  topFeatureLabel: "Top Feature",
  personalizedLabel: "Personalised",
  topFeatureTip: "One of this policy's headline coverages",
  personalizedTip: "Added by BimaNetra for your business",
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
      items: WORLDWIDE_TERRITORY,
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
        { title: "Personal Asset Protection", body: "Pays the legal costs to fight back if a director's personal assets are frozen or seized." },
        { title: "Crisis Management", body: "Brings in PR and crisis experts to protect your reputation when something goes wrong." },
        { title: "Extradition Costs", body: "Legal costs to fight an extradition request, including any appeals." },
        { title: "Emergency Costs", body: "Legal costs you had to spend urgently, before the insurer could approve them in writing." },
        { title: "Outside Directorship Liability", body: "Covers your directors when they also sit on the board of a non-profit or another company at your request." },
        { title: "Pollution Defence Costs", body: "Defence costs if a director is blamed for pollution caused by the company's operations." },
        { title: "Bail Bond Costs", body: "Pays for the bail bond if a director is arrested over a covered claim." },
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
    ctaLabel: "Ask BimaNetra",
    compareCtaLabel: "Mail Quotes",
  },
  chat: {
    closeLabel: "Close Chat",
    title: "Ask BimaNetra",
    subtitle: "Ask anything about these quotes",
    placeholder: "Ask about prices, coverages, insurers…",
    sendLabel: "Send",
    thinkingLabel: "BimaNetra is reading your quotes",
    greeting:
      "Hi! I've read all {count} quotes for {company}. Ask me about prices, what each policy covers, or how two insurers differ.",
    suggestions: [
      "Which quote has the lowest price?",
      "Which quotes can I buy right now?",
      "Compare Generali and HDFC ERGO",
      "What does HDFC ERGO not cover?",
    ],
    replies: {
      count: "You have {count} quotes: {list}.",
      cheapest: "The lowest price is {price} from {insurer}, for {sum} of cover.",
      cheapestTied: "{insurer} share the lowest price, {price} each, for {sum} of cover.",
      price: "{insurer} is {price} a year for {sum} of cover.",
      priceOffline: "{insurer} quotes offline. Select Request Quote on its card and our team will fetch the price.",
      priciest: "The highest price is {price} from {insurer}.",
      immediate: "You can buy {list} online right now. The others need a quick check by the insurer first.",
      offline: "{list} quote offline, so select Request Quote and our team will fetch their price.",
      worldwide: "{list} cover claims brought anywhere in the world.",
      india: "{list} cover claims brought in India only.",
      coverages: "{insurer}'s top coverages are {list}. Open its coverages to see everything it covers.",
      exclusions: "{insurer} doesn't cover {list}.",
      compare: "{a} is {priceA} and {b} is {priceB}. {a} leads with {topA}; {b} leads with {topB}. Tick Add To Compare on both to see them side by side.",
      goldLocked: "Your Gold Quote is ready. Select Reveal Quote to see it.",
      goldRevealed: "Your Gold Quote is from {insurer} at {price}, with {list}, built by BimaNetra from your verified details.",
      sumInsured: "Every quote here is for {sum} of cover. You can change it with Edit Details.",
      details: "These quotes are for {company}: {list}. Use Edit Details to change any of these.",
      noRecommend:
        "I can't pick an insurer for you, but I can show how they differ. Try asking which is the lowest price, which you can buy now, or to compare two of them.",
      whatIsDo:
        "Directors & Officers insurance pays legal costs, settlements and damages when your directors or officers are sued over decisions they made running the company.",
      claimsBasis: "All of these are claims made: they pay for claims first made against you while the policy is active.",
      help: "You can call our IRDAI-certified experts on {phone}, or keep asking me here.",
      thanks: "Happy to help. Ask me anything else about these quotes.",
      greet: "Hi! Ask me about prices, coverages, or how two insurers differ.",
      fallback:
        "I'm not sure about that one yet. I can tell you about prices, what each insurer covers or doesn't, which you can buy now, and how two quotes compare.",
      and: " and ",
    },
  },
  detailsPanel: {
    title: "Your Details",
    editLabel: "Edit Details",
    companyLabel: "Quotes for",
    companyInfo: "These quotes are for this company, as registered with the MCA. For a different company, start a new quote.",
    rows: [
      { label: "Enter Company Type", value: "Private Limited Company", key: "type" },
      { label: "Type of Business", value: "IT & Digital Businesses", key: "business" },
      { label: "Company's Annual Turnover", value: "₹50 Cr to ₹250 Cr", key: "turnover" },
      { label: "Company PAN", value: "-", key: "cin" },
      { label: "Existing Directors & Officers Policy", value: "No", key: "existingPolicy" },
      { label: "Claims or Incidents in the Last 5 Years", value: "No", key: "claims5y" },
      { label: "Sum Insured", value: "₹5 Cr", key: "coverage" },
    ],
    upgrade: {
      title: "Ready to Upgrade?",
      body: "We're verifying your business now and are preparing a special quote for you. We'll inform you when it's ready.",
      percent: 29,
      timeLeft: "Arriving Soon",
      ctaLabel: "Notify Me",
      notifyToast: {
        title: "We'll let you know",
        description: "You'll get an email and SMS as soon as your Gold Quote is ready.",
      },
      simulateLabel: "Simulate verification",
      timeSteps: ["Arriving Soon", "Arriving Soon", "Almost There"],
    },
    noRecords: {
      title: "Want a Sharper Price?",
      body: "We couldn't find public records to verify your business, so these are standard quotes. Our experts can help you find the right cover.",
      ctaLabel: "Speak to an Expert",
      ctaHref: "tel:+919007296854",
      webCtaLabel: "Schedule a Call",
    },
    upgraded: {
      title: "You’re Upgraded!",
      body: "We’ve verified your business and priced a Gold Quote just for you.",
      titleByCase: { B: "We’re Upgrading You!" },
      notifyByCase: { B: "Notify Me" },
      bodyByCase: {
        B: "We’ve verified parts of your business and drafted a Gold Quote. It gets its price and insurer once our report is ready.",
      },
      resetLabel: "Reset the upgrade demo",
    },
  },
  feed: {
    checkoutHref: "/directors-and-officers-insurance/checkout/billing",
    quoteInquiryHref: "/directors-and-officers-insurance/quotes/quote-inquiry",
    availableLabel: "{count} Directors & Officers Insurance Quotes",
    titleIconSrc: "/media/checkout/product-icon.png",
    breadcrumb: [
      { label: "HOME", href: "/directors-and-officers-insurance" },
      { label: "DIRECTORS & OFFICERS INSURANCE", href: "/directors-and-officers-insurance" },
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
    filterFieldLabel: "Filter Insurance Companies",
    filterLabel: "Filtering: {option}",
    filterAllLabel: "All Insurers",
    filterCountLabel: "{count} Insurers",
    filterResetLabel: "Reset All",
    filterApplyLabel: "Apply Changes",
    sortFilterLabel: "Sort & Filter",
    sortFilterTitle: "Sort & Filter",
    sortFilterCloseLabel: "Close",
    sortFieldLabel: "Sort Quotes",
    sortLabel: "{option}",
    sortOptions: [
      { id: "priceLow", label: "Price: Low to High" },
      { id: "priceHigh", label: "Price: High to Low" },
    ],
    noResults: {
      title: "No Quotes Match These Filters",
      body: "Try another filter, or turn off Immediate Purchase Only.",
      resetLabel: "Show All Quotes",
    },
    switchLabel: "Immediate Purchase Only",
    quotes: QUOTES,
    quotesByCase: { A: MATCHED_QUOTES, B: MATCHED_QUOTES },
    viewFeaturesLabel: "View All Features",
    featuresDrawer: FEATURES_DRAWER,
    compareLabel: "Add to Compare",
    compareSheet: { title: "Compare Quotes", ctaLabel: "Compare Now", removeLabel: "Remove {insurer} from compare", min: 2, max: 3, minTip: "Pick at least 2 quotes to compare", goldShortName: "Personalised Quote" },
    compareView: COMPARE_VIEW,
    comparisonUnavailableLabel: "Unavailable",
    getQuoteLabel: "Request Quote",
    sumInsuredLabel: "Sum Insured",
    immediatePurchaseLabel: "Immediate Purchase",
    territoryLabels: { worldwide: "Worldwide Coverage", india: "India Only Coverage" },
    cardTips: {
      immediate: TAG_TIPS.immediate,
      gold: TAG_TIPS.gold,
      compareOff: "This insurer quotes offline, so it can't be compared",
      offer: "Down from {from} with BimaNetra",
      compareFull: "You can compare up to 3 quotes",
      territory: TAG_TIPS.territory,
    },
    revealQuoteLabel: "Reveal Quote",
    revealLockedHint: "Unlocks once we've verified your business",
    revealReadyHint: "Your Personalised Gold Quote is ready",
    /* Mock prices are for ₹10 Cr at ₹5–50 Cr turnover (Pepe Jeans): bigger
       businesses and more cover cost more. */
    pricing: {
      referenceCrore: 10,
      coverExponent: 0.8,
      turnoverFactors: {
        "Up to ₹1 Cr": 0.8,
        "₹1 Cr to ₹5 Cr": 0.9,
        "₹5 Cr to ₹50 Cr": 1,
        "₹50 Cr to ₹250 Cr": 1.35,
        "₹250 Cr to ₹500 Cr": 1.7,
        "₹500 Cr to ₹700 Cr": 2,
        "₹700 Cr and Above": 2.4,
      },
      roundTo: 100,
    },
    goldQuote: CASE_B_GOLD,
    goldQuoteByCase: { A: CASE_A_GOLD },
    goldGateByCase: { B: CASE_B_GOLD_GATE },
    quoteRequestDrawer: QUOTE_REQUEST_DRAWER,
    topCoveragesLabel: "Top Coverages",
    viewCoveragesLabel: "View Coverages",
    coverageCountLabel: "{count} Top Coverages",
    personalizedCountLabel: "{count} Personalised Coverages",
    coveragesUnavailableLabel: "Unavailable",
    ratingLabels: { excellent: "Excellent", good: "Good", average: "Average", na: "N/A" },
    poweredByLabel: "Secured with BimaNetra",
  },
};
