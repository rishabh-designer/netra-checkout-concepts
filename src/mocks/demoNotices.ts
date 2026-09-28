import type { DemoNoticeContent } from "@/types/demoNotice";

/** What a not-yet-built click would do, shown as a top-right alert. */
export const mockDemoNotices: DemoNoticeContent = {
  askBimaNetra: {
    title: "Ask BimaNetra is next",
    description: "This opens a chat with BimaNetra about your quotes and cover. We haven't built it yet.",
  },
  contactSupport: {
    title: "Contact Support is next",
    description: "This connects you to an expert, on call or chat. For now, reach us on +91-90072-96854.",
  },
  findQuote: {
    title: "Find a Quote is next",
    description: "This starts a quote for this product, prefilled with your business details. We haven't built it yet.",
  },
  skipPersonalize: {
    title: "Skip is next",
    description: "This skips personalization and shows standard quotes straight away. We haven't built it yet.",
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
