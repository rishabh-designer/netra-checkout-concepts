/** Alerts for clicks the prototype doesn't take anywhere yet. */
export type DemoNoticeKey = "askBimaNetra" | "contactSupport" | "findQuote" | "skipPersonalize" | "riskReport" | "link";

export type DemoNoticeContent = Record<DemoNoticeKey, { title: string; description: string }>;
