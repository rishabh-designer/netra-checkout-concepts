"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuotesPageContent } from "@/types/quotesPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { QuotesHeader } from "../QuotesHeader";
import { DetailsPanel } from "../DetailsPanel";
import { QuotesFeed } from "../QuotesFeed";
import styles from "./QuotesView.module.css";

export interface QuotesViewProps {
  content: QuotesPageContent;
}

/**
 * QuotesView — client shell for the Quotes page: slim header + a 2-column body
 * (Your Details + the quote feed). Reads the carried flow result so Your Details
 * shows live entries and the risk-report banner reflects the Yes/No answer; falls
 * back to the mock when visited off-flow. Edit Details reopens the pre-filled flow.
 * Usage: <QuotesView content={content} />
 */
export function QuotesView({ content }: QuotesViewProps) {
  const router = useRouter();
  const { result } = useQuoteFlow();
  const values = result?.values;
  const reportInterest = result?.reportInterest ?? values?.["reportInterest"] ?? "";
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);

  const handleEdit = () => {
    router.push("/directors-and-officers-insurance?edit=1");
  };

  return (
    <div className={styles.page}>
      <QuotesHeader content={content.header} />
      <main className={styles.body}>
        <DetailsPanel
          content={content.detailsPanel}
          values={values}
          onEdit={handleEdit}
          collapsed={detailsCollapsed}
          onToggleCollapse={() => setDetailsCollapsed((v) => !v)}
        />
        <QuotesFeed content={content.feed} reportInterest={reportInterest} collapsed={detailsCollapsed} />
      </main>
    </div>
  );
}
