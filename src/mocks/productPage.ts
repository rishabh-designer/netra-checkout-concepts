import type { ProductPageContent, QuoteCase, QuoteSearchPanel } from "@/types/productPage";

const COMPANY_TYPE_OPTIONS = [
  "Private Limited Company",
  "Public Listed Company",
  "Limited Liability Partnership",
  "Partnership Firm",
  "Sole Proprietorship",
];
const BUSINESS_OPTIONS = [
  "Retail & Wholesale",
  "IT & Digital Businesses",
  "Manufacturing",
  "Professional Services",
  "Hospitality",
  "Unclassified / Miscellaneous",
];
const TURNOVER_OPTIONS = [
  "Up to ₹1 Cr",
  "₹1 Cr to ₹5 Cr",
  "₹5 Cr to ₹50 Cr",
  "₹50 Cr to ₹250 Cr",
  "₹250 Cr to ₹500 Cr",
  "₹500 Cr to ₹700 Cr",
  "₹700 Cr and Above",
];
const COVERAGE_OPTIONS = [
  "₹25 Lacs", "₹50 Lacs", "₹1 Cr", "₹2 Cr", "₹3 Cr", "₹4 Cr", "₹5 Cr", "₹7.5 Cr", "₹8 Cr", "₹9 Cr",
  "₹10 Cr", "₹12 Cr", "₹15 Cr", "₹16 Cr", "₹18 Cr", "₹20 Cr", "₹21 Cr", "₹24 Cr", "₹25 Cr",
];

// Sum Insured (was "Required Coverage") — label + info tooltip, shared by all cases.
const SUM_INSURED_LABEL = "Sum Insured";
const SUM_INSURED_TOOLTIP =
  "\"Sum insured\" represents the absolute financial ceiling that an insurance company will pay out in the event of a valid claim.";

const TABS = ["BimaNetra", "All", "Images", "Videos", "News"];

// Shown in the reserved help row under web-guessed (fuzzy) fields.
const FETCH_DISCLAIMER = "Fetched from publicly available sources. BimaNetra can make mistakes.";

/** Shared broker-liability consent (Fuzzy / Case B, both steps). */
const CONSENT_TEXT =
  "I confirm all details provided are correct. I understand the broker is not responsible for policy creation errors, as this depends on the insurance company.";

/* The left-panel search result persists across steps (same company), so the
   three per-case panels are authored once and reused by both form steps. */
const SEARCH_MATCHED: QuoteSearchPanel = {
  query: "Pepe Jeans Innerfashion Private Limited",
  tabs: TABS,
  body: {
    cinSentence:
      "The Permanent Account Number (PAN) for Pepe Jeans Innerfashion Private Limited is AAJCP5565B.",
    cinHighlight: "AAJCP5565B.",
    detailsHeading: "Company Details",
    details: [
      "Date of Incorporation: June 12, 2019",
      "Registered State: West Bengal, India (Kolkata)",
      "Company Type: Private Limited Company",
      "Directors: Amit Sharma, Kavita Rao +2",
    ],
    founderTag: "LinkedIn India · Pepe Je… +1",
    footer:
      "Would you like to know more details about Pepe Jeans Innerfashion (such as registered address, directors, or funding history)?",
  },
};

const SEARCH_FUZZY: QuoteSearchPanel = {
  query: "Sabyasachi Calcutta LLP",
  tabs: TABS,
  body: {
    tentative: true,
    cinSentence:
      "MCA filings confirm the PAN for Sabyasachi Calcutta LLP is AATFS4271L; its business classification is still unverified.",
    cinHighlight: "AATFS4271L",
    detailsHeading: "MCA Records",
    details: [
      "Directors (6): Sabyasachi Mukherjee, Sukumar Mukherjee, Ashish Dikshit, Sunny Kumar Jain, Jagdish Bajaj, Sunita Bangard",
      "Incorporated: Feb 2021 (via MCA)",
      "Business: NIC code 99 (unclassified / misc.)",
    ],
    founderTag: "MCA DATA · SABYA…",
    footer:
      "The PAN is confirmed from MCA filings; company type and line of business are best-effort guesses. Review each field, then tick the box to confirm before continuing.",
  },
};

const SEARCH_EMPTY: QuoteSearchPanel = {
  query: "",
  tabs: TABS,
  body: null,
  emptyNote:
    "We couldn't find public records for this company. Please fill in the details manually to continue.",
};

/* Risk step (step 2) — the active task surfaces the "News" tab, so its panels
   read as a live press search on the company rather than the CIN/registry view.
   Each is a realistic MIXED feed: some reassuring coverage, some cautionary,
   some neutral — the kind of signal an underwriter would actually weigh. */
const RISK_NEWS_A: QuoteSearchPanel = {
  query: "Pepe Jeans Innerfashion Private Limited",
  tabs: TABS,
  body: {
    cinSentence:
      "Recent press on Pepe Jeans Innerfashion is mixed: strong FY24 innerwear growth sits alongside a distributor payment dispute and a routine compliance query.",
    cinHighlight: "mixed",
    detailsHeading: "Recent Coverage",
    details: [
      "Business Standard - Pepe Jeans Innerfashion posts 21% YoY revenue growth in FY24",
      "ET Retail - Pepe Jeans innerwear adds 40 exclusive outlets across East India",
      "The Morning Context - Distributor alleges ₹38L payment delay by innerwear brand",
      "MoneyControl - MCA lists one registered charge, no litigation on record",
    ],
    founderTag: "ET Retail +3",
    footer: "Would you like BimaNetra to find other additional information?",
  },
};

const RISK_NEWS_B: QuoteSearchPanel = {
  query: "Sabyasachi Calcutta LLP",
  tabs: TABS,
  body: {
    tentative: true,
    cinSentence:
      "We couldn't tie this coverage to a verified entity for “Sabyasachi Calcutta LLP”. The results below are unconfirmed and may mix up more than one business.",
    cinHighlight: "unconfirmed",
    detailsHeading: "Unverified Coverage",
    details: [
      "Trade blog - “Sabyasachi Calcutta” linked to a GST notice (entity not corroborated)",
      "LinkedIn - a page by this name lists a Kolkata address, unverified",
      "Regional daily - studio expansion reported, no official filing found",
    ],
    founderTag: "2 low-confidence sources",
    footer:
      "Confirm the company details so BimaNetra can pull verified coverage before scoring risk.",
  },
};

const RISK_NEWS_C: QuoteSearchPanel = {
  query: "",
  tabs: TABS,
  body: null,
  emptyNote:
    "No news coverage found for this business yet. Fill in the details manually and BimaNetra will keep scanning for relevant press.",
};

/* Profile (step 0) is a data-collection step: the company name is seeded from
   the typed name; full name / phone / email are entered by the user. Its status
   reacts to fill (collectMode), so one case serves A/B/C. The engine task for
   this step carries no search body. */
const PROFILE_CASE: QuoteCase = {
  requiresConsent: false,
  search: SEARCH_MATCHED,
  fields: [
    { key: "name", label: "Enter Company Name", mandatory: true, control: "text", value: "", status: "verified" },
    { key: "fullName", label: "Your Full Name", mandatory: true, control: "text", value: "", placeholder: "Enter Full Name", status: "empty" },
    { key: "phone", label: "Your Phone Number", mandatory: true, control: "text", value: "", prefix: "+91", placeholder: "0000 000 000", status: "empty" },
    { key: "email", label: "Your Email Address", mandatory: true, control: "text", value: "", placeholder: "Enter Email Address", status: "empty" },
  ],
};

/* Case A (confirmed — "Pepe Jeans Innerfashion Private Limited") Profile: clicking the "Profile"
   title fills the contact details for the demo. */
const PROFILE_CASE_A: QuoteCase = {
  ...PROFILE_CASE,
  demoFill: { fullName: "Amit Sharma", phone: "9007296854", email: "finance@pepejeans.in" },
};

/* Case B (fuzzy — "Sabyasachi Calcutta") Profile: clicking the "Profile" title
   fills the contact details for the demo. */
const PROFILE_CASE_B: QuoteCase = {
  ...PROFILE_CASE,
  demoFill: { fullName: "Sabyasachi Mukherjee", phone: "9007296854", email: "ceo@sabyasachi.in" },
};

/* Case C (no data — "Studio Two Rupees") Profile: clicking the "Profile" title
   fills the contact details for the demo. */
const PROFILE_CASE_C: QuoteCase = {
  ...PROFILE_CASE,
  demoFill: { fullName: "Ashlen Singh", phone: "9007296854", email: "cdo@studio2rs.in" },
};

/** Fixture for the Director's & Officer's Insurance product page (Figma node 179:65816). */
export const mockProductPageContent: ProductPageContent = {
  nav: {
    logoSrc: "/figma/logotype.svg",
    logoAlt: "BimaKavach",
    items: [
      { label: "Policies", hoverLabel: "Products", hasDropdown: true, href: "#" },
      { label: "About Us", hoverLabel: "About Us", href: "#" },
      { label: "Claims", hoverLabel: "Claims", href: "#" },
    ],
    loginLabel: "Login",
  },
  breadcrumbs: [
    { label: "HOME", href: "#" },
    { label: "Director’s & Officer’s Insurance" },
  ],
  tags: [
    { label: "Immediate Purchase", variant: "success", icon: "shoppingBag" },
    { label: "Powered by BimaNetra", variant: "secondary", icon: "eye" },
  ],
  title: "Director’s & Officer’s Insurance",
  subtitle: "Protects executives when business decisions lead to lawsuits",
  stats: [
    { value: "4,500", label: "Companies Covered" },
    { value: "80%", label: "Claim settled in 40 days" },
    { value: "98%", label: "Client Retention" },
  ],
  media: {
    videoSources: [{ src: "/media/media-do.webm", type: "video/webm" }],
    stillSrc: "/media/media-do.webp",
    stillAlt: "Dithered halftone artwork for Directors & Officers insurance",
  },
  leadForm: {
    priceKicker: "Get ₹25 Lakh Cover",
    priceHeadline: "Starting At ₹3,000/Year",
    promoBadge: "New",
    promoLabel: "Personalize My Quote",
    promoLinkLabel: "Know More",
    inputPlaceholder: "Start with your Company's Legal Name",
    inputTooltip:
      "To verify you're running a registered business, we need the legal entity name registered against your PAN.",
    // Hidden demo shortcut: each click on the input's info icon cycles A → B → C.
    demoNames: ["Pepe Jeans Innerwear", "Sabyasachi Calcutta", "Studio Two Rupees"],
    ctaLabel: "Get My Quote",
    ctaMeta: "In 2 Minutes",
    providersHeading: "Policy Provided By",
    providerShowcase: [
      [
        { src: "/Insurance.Comp/Generali.webp", alt: "Future Generali", width: 36.908 },
        { src: "/Insurance.Comp/Chola.webp", alt: "Cholamandalam MS", width: 67.524 },
        { src: "/Insurance.Comp/Magma.webp", alt: "Magma HDI", width: 72.13 },
      ],
      [
        { src: "/Insurance.Comp/HDFC.webp", alt: "HDFC Ergo", width: 26.724 },
        { src: "/Insurance.Comp/Digit.webp", alt: "Digit Insurance", width: 31.589 },
        { src: "/Insurance.Comp/Navi.webp", alt: "Navi General Insurance", width: 42.032 },
      ],
      [
        { src: "/Insurance.Comp/Bajaj.webp", alt: "Bajaj Allianz General Insurance", width: 51.373 },
        { src: "/Insurance.Comp/Magma.webp", alt: "Magma HDI", width: 72.13 },
        { src: "/Insurance.Comp/Oriental.webp", alt: "Oriental Insurance", width: 63.957 },
      ],
      [
        { src: "/Insurance.Comp/IFFCO.webp", alt: "IFFCO Tokio", width: 38.205 },
        { src: "/Insurance.Comp/Reliance.webp", alt: "Reliance General Insurance", width: 66.227 },
        { src: "/Insurance.Comp/Raheja.webp", alt: "Raheja QBE", width: 80.497 },
      ],
      [
        { src: "/Insurance.Comp/ICICI.webp", alt: "ICICI Lombard General Insurance", width: 69.795 },
        { src: "/Insurance.Comp/SBI.webp", alt: "SBI General Insurance", width: 72.843 },
        { src: "/Insurance.Comp/Shriram.webp", alt: "Shriram General Insurance", width: 50.595 },
      ],
      [
        { src: "/Insurance.Comp/New.India.webp", alt: "New India Assurance", width: 103.33 },
        { src: "/Insurance.Comp/United.webp", alt: "United India Insurance", width: 90.941 },
        { src: "/Insurance.Comp/Royal.webp", alt: "Royal Sundaram", width: 60.519 },
      ],
    ],
  },
  quoteModal: {
    caseMatches: [
      {
        caseId: "A",
        aliases: ["pepe jeans innerfashion private limited", "pepe jeans innerfashion", "pepe jeans innerwear"],
        canonicalName: "Pepe Jeans Innerfashion Private Limited",
      },
      { caseId: "B", aliases: ["sabyasachi calcutta llp", "sabyasachi calcutta"] },
      // C is also the fallback for any unmatched name; this alias only swaps in
      // the demo company's legal name.
      { caseId: "C", aliases: ["studio two rupees llp", "studio two rupees"], canonicalName: "Studio Two Rupees LLP" },
    ],
    stepperLabels: ["Profile", "Business", "Risk"],
    ctaLabel: "Get Instant Quotes",
    // Live meter denominator: Company 1 + Profile 3 + Business 3 + Insurance 3.
    // CIN is non-mandatory (excluded).
    totalFlowQuestions: 10,
    // The persistent left-panel task-runner; one task per form step (index-aligned).
    engine: {
      requestLabel: "Personalize My Quote",
      messageTemplate: "BimaNetra is running 3 Tasks to complete quote Personalization for {company}",
      headingLabel: "Getting Started",
      tasks: [
        { activeLabel: "Assessing Profile", readyLabel: "Ready to Confirm Profile", doneLabel: "Profile Confirmed", hasSearch: false },
        { activeLabel: "Assessing Business", doneLabel: "Business Secured", hasSearch: true },
        { activeLabel: "Assessing Risk", doneLabel: "Insurance Confirmed", hasSearch: true },
      ],
    },
    emptyNameToast: {
      title: "Company name required",
      description: "Enter your legal company name to get an instant quote.",
    },
    completeToast: {
      title: "Preparing your quotes",
      description: "We're putting together your personalized D&O quotes from our insurers.",
    },
    steps: [
      // ── Step 0: Profile — collect the user's contact details (no branching). ──
      {
        key: "profile",
        title: "Profile",
        activeTab: "",
        collectMode: true,
        cases: { A: PROFILE_CASE_A, B: PROFILE_CASE_B, C: PROFILE_CASE_C },
      },
      // ── Step 1: Business — the typed name resolves A/B/C. ──────────────
      {
        key: "business",
        title: "Business",
        activeTab: "BimaNetra",
        cases: {
          // A — probe confirmed the record: filled, green, PAN last.
          A: {
            requiresConsent: false,
            fields: [
              { key: "type", label: "Enter Company Type", mandatory: true, control: "text", value: "Private Limited Company", status: "success" },
              { key: "business", label: "Type of Business", mandatory: true, control: "text", value: "Retail & Wholesale", status: "success" },
              { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "select", value: "₹5 Cr to ₹50 Cr", options: TURNOVER_OPTIONS, status: "success" },
              { key: "cin", label: "Enter Company PAN Number", control: "text", value: "AAJCP5565B", status: "success" },
            ],
            search: SEARCH_MATCHED,
          },
          // B — MCA confirmed the PAN, but classification is a web guess: PAN green,
          // type/business orange, turnover blank, consent required.
          B: {
            requiresConsent: true,
            consentText: CONSENT_TEXT,
            fields: [
              { key: "type", label: "Enter Company Type", mandatory: true, control: "select", value: "Limited Liability Partnership", options: COMPANY_TYPE_OPTIONS, status: "fuzzy", helpText: FETCH_DISCLAIMER },
              { key: "business", label: "Type of Business", mandatory: true, control: "select", value: "Unclassified / Miscellaneous", options: BUSINESS_OPTIONS, status: "fuzzy", helpText: FETCH_DISCLAIMER },
              { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "select", value: "", placeholder: "Select Annual Turnover", options: TURNOVER_OPTIONS, status: "empty" },
              { key: "cin", label: "Enter Company PAN Number", control: "text", value: "AATFS4271L", placeholder: "Enter Company PAN Number", status: "success" },
            ],
            search: SEARCH_FUZZY,
          },
          // C — nothing found: empty, manual entry, CIN last, no consent.
          // Clicking the "Business" title fills Studio Two Rupees' details (demo).
          C: {
            requiresConsent: false,
            demoFill: { type: "Limited Liability Partnership", business: "IT & Digital Businesses", turnover: "Up to ₹1 Cr", cin: "AAABC1234A" },
            fields: [
              { key: "type", label: "Enter Company Type", mandatory: true, control: "select", value: "", placeholder: "Select Company Type", options: COMPANY_TYPE_OPTIONS, status: "empty" },
              { key: "business", label: "Type of Business", mandatory: true, control: "select", value: "", placeholder: "Select Type of Business", options: BUSINESS_OPTIONS, status: "empty" },
              { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "select", value: "", placeholder: "Select Annual Turnover", options: TURNOVER_OPTIONS, status: "empty" },
              { key: "cin", label: "Enter Company PAN Number", control: "text", value: "", placeholder: "Enter Company PAN Number", status: "empty" },
            ],
            search: SEARCH_EMPTY,
          },
        },
      },
      // ── Step 2: Risk — same resolved case, DO questions + coverage. ─
      {
        key: "insurance",
        title: "Risk",
        activeTab: "News",
        cases: {
          // A (Matched) — auto-personalized: toggles answered No/No, coverage set, green.
          A: {
            requiresConsent: false,
            personalize: {
              pendingLabel: "Your Quote is Being Personalized",
              doneLabel: "Your Quote is Personalized!",
              skipLabel: "Skip",
            },
            fields: [
              { key: "existingPolicy", label: "Does Your Business Have An Existing Directors and Officers Policy?", mandatory: true, control: "toggle", value: "No", options: ["Yes", "No"], status: "success" },
              { key: "claims5y", label: "Any Claims or Incidents in the Last 5 Years?", mandatory: true, control: "toggle", value: "No", options: ["Yes", "No"], status: "success" },
              { key: "coverage", label: SUM_INSURED_LABEL, infoTooltip: SUM_INSURED_TOOLTIP, mandatory: true, control: "select", value: "₹10 Cr", options: COVERAGE_OPTIONS, status: "success", helpText: "This is the Sum Insured that's perfect for you", helpTone: "success" },
            ],
            search: RISK_NEWS_A,
          },
          // B (Fuzzy) — guessed: toggles orange, the same auto-personalize badge as
          // A (loading → green "Personalized!", Skip goes away), sum insured
          // in A's purple filled state with a black suggestion line, consent gate.
          B: {
            requiresConsent: true,
            consentText: CONSENT_TEXT,
            personalize: {
              pendingLabel: "Your Quote is Being Personalized",
              doneLabel: "Your Quote is Personalized!",
              skipLabel: "Skip",
            },
            fields: [
              { key: "existingPolicy", label: "Does Your Business Have An Existing Directors and Officers Policy?", mandatory: true, control: "toggle", value: "No", options: ["Yes", "No"], status: "fuzzy" },
              { key: "claims5y", label: "Any Claims or Incidents in the Last 5 Years?", mandatory: true, control: "toggle", value: "No", options: ["Yes", "No"], status: "fuzzy" },
              { key: "coverage", label: SUM_INSURED_LABEL, infoTooltip: SUM_INSURED_TOOLTIP, mandatory: true, control: "select", value: "₹10 Cr", options: COVERAGE_OPTIONS, status: "success", helpText: "This is how much coverage we think you need", helpTone: "basic" },
            ],
            search: RISK_NEWS_B,
          },
          // C (No Data) — nothing found: toggles empty + mandatory, sum insured
          // blank. Clicking the "Risk" title fills No / No / ₹5 Cr (demo).
          C: {
            requiresConsent: false,
            demoFill: { existingPolicy: "No", claims5y: "No", coverage: "₹5 Cr" },
            fields: [
              { key: "existingPolicy", label: "Does Your Business Have An Existing Directors and Officers Policy?", mandatory: true, control: "toggle", value: "", options: ["Yes", "No"], status: "empty" },
              { key: "claims5y", label: "Any Claims or Incidents in the Last 5 Years?", mandatory: true, control: "toggle", value: "", options: ["Yes", "No"], status: "empty" },
              { key: "coverage", label: SUM_INSURED_LABEL, infoTooltip: SUM_INSURED_TOOLTIP, mandatory: true, control: "select", value: "", placeholder: "Select Your Sum Insured", options: COVERAGE_OPTIONS, status: "empty" },
            ],
            search: RISK_NEWS_C,
          },
        },
      },
    ],
  },
  tickerPhrases: ["quotes in seconds", "coverage in minutes"],
  flourishSrc: "/media/do-logo.webp",
  focusHero: {
    eyebrow: "Director’s & Officer’s Insurance",
    plpIconSrc: "/media/plp-icon.svg",
    headlineCover: "₹25 Lakh Cover",
    headlinePrice: "Starting At ₹3,000/Year",
    coveredIconSrc: "/media/coverage-check.svg",
    coveredChips: [
      "Covers legal & defence costs",
      "Covers settlements & damages",
      "Covers regulatory investigations",
      "Protects directors’ personal assets",
    ],
    privacyLine: "We use your company name to look up public records, so we can assess your risk better.",
  },
};
