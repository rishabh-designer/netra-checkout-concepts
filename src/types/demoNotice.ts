/** Alerts for clicks the prototype doesn't take anywhere yet. */
export type DemoNoticeKey = "contactSupport" | "findQuote" | "skipPersonalize" | "riskReport" | "notifyReport" | "mailQuotes" | "scheduleCall" | "link";

export type DemoNoticeContent = Record<DemoNoticeKey, { title: string; description: string }>;
