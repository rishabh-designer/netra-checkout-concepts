import type { CheckoutContent, CheckoutField } from "@/types/checkout";
import { TAG_TIPS } from "./tagTips";

/* Place of Incorporation choices (city, state). */
const PLACES = [
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Gurugram, Haryana",
  "Hyderabad, Telangana",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Kolkata, West Bengal",
  "Mumbai, Maharashtra",
  "New Delhi, Delhi",
  "Noida, Uttar Pradesh",
  "Pune, Maharashtra",
];

/* Company step fields (Figma 638:20126 exact / 638:18865 fuzzy): Pincode +
   Place side by side and Address full width. An exact match (A) leads with
   the pincode; a guess (B) leads with the address, the part to check first.
   Values and states differ per case. */
function companyFields(
  status: CheckoutField["status"],
  pincode: string,
  place: string,
  address: string,
  addressFirst = false,
): CheckoutField[] {
  const pin: CheckoutField = { key: "pincode", label: "Pincode", mandatory: true, control: "text", value: pincode, status, placeholder: "Enter Pincode", inputMode: "numeric", maxLength: 6, validate: "pincode" };
  const plc: CheckoutField = { key: "place", label: "Place of Incorporation", mandatory: true, control: "select", value: place, status, placeholder: "Select Place of Incorporation", options: PLACES };
  const addr: CheckoutField = { key: "address", label: "Address", mandatory: true, control: "textarea", value: address, status, placeholder: "Enter your company's registered address" };
  return addressFirst ? [addr, pin, plc] : [pin, plc, addr];
}

/* KYC number fields (Figma 484:26922), index-aligned with the uploads above
   them: GST under the GST certificate, PAN under the PAN card. */
function kycFields(
  gst: { value: string; status: CheckoutField["status"] },
  pan: { value?: string; seedFrom?: string; status: CheckoutField["status"] },
): CheckoutField[] {
  return [
    { key: "gstin", label: "Company GST Number", mandatory: true, control: "text", value: gst.value, status: gst.status, placeholder: "Enter GST Number", maxLength: 15, validate: "gstin", upper: true, readFrom: "gstinFile", lockedPlaceholder: "Read from your GST certificate" },
    { key: "pan", label: "Company PAN", reviewLabel: "Company PAN", mandatory: true, control: "text", value: pan.value, seedFrom: pan.seedFrom, status: pan.status, placeholder: "Enter PAN Number", maxLength: 10, validate: "pan", upper: true },
  ];
}

/* Place of Incorporation from the first three digits of a pincode (demo
   table: one prefix per entry in PLACES). */
const PINCODE_PLACES: [string, string][] = [
  ["560", "Bengaluru, Karnataka"],
  ["600", "Chennai, Tamil Nadu"],
  ["122", "Gurugram, Haryana"],
  ["500", "Hyderabad, Telangana"],
  ["452", "Indore, Madhya Pradesh"],
  ["302", "Jaipur, Rajasthan"],
  ["700", "Kolkata, West Bengal"],
  ["400", "Mumbai, Maharashtra"],
  ["110", "New Delhi, Delhi"],
  ["201", "Noida, Uttar Pradesh"],
  ["411", "Pune, Maharashtra"],
];

/** Fixture for the checkout journey (Figma 484:25856 Billing / 484:26420
 *  Company / 484:26922 KYC / 484:27578 Review). */
export const mockCheckoutContent: CheckoutContent = {
  header: {
    logoSrc: "/figma/logotype.svg",
    logoAlt: "BimaKavach",
    supportLabel: "Speak to an Expert",
    supportIconSrc: "/media/checkout/headset.svg",
    cautionIconSrc: "/media/checkout/caution.webp",
    kolamSrc: "/media/checkout/kozam.svg",
  },
  title: "Checkout",
  backLabel: "Back to Quotes",
  backToStepLabel: "Back to {step}",
  preparingLabel: "Preparing Checkout",
  footer: { totalLabel: "Total Cost:", showSummaryLabel: "Show Purchase Summary", hideSummaryLabel: "Hide Purchase Summary" },
  saveLabel: "Save & Continue",
  ctaBlocked: { fields: "Fill in the required fields first", consent: "Tick the box to confirm first" },
  verifyText: "I confirm these details are correct. The insurer issues my policy using them, so I have checked them carefully.",
  stepperLabels: { billing: "Billing", company: "Company", kyc: "KYC", review: "Review" },
  stepperUpcomingTip: "Finish the earlier steps first",
  stepperAriaLabel: "Checkout progress",
  otherPersonLabel: "Buy in Another Person's Name",
  steps: {
    billing: {
      title: "Billing",
      banner:
        "These details will be shown on your policy & used for communication. You can purchase the policy in another person's name by selecting the option below.",
      sectionTitle: "Primary Policy Details",
      otherPerson: "live",
      // Figma 638:16876: the company (locked, it's what's being insured), then
      // the buyer's name, phone and email, labelled, 2 × 2.
      fields: [
        { key: "companyName", label: "Enter Company Name", reviewLabel: "Company Name", control: "text", seedFrom: "companyName", status: "verified", placeholder: "Company Name", keepForOtherPerson: true, locked: true },
        { key: "fullName", label: "Your Full Name", mandatory: true, control: "text", seedFrom: "fullName", status: "verified", placeholder: "Enter Full Name" },
        { key: "phone", label: "Your Phone Number", mandatory: true, control: "text", seedFrom: "phone", status: "verified", prefix: "+91", placeholder: "0000 000 000", inputMode: "tel", validate: "phone" },
        { key: "email", label: "Your Email Address", mandatory: true, control: "text", seedFrom: "email", status: "verified", placeholder: "Enter Email Address", inputMode: "email", validate: "email" },
      ],
    },
    company: {
      title: "Company",
      banner: "These company details will be shown on your policy & used for policy communication.",
      sectionTitle: "Company Registration Details",
      otherPerson: "hidden",
      cases: {
        // A: registry match, filled and verified (purple, Figma 638:20126).
        A: companyFields("verified", "560095", "Bengaluru, Karnataka", "2nd Floor, Pepe Jeans House, 18 Hosur Road, Koramangala, Bengaluru, Karnataka 560095"),
        // B: web guess, orange until the user edits it.
        B: companyFields("fuzzy", "700029", "Kolkata, West Bengal", "1st Floor, 4B Panditia Road, Ballygunge, Kolkata, West Bengal 700029", true),
        // C: nothing found, entered by hand.
        C: companyFields("empty", "", "", ""),
      },
    },
    kyc: {
      title: "KYC",
      banner: "As per IRDAI guidelines, completing KYC is mandatory to issue your policy.",
      sectionTitle: "KYC Details",
      otherPerson: "hidden",
      uploads: [
        { key: "gstinFile", label: "Upload a PDF or an Image of Your Company GST Certificate", reviewLabel: "GSTIN Upload", title: "Upload Company GST" },
        { key: "panFile", label: "Upload a PDF or an Image of Your Company PAN Card", reviewLabel: "Company PAN Card Upload", title: "Upload Company PAN Card" },
      ],
      cases: {
        A: kycFields({ value: "29AAJCP5565B1Z5", status: "verified" }, { value: "AAJCP5565B", status: "verified" }),
        // B: the PAN was MCA-confirmed in Business; the GSTIN is a web guess.
        B: kycFields({ value: "19AATFS4271L1ZQ", status: "fuzzy" }, { value: "AATFS4271L", status: "success" }),
        // C: the PAN the user typed in Business; no GSTIN yet.
        C: kycFields({ value: "", status: "empty" }, { seedFrom: "cin", status: "userFilled" }),
      },
      // A: both documents came back from the MCA with the registry match.
      fetched: {
        A: { gstinFile: "PepeJeans-GST-Certificate.pdf", panFile: "PepeJeans-PAN-Card.pdf" },
      },
      gstStateCodes: {
        Karnataka: "29",
        "Tamil Nadu": "33",
        Haryana: "06",
        Telangana: "36",
        "Madhya Pradesh": "23",
        Rajasthan: "08",
        "West Bengal": "19",
        Maharashtra: "27",
        Delhi: "07",
        "Uttar Pradesh": "09",
      },
    },
    review: {
      title: "Review",
      banner: "Please check your details once more before purchase.",
      sectionTitle: "Details Shown on Policy",
      otherPerson: "hidden",
      sectionTitles: { billing: "Billing", company: "Company", kyc: "KYC" },
      editLabel: "Edit Details",
      lockedEditTip: "Billing details are locked once saved",
      uploadedLabel: "Uploaded",
      consentText:
        "I confirm all details provided are correct. I understand the broker is not responsible for policy creation errors, as this depends on the insurance company.",
      // `{price}` is the chosen quote's total (GST included).
      payLabel: "Pay {price}",
      payNowLabel: "Pay Now",
      requestLabel: "Request Quote",
    },
  },
  upload: {
    hint: "Click to browse, or drag and drop the file here",
    successTitle: "Uploaded successfully",
    successBody: "{file} has been uploaded.",
    failureTitle: "Upload failed",
    tooLarge: "{file} is larger than 2MB",
    wrongType: "{file} isn't an image or a PDF",
    cancelLabel: "Try Again",
    retryLabel: "Try Again",
    disabledTitle: "Unable to upload",
    disabledBody: "Please refresh or try again later.",
    fetchedTitle: "Fetched successfully",
    fetchedBody: "{file} has been fetched from MCA.",
    fetchedAction: "Upload New",
    maxBytes: 2 * 1024 * 1024,
  },
  summary: {
    title: "Purchase Summary",
    immediateLabel: "Immediate Purchase",
    poweredByLabel: "Secured with BimaNetra",
    productLines: ["Directors & Officers", "Insurance"],
    productIconSrc: "/media/checkout/product-icon.png",
    priceTitle: "Price Details",
    premiumLabel: "Premium",
    gstLabel: "GST (18%)",
    totalLabel: "Total Cost",
    gstRate: 0.18,
    offerLabel: "BimaNetra Offer",
    offerPercent: "({pct}% Off)",
    priceLabel: "Price",
    insurerInfoLabel: "About this insurer",
    excellentLabel: "Excellent",
    tips: { immediate: TAG_TIPS.immediate, gold: TAG_TIPS.gold, insurer: "{insurer} issues this policy and settles its claims" },
  },
  success: {
    greeting: "Hello, {name}. You have successfully paid for your Directors & Officers Insurance policy for {company} {order}.",
    orderPrefix: "DNO",
    badgeAlt: "Payment successful",
    stats: {
      startLabel: "Policy Start Date",
      endLabel: "Policy End Date",
      premiumLabel: "Total Paid",
      periodLabel: "Coverage Period",
      periodValue: "12 Months",
    },
    stepLabels: ["Profiling", "Quotes", "Checkout", "Due Diligence", "Policy Issuance"],
    profiling: {
      title: "Your Risk Was Profiled",
      body: "You're interested in {product}. BimaNetra profiled your business and priced the risk in under a minute.",
      statusLabel: "Profiling Done",
      time: "45.4s",
    },
    quoteGold: {
      title: "Quote Selected",
      body: "You selected your Gold Quote for {product}, built by BimaNetra with {count} for your business. An excellent choice!",
      statusLabel: "BimaNetra Report",
      time: "8.4s",
    },
    quoteOther: {
      title: "Quote Selected",
      body: "You selected {insurer}'s quote for {product}, with {count}.",
      statusLabel: "Quotes Ready",
      time: "8.4s",
    },
    diligence: {
      A: {
        title: "Immediate Purchase: Made",
        body: "Your business records are clean and up to date, so BimaNetra fetched everything instantly. It took you just {time} to pay.",
        statusLabel: "Checkout Completed",
      },
      B: {
        title: "Immediate Purchase: Made",
        body: "You confirmed the details BimaNetra matched for your business. It took you {time} to pay, and we'll double-check the rest.",
        statusLabel: "Checkout Completed",
      },
      C: {
        title: "Immediate Purchase: Made",
        body: "You filled in your business details yourself, and it took you {time} to pay. We'll check them before your policy is issued.",
        statusLabel: "Checkout Completed",
      },
      expert: {
        title: "Next Up: Expert Review",
        body: "An expert confirms your details with the insurer before the policy is issued, usually within a working day. It took you {time} to pay.",
        statusLabel: "Checkout Completed",
      },
    },
    mandate: {
      title: "Next Up: Sign Your Mandate",
      body: "To issue your new policy, your {mandate}. Don't worry, it's ready, and it's also in your BimaKendra Tasks.",
      link: "Mandate Letter must be signed",
    },
    issuance: {
      title: "Next Up: Policy Issuance",
      body: "Your policy copy will be in the Policies folder of your Document Vault as soon as it's issued.",
    },
    signLabel: "Sign Mandate Letter",
    stepToggle: { show: "Show Details", hide: "Hide Details" },
    viewPolicyLabel: "View Policy Copy",
    viewPolicyPendingTip: "Ready once the insurer issues your policy",
    riskReportLabel: "Download Risk Report",
    nextUp: "Next up: sign your mandate, fill in your proposal and get your policy issued!",
    hideNextUp: true,
    mandateToast: {
      title: "Mandate Letter sent",
      description: "We've emailed it to {email}. Sign it there and we'll take it from here.",
    },
    paidLabel: "Paid successfully on {date}",
    coveragesLabel: "{count} Top Coverages",
    personalizedLabel: "{count} Personalised Coverages",
    rm: {
      eyebrow: "Meet Your Relationship Manager",
      name: "Shubh Bangar",
      photoSrc: "/media/success/rm-photo.png",
      body: "Shubh has been in the insurance field for over 7 years. He can support you with your existing policies and advise you on other products to keep your business fully protected.",
      phone: "+91-90072-96854",
      phoneHref: "tel:+919007296854",
      phoneIconSrc: "/media/gold-inquiry/call.svg",
    },
    suggestions: {
      title: "BimaNetra Suggests",
      ctaLabel: "Get a Quote",
      immediateLabel: "Immediate Purchase",
      immediateTip: TAG_TIPS.immediate,
      items: [
        { name: "Professional Indemnity Insurance", body: "Covers claims that your advice or services caused a client a financial loss.", iconSrc: "/media/success/pi.png", immediate: true },
        { name: "Cyber Insurance", body: "Covers the cost of a data breach, ransomware attack or systems going down.", iconSrc: "/media/success/cyber.png" },
        { name: "Commercial General Liability Insurance", body: "Covers injury or property damage your business causes to customers and visitors.", iconSrc: "/media/success/cgl.png", immediate: true },
      ],
    },
    loadingLabel: "Confirming your payment",
    riskHeld: {
      title: "Risk Held Letter",
      body: "A Risk Held Letter (also called a Held Cover Letter) is issued by the insurer or broker to confirm your cover is active while the final policy is processed and underwritten.",
      preview: {
        title: "Risk Held Letter",
        forLabel: "Directors & Officers Insurance Policy for {company}",
        backEyebrow: "Directors & Officers Insurance",
        backTitle: "Risk Assessment Report",
        summaryLabel: "Executive Summary",
      },
      imageAlt: "A preview of your Risk Held Letter",
      downloadLabel: "View",
      whatsappLabel: "Send to WhatsApp",
      downloadToast: { title: "Opening your Document Vault", description: "We'll take you to BimaKendra's Document Vault, where your Risk Held Letter is kept safe." },
      whatsappToast: { title: "Sent to WhatsApp", description: "Your Risk Held Letter is on its way to +91 {phone}." },
      delayMs: 4000,
    },
  },
  disclaimer: {
    title: "Disclaimer",
    toggleLabel: "Show or hide the disclaimer",
    // The first line depends on where it's read; the legal lines never change.
    contextual: {
      checkout: "*The price shown is final for the details you've entered. If any of them turn out to be wrong, the insurer may revise it.",
      success: "*Your cover is held from the date of payment. The insurer issues the final policy after its checks, based on the details you've provided.",
    },
    paragraphs: [
      "BimaKavach Insurance Broking Pvt. Ltd. | CIN- U66010MP2022PTC059393 | Registered Office - 506, 5th floor, Om Gurudev Plaza, Savitri Empire Scheme No 54, Vijay Nagar, Bhamori, Indore, Madhya Pradesh - 452010 Phone No.- 9036554785 | Email- support@bimakavach.com",
      "BimaKavach is registered as a Direct Broker | Registration No. 901, Registration Code No. IRDAI / DB 985/ 2022, Valid till 25/06/2027, Licence category - Direct Broker (General)",
      "Visitors are being informed that BimaKavach Insurance Broking Pvt. Ltd. holds the right to share the information submitted by you on the website with Insurers. Product information is genuine and exclusively based on information obtained from insurers.",
    ],
  },
  pincodePlaces: PINCODE_PLACES,
  drawer: { saveLabel: "Save Changes", closeLabel: "Close" },
  companyEmailMessage: "Use a company email ending in @{domain}",
  validationMessages: {
    phone: "Enter a 10-digit mobile number",
    email: "Enter a valid email address",
    pincode: "Pincodes have 6 digits",
    gstin: "GST numbers look like 29ABCDE1234F1Z5",
    pan: "PAN numbers look like ABCDE1234F",
  },
  // Studio Two Rupees (Case C) demo entries, used when checkout opens without a flow.
  fallbackValues: { fullName: "Ashlen Singh", phone: "9007296854", email: "cdo@studio2rs.in", cin: "AAABC1234A", coverage: "₹5 Cr" },
  fallbackCompanyName: "Studio Two Rupees LLP",
};
