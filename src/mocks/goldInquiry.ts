import type { GoldInquiryContent } from "@/types/goldInquiry";

const EXPERT_PHONE = "tel:+919007296854";

/** Fixture for the Gold Inquiry page (Figma 642:30248). */
export const mockGoldInquiryContent: GoldInquiryContent = {
  headerCtaLabel: "Speak to an Expert",
  expertHref: EXPERT_PHONE,
  backLabel: "Back to Quotes",
  breadcrumb: [
    { label: "HOME", href: "/directors-and-officers-insurance" },
    { label: "DIRECTORS & OFFICERS INSURANCE", href: "/directors-and-officers-insurance" },
    { label: "LIVE QUOTES", href: "/directors-and-officers-insurance/quotes" },
    { label: "UNLOCK GOLD QUOTE" },
  ],
  title: "Gold Quote Selected! Sit Back While We Call You.",
  intro: "Thanks. We have saved your interest. Here is what is next:",
  steps: [
    "Your quote will be locked for 45 days",
    "We will finalise your quote with the insurance company",
    "Our IRDAI-certified expert will call you to complete your purchase",
  ],
  tickSrc: "/media/gold-inquiry/ticker.svg",
  questions: { text: "Have questions? Reach out to us on {email}", email: "quotes@bimakavach.com" },
  inquiry: {
    title: "Your Gold Quote Inquiry",
    ctaLabel: "Speak to an Expert",
    policyLabel: "Insurance Policy",
    policyValue: "Directors & Officers Insurance",
    sumInsuredLabel: "Sum Insured",
    riskReportLabel: "Risk Report",
    riskReportValue: "In Progress",
    detailsLabel: "Additional Details",
    detailsMissing: "Missing",
    detailsVerifying: "Verifying",
  },
  otherQuotes: { title: "{total} Alternative Quotes for This Policy", prevLabel: "Previous quotes", nextLabel: "More quotes" },
  needHelp: {
    title: "Need Help?",
    subtitle: "For any assistance, contact our IRDAI-certified experts",
    avatarsSrc: "/media/experts/avatars.webp",
    avatarsAlt: "BimaKavach insurance experts",
    contacts: [
      { label: "Mail us", href: "mailto:quotes@bimakavach.com", iconSrc: "/media/gold-inquiry/mail.svg" },
      { label: "WhatsApp Us", href: "https://wa.me/919007296854", iconSrc: "/media/gold-inquiry/whatsapp.svg" },
      { label: "Schedule a Call", href: EXPERT_PHONE, iconSrc: "/media/gold-inquiry/call.svg", primary: true },
    ],
  },
  quoteRequest: {
    breadcrumbCurrent: "REQUEST QUOTE",
    title: "Quote Requested! Sit Back While We Call You.",
    steps: [
      "We will ask {insurer} for your price",
      "Our IRDAI-certified expert will call you with the quote",
      "Once it is in, your quote will be locked for 45 days",
    ],
    pricedSteps: [
      "{insurer} has priced your cover at {price}",
      "Our IRDAI-certified expert will call you to finish the insurer's checks",
      "Once they're done, your quote will be locked for 45 days",
    ],
    priceLabel: "Quoted Price",
    inquiryTitle: "Your Quote Request",
    paymentLinkLabel: "Request Payment Link",
    insurerLabel: "Insurer",
    statusLabel: "Quote Status",
    statusValue: "Requested",
  },
  rate: {
    title: "Rate Your Experience",
    subtitle: "Your rating will help us do better",
    badgeSrc: "/media/gold-inquiry/rate-badge.png",
    options: ["☹️ Bad", "🙂 Fine", "😀 Good"],
    submitLabel: "Submit Feedback",
    submitBlockedTip: "Pick a rating first",
    thanks: "Thanks! Your feedback helps us do better.",
  },
};
