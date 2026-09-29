import type { QuotesPreview } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";
import { QuotesHeader } from "../QuotesHeader";
import { QuotesSkeleton } from "../QuotesSkeleton";
import viewStyles from "../QuotesView/QuotesView.module.css";

export interface QuotesBackdropProps {
  preview: QuotesPreview;
  caseId: QuoteCaseId;
}

/**
 * QuotesBackdrop — the Quotes page (header + loading skeleton) drawn behind the
 * quote modal's lightbox, so results read as being prepared while the user
 * answers. Same geometry as the real page, so the later hand-off is seamless.
 * On mobile (≤1100) Your Details is drawn shut, as the page opens.
 * Usage: <QuoteModal backdrop={<QuotesBackdrop preview={p} caseId="B" />} … />
 */
export function QuotesBackdrop({ preview, caseId }: QuotesBackdropProps) {
  // Only rendered while the modal is up (client-side), so matchMedia is safe.
  const collapsed = typeof window !== "undefined" && window.matchMedia("(max-width: 1100px)").matches;
  return (
    <div className={viewStyles.page}>
      <QuotesHeader content={preview.header} />
      <main className={viewStyles.body}>
        <QuotesSkeleton cardCount={preview.cardCounts[caseId]} rowCount={preview.rowCount} collapsed={collapsed} />
      </main>
    </div>
  );
}
