/** Alerts for clicks the prototype doesn't take anywhere yet. */
export type DemoNoticeKey = "contactSupport" | "findQuote" | "skipPersonalize" | "riskReport" | "notifyReport" | "mailQuotes" | "scheduleCall" | "paymentLink" | "link";

/** `tone: "success"` for a confirmation (green tick) instead of the warning. */
export type DemoNoticeContent = Record<DemoNoticeKey, { title: string; description: string; tone?: "warning" | "success" }>;
