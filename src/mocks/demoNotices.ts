import type { DemoNoticeContent } from "@/types/demoNotice";

/** What a not-yet-built click would do, shown as a top-right alert. */
export const mockDemoNotices: DemoNoticeContent = {
  scheduleCall: {
    title: "Schedule a Call is next",
    description: "Google Meet API to plug in and set the meeting!",
  },
  paymentLink: {
    title: "Payment link requested",
    description: "An IRDAI-certified Bima Expert will reach out to you shortly.",
  },
  mailQuotes: {
    title: "Mail Quotes is next",
    description: "This emails the quotes you're comparing to you, side by side. We haven't built it yet.",
  },
  notifyReport: {
    title: "You're on the list",
    description: "We'll contact you once our report is ready, so we can price your risk better.",
  },
  contactSupport: {
    title: "Speak to an Expert is next",
    description: "This connects you to an expert, on call or chat. For now, reach us on +91-90072-96854.",
  },
  findQuote: {
    title: "Get a Quote is next",
    description: "This starts a quote for this product, prefilled with your business details. We haven't built it yet.",
  },
  skipPersonalize: {
    title: "Skip is next",
    description: "This skips personalisation and shows standard quotes straight away. We haven't built it yet.",
  },
  riskReport: {
    title: "Your Risk Report is next",
    description: "This downloads the BimaNetra Risk Report on your business as a PDF. We haven't built it yet.",
  },
  link: {
    title: "This page is next",
    description: "This link goes to a page we haven't built yet.",
  },
};
