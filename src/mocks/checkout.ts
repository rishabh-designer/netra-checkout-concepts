import type { CheckoutContent, CheckoutField } from "@/types/checkout";

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

/* Company step fields (Figma 484:26443): Pincode + Place side by side, then
   Address full width. Values and states differ per case. */
function companyFields(
  status: CheckoutField["status"],
  pincode: string,
  place: string,
  address: string,
): CheckoutField[] {
  return [
    { key: "pincode", label: "Pincode", mandatory: true, control: "text", value: pincode, status, placeholder: "Enter Pincode", inputMode: "numeric", maxLength: 6, validate: "pincode" },
    { key: "place", label: "Place of Incorporation", mandatory: true, control: "select", value: place, status, placeholder: "Select Place of Incorporation", options: PLACES },
    { key: "address", label: "Address", mandatory: true, control: "textarea", value: address, status, placeholder: "Enter your company's registered address" },
  ];
}

/* KYC number fields (Figma 484:26922), index-aligned with the uploads above
   them: GST under the GST certificate, PAN under the PAN card. */
function kycFields(
  gst: { value: string; status: CheckoutField["status"] },
  pan: { value?: string; seedFrom?: string; status: CheckoutField["status"] },
): CheckoutField[] {
  return [
    { key: "gstin", label: "Company GST Number", mandatory: true, control: "text", value: gst.value, status: gst.status, placeholder: "Enter GST Number", maxLength: 15, validate: "gstin", upper: true },
    { key: "pan", label: "Company PAN Card Number", reviewLabel: "Company Pan Card Number", mandatory: true, control: "text", value: pan.value, seedFrom: pan.seedFrom, status: pan.status, placeholder: "Enter PAN Number", maxLength: 10, validate: "pan", upper: true },
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
    supportLabel: "Contact Support",
    supportIconSrc: "/media/checkout/headset.svg",
    cautionIconSrc: "/media/checkout/caution.webp",
    watermarkSrc: "/media/checkout/kolam.svg",
  },
  stepperLabels: { billing: "Billing", company: "Company", kyc: "KYC", review: "Review" },
  stepperAriaLabel: "Checkout progress",
  otherPersonLabel: "Buy in Another Person's Name",
  steps: {
    billing: {
      title: "Billing",
      backLabel: "Back to Quotes",
      banner:
        "These details will be shown on your policy & used for communication. You can purchase the policy in another person's name by selecting the option below.",
      sectionTitle: "Primary Policy Details",
      bannerCompact: true,
      progress: { percent: 35, timeLeft: "4 Mins. Left" },
      otherPerson: "live",
      fields: [
        { key: "fullName", label: "Your Full Name", mandatory: true, hideLabel: true, control: "text", seedFrom: "fullName", status: "verified", placeholder: "Full Name" },
        { key: "companyName", label: "Company Name", mandatory: true, hideLabel: true, control: "text", seedFrom: "companyName", status: "verified", placeholder: "Company Name", keepForOtherPerson: true },
        { key: "phone", label: "Your Phone Number", mandatory: true, hideLabel: true, control: "text", seedFrom: "phone", status: "verified", prefix: "+91", placeholder: "0000 000 000", inputMode: "tel", validate: "phone" },
        { key: "email", label: "Your Email Address", mandatory: true, hideLabel: true, control: "text", seedFrom: "email", status: "verified", placeholder: "Email Address", inputMode: "email", validate: "email" },
      ],
    },
    company: {
      title: "Company",
      backLabel: "Back to Billing",
      banner: "These company details will be shown on your policy & used for policy communication.",
      sectionTitle: "Company Registration Details",
      progress: { percent: 42, timeLeft: "3 Mins. Left" },
      otherPerson: "hidden",
      cases: {
        // A: registry match, filled and green.
        A: companyFields("success", "560095", "Bengaluru, Karnataka", "2nd Floor, Pepe Jeans House, 18 Hosur Road, Koramangala, Bengaluru, Karnataka 560095"),
        // B: web guess, orange until the user edits it.
        B: companyFields("fuzzy", "700029", "Kolkata, West Bengal", "1st Floor, 4B Panditia Road, Ballygunge, Kolkata, West Bengal 700029"),
        // C: nothing found, entered by hand.
        C: companyFields("empty", "", "", ""),
      },
    },
    kyc: {
      title: "KYC",
      backLabel: "Back to Company",
      banner: "As per IRDAI guidelines, completing KYC is mandatory to issue your policy.",
      sectionTitle: "KYC Details",
      progress: { percent: 58, timeLeft: "2 Mins. Left" },
      otherPerson: "hidden",
      uploads: [
        { key: "gstinFile", label: "Upload Company GST Certificate - Image or PDF", reviewLabel: "GSTIN Upload", title: "Upload Company GST" },
        { key: "panFile", label: "Upload Company PAN Card - Image or PDF", reviewLabel: "Company Pan Card Upload", title: "Upload Company PAN Card" },
      ],
      cases: {
        A: kycFields({ value: "29AAJCP5565B1Z5", status: "success" }, { value: "AAJCP5565B", status: "success" }),
        // B: the PAN was MCA-confirmed in Business; the GSTIN is a web guess.
        B: kycFields({ value: "19AATFS4271L1ZQ", status: "fuzzy" }, { value: "AATFS4271L", status: "success" }),
        // C: the PAN the user typed in Business; no GSTIN yet.
        C: kycFields({ value: "", status: "empty" }, { seedFrom: "cin", status: "userFilled" }),
      },
    },
    review: {
      title: "Review",
      backLabel: "Back to KYC",
      banner: "Please check your details once more before purchase.",
      sectionTitle: "Details Shown On Policy",
      progress: { percent: 98, timeLeft: "1 Min. Left" },
      otherPerson: "hidden",
      sectionTitles: { billing: "Billing", company: "Company", kyc: "KYC" },
      editLabel: "Edit",
      uploadedLabel: "Uploaded",
      consentText:
        "I confirm these details are correct. The insurer issues my policy using them, so I have checked them carefully.",
      // `{price}` is the chosen quote's total (GST included).
      payLabel: "Pay {price}",
      requestLabel: "Request Quote",
      postCheckoutToast: {
        title: "Post-checkout is next",
        description: "This is where payment or the quote request would continue. We haven't built it yet.",
      },
    },
  },
  upload: {
    hint: "click to browse or drag and drop the file here",
    successTitle: "Successfully Uploaded!",
    successBody: "{file} has been uploaded.",
    failureTitle: "Upload Failed",
    tooLarge: "{file} is larger than 2MB",
    wrongType: "{file} isn't an image or a PDF",
    cancelLabel: "Replace File",
    retryLabel: "Try Again",
    disabledTitle: "Unable to Upload",
    disabledBody: "Please Refresh or Try Again Later",
    maxBytes: 2 * 1024 * 1024,
  },
  summary: {
    title: "Purchase Summary",
    immediateLabel: "Immediate Purchase",
    poweredByLabel: "Powered by BimaNetra",
    productLines: ["Director’s & Officer’s", "Insurance"],
    productIconSrc: "/media/checkout/product-icon.svg",
    priceTitle: "Price Details",
    premiumLabel: "Premium",
    gstLabel: "GST (18%)",
    totalLabel: "Total Cost",
    gstRate: 0.18,
    saveLabel: "Save & Continue",
    badgeSrc: "/media/checkout/badge.webp",
    insurerInfoLabel: "About this insurer",
  },
  disclaimer: {
    title: "Disclaimer",
    toggleLabel: "Show or hide the disclaimer",
    paragraphs: [
      "*The prices shown are estimates. Actual prices may be higher based on your business details and risk factors.",
      "BimaKavach Insurance Broking Pvt. Ltd. | CIN- U66010MP2022PTC059393 | Registered Office - 506, 5th floor, Om Gurudev Plaza, Savitri Empire Scheme No 54, Vijay Nagar, Bhamori, Indore, Madhya Pradesh - 452010 Phone No.- 9036554785 | Email- support@bimakavach.com",
      "BimaKavach is registered as a Direct Broker | Registration No. 901, Registration Code No. IRDAI / DB 985/ 2022, Valid till 25/06/2026, License category- Direct Broker (General)",
      "Visitors are being informed that BimaKavach Insurance Broking Pvt. Ltd. holds the right to share the information submitted by you on the website with Insurers. Product information is genuine and exclusively based on information obtained from insurers.",
    ],
  },
  pincodePlaces: PINCODE_PLACES,
  drawer: { saveLabel: "Save Changes", closeLabel: "Close" },
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
