"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

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
}

const QuoteFlowContext = createContext<QuoteFlowStore | null>(null);

/**
 * QuoteFlowProvider — holds the last completed lead-flow result so a separate
 * route (the Quotes page) can render the user's live entries. Mounted in the
 * root layout, it survives client navigations. Usage: wrap {children} once.
 */
export function QuoteFlowProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<QuoteFlowResult | null>(null);
  return (
    <QuoteFlowContext.Provider value={{ result, setResult }}>
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
