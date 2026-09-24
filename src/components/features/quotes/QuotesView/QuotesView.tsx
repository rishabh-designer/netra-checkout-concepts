"use client";

import { useState } from "react";
import type { QuotesPageContent } from "@/types/quotesPage";
import type { QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { QuoteModal } from "@/components/features/quote-modal/QuoteModal";
import { QuotesHeader } from "../QuotesHeader";
import { DetailsPanel } from "../DetailsPanel";
import { QuotesFeed } from "../QuotesFeed";
import styles from "./QuotesView.module.css";

export interface QuotesViewProps {
  content: QuotesPageContent;
  /** Modal content (steps/fields) so Edit Details can open the form in place. */
  quoteModal: QuoteModalContent;
}

/**
 * QuotesView — client shell for the Quotes page: slim header + a 2-column body
 * (Your Details + the quote feed). Reads the carried flow result so Your Details
 * shows live entries and the risk-report banner reflects the Yes/No answer; falls
 * back to the mock when visited off-flow. Edit Details opens the quote form as a
 * form-only lightbox on this page (no navigation) and saves back to the store.
 * Usage: <QuotesView content={content} quoteModal={quoteModal} />
 */
export function QuotesView({ content, quoteModal }: QuotesViewProps) {
  const { result, setResult } = useQuoteFlow();
  const values = result?.values;
  const reportInterest = result?.reportInterest ?? values?.["reportInterest"] ?? "";
  const caseId = result?.caseId;
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className={styles.page}>
      <QuotesHeader content={content.header} />
      <main className={styles.body}>
        <DetailsPanel
          content={content.detailsPanel}
          values={values}
          onEdit={() => setEditOpen(true)}
          collapsed={detailsCollapsed}
          onToggleCollapse={() => setDetailsCollapsed((v) => !v)}
        />
        <QuotesFeed
          content={content.feed}
          reportInterest={reportInterest}
          collapsed={detailsCollapsed}
          caseId={caseId}
        />
      </main>

      {/* Edit Details — the quote form only (no AI-search column), prefilled. */}
      <QuoteModal
        open={editOpen}
        formOnly
        content={quoteModal}
        caseId={caseId ?? "C"}
        companyName={result?.companyName ?? ""}
        initialValues={values}
        onClose={() => setEditOpen(false)}
        onComplete={(next) => {
          setResult({
            companyName: result?.companyName ?? "",
            caseId: caseId ?? "C",
            values: next,
            reportInterest: next["reportInterest"] ?? "",
          });
          setEditOpen(false);
        }}
      />
    </div>
  );
}
