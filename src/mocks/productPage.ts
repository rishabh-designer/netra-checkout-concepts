import type { ProductPageContent } from "@/types/productPage";

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
];
const TURNOVER_OPTIONS = [
  "₹ 0Cr – 5 Cr",
  "₹ 5Cr - 15 Cr",
  "₹ 15Cr - 50 Cr",
  "₹ 50Cr - 100 Cr",
  "₹ 100Cr+",
];

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
    { label: "Powered by BimaNetra", variant: "special", icon: "eye" },
  ],
  title: "Director’s & Officer’s Insurance",
  subtitle: "Protects executives when business decisions lead to lawsuits",
  stats: [
    { value: "4,500", label: "Companies Covered" },
    { value: "80%", label: "Claim settled in 40 days" },
    { value: "98%", label: "Client Retention" },
  ],
  media: {
    videoSources: [
      { src: "/media/media-do.webm", type: "video/webm" },
      { src: "/media/media-do.mp4", type: "video/mp4" },
    ],
    stillSrc: "/media/media-do.webp",
    stillAlt: "Mumbai skyline rendered in a dithered halftone style",
    noiseSrc: "/figma/noise-texture.png",
  },
  leadForm: {
    priceKicker: "Get ₹25 Lakh Cover",
    priceHeadline: "Starting At ₹3,000/Year",
    promoBadge: "New",
    promoLabel: "Personalize My Quote",
    promoLinkLabel: "Know More",
    inputPlaceholder: "Enter your Legal Company Name",
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
    steps: ["Business Profile", "Insurance Profile", "Quotes"],
    activeStep: 0,
    title: "Business",
    ctaLabel: "Get Instant Quotes",
    emptyNameToast: {
      title: "Company name required",
      description: "Enter your legal company name to get an instant quote.",
    },
    cases: {
      // A — probe confirmed the record: filled, green, CIN second.
      A: {
        requiresConsent: false,
        fields: [
          { key: "name", label: "Enter Company Name", mandatory: true, control: "text", value: "Rambo Undergarments", status: "verified" },
          { key: "cin", label: "Enter Company CIN", mandatory: true, control: "text", value: "U10304MH2024PTC421686", status: "success" },
          { key: "type", label: "Enter Company Type", mandatory: true, control: "text", value: "Private Limited Company", status: "success" },
          { key: "business", label: "Type of Business", mandatory: true, control: "text", value: "Retail & Wholesale", status: "success" },
          { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "text", value: "₹ 5Cr - 15 Cr", status: "success" },
        ],
        search: {
          query: "Rambo Undergarments",
          tabs: ["Netra Mode", "All", "Images", "Videos", "News"],
          body: {
            cinSentence:
              "The Corporate Identification Number (CIN) for Rambo Undergarments is U10304MH2024PTC421686.",
            cinHighlight: "U10304MH2024PTC421686.",
            detailsHeading: "Company Details",
            details: [
              "Date of Incorporation: March 18, 2024",
              "Registered State: Maharashtra, India (Mumbai)",
              "Company Type: Private Limited Company",
              "Founders: Nikunj Anil Biyani and Ranveer Singh",
            ],
            founderTag: "LinkedIn India · Rambo… +1",
            footer:
              "Would you like to know more details about Rambo Undergarments (such as registered address, directors, or funding history)?",
          },
        },
      },
      // B — probe missed, agent guessed from the web: orange, dropdowns, CIN last, consent.
      B: {
        requiresConsent: true,
        consentText:
          "I confirm all details provided are correct. I understand the broker is not responsible for policy creation errors, as this depends on the insurance company.",
        fields: [
          { key: "name", label: "Enter Company Name", mandatory: true, control: "text", value: "Rambo Underwear", status: "verified" },
          { key: "type", label: "Enter Company Type", mandatory: true, control: "select", value: "Public Listed Company", options: COMPANY_TYPE_OPTIONS, status: "fuzzy" },
          { key: "business", label: "Type of Business", mandatory: true, control: "select", value: "IT & Digital Businesses", options: BUSINESS_OPTIONS, status: "fuzzy" },
          { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "select", value: "₹ 0Cr – 5 Cr", options: TURNOVER_OPTIONS, status: "fuzzy" },
          { key: "cin", label: "Enter Company CIN", control: "text", value: "U11324VX0132UCW9129176", placeholder: "Enter Company CIN", status: "fuzzy" },
        ],
        search: {
          query: "Rambo Underwear",
          tabs: ["Netra Mode", "All", "Images", "Videos", "News"],
          body: {
            tentative: true,
            cinSentence:
              "We couldn't verify an exact record for “Rambo Underwear”. The closest match from a web search suggests a CIN of U11324VX0132UCW9129176 — please double-check.",
            cinHighlight: "U11324VX0132UCW9129176",
            detailsHeading: "BimaNetra's Guess",
            details: [
              "Likely company type: Public Listed Company",
              "Possible line of business: IT & Digital Businesses",
              "Estimated annual turnover: ₹0Cr – 5Cr",
              "Founders: could not be confirmed",
            ],
            footer:
              "These are best-effort guesses pulled from public sources, not a confirmed record. Review and correct each field, then tick the box to confirm before continuing.",
          },
        },
      },
      // C — nothing found: empty, manual entry, CIN last, no consent.
      C: {
        requiresConsent: false,
        fields: [
          { key: "name", label: "Enter Company Name", mandatory: true, control: "text", value: "", status: "verified" },
          { key: "type", label: "Enter Company Type", mandatory: true, control: "select", value: "", placeholder: "Select Company Type", options: COMPANY_TYPE_OPTIONS, status: "empty" },
          { key: "business", label: "Type of Business", mandatory: true, control: "select", value: "", placeholder: "Select Type of Business", options: BUSINESS_OPTIONS, status: "empty" },
          { key: "turnover", label: "Company's Annual Turnover", mandatory: true, control: "select", value: "", placeholder: "Select Annual Turnover", options: TURNOVER_OPTIONS, status: "empty" },
          { key: "cin", label: "Enter Company CIN", control: "text", value: "", placeholder: "Enter Company CIN", status: "empty" },
        ],
        search: {
          query: "",
          tabs: ["Netra Mode", "All", "Images", "Videos", "News"],
          body: null,
          emptyNote:
            "We couldn't find public records for this company. Please fill in the details manually to continue.",
        },
      },
    },
  },
  tickerPhrases: ["quotes in seconds", "coverage in minutes"],
  flourishSrc: "/media/do-logo.svg",
};
