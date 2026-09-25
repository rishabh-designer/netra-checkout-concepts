"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { QuoteCardData } from "@/types/quotesPage";

/** The A/B/C outcome resolved from the typed company name. */
export type QuoteCaseId = "A" | "B" | "C";

/** The result of one completed lead flow, carried onto the Quotes page. */
export interface QuoteFlowResult {
  companyName: string;
  caseId: QuoteCaseId;
  /** The collected field map from the modal (name, type, business, …, reportInterest). */
  values: Record<string, string>;
  /** The Risk-Report Yes/No answer ("Yes" | "No" | ""). */
  reportInterest: string;
}

interface QuoteFlowStore {
  result: QuoteFlowResult | null;
  setResult: (result: QuoteFlowResult | null) => void;
  /** The quote card whose price button started checkout. */
  selectedQuote: QuoteCardData | null;
  setSelectedQuote: (quote: QuoteCardData | null) => void;
  /** Checkout entries by field key (billing, company, KYC and upload names). */
  checkout: Record<string, string>;
  setCheckout: (values: Record<string, string>) => void;
}

const QuoteFlowContext = createContext<QuoteFlowStore | null>(null);

/**
 * QuoteFlowProvider — holds the last completed lead-flow result, the quote the
 * user chose to buy and their checkout entries, so separate routes (Quotes,
 * Checkout) can render live data. Mounted in the root layout, it survives client
 * navigations (not reloads). Usage: wrap {children} once.
 */
export function QuoteFlowProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<QuoteFlowResult | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteCardData | null>(null);
  const [checkout, setCheckout] = useState<Record<string, string>>({});
  return (
    <QuoteFlowContext.Provider value={{ result, setResult, selectedQuote, setSelectedQuote, checkout, setCheckout }}>
      {children}
    </QuoteFlowContext.Provider>
  );
}

/** Read/write the carried flow result. Falls back to a null result off-flow. */
export function useQuoteFlow(): QuoteFlowStore {
  const ctx = useContext(QuoteFlowContext);
  if (!ctx) throw new Error("useQuoteFlow must be used within a QuoteFlowProvider");
  return ctx;
}
