"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
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
  /** The saved flow has been read back (client only). Views that seed state
   *  from the flow wait for this, so a reload never flashes demo data. */
  hydrated: boolean;
}

interface Saved {
  result: QuoteFlowResult | null;
  selectedQuote: QuoteCardData | null;
  checkout: Record<string, string>;
}

const STORAGE_KEY = "bimanetra.flow";

function readSaved(): Saved | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

const QuoteFlowContext = createContext<QuoteFlowStore | null>(null);

/**
 * QuoteFlowProvider — holds the last completed lead-flow result, the quote the
 * user chose to buy and their checkout entries, so separate routes (Quotes,
 * Checkout) can render live data. Mounted in the root layout; it also saves to
 * sessionStorage, so a reload in the same tab keeps the customer's details.
 * Usage: wrap {children} once.
 */
export function QuoteFlowProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<QuoteFlowResult | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteCardData | null>(null);
  const [checkout, setCheckout] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  // Read the saved flow back before the first paint (a layout effect), so the
  // restored details replace the server render without a visible swap.
  useLayoutEffect(() => {
    const saved = readSaved();
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from storage */
    if (saved) {
      setResult(saved.result);
      setSelectedQuote(saved.selectedQuote);
      setCheckout(saved.checkout ?? {});
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ result, selectedQuote, checkout } satisfies Saved));
    } catch {
      /* storage unavailable (private mode): the flow just won't survive a reload */
    }
  }, [hydrated, result, selectedQuote, checkout]);

  return (
    <QuoteFlowContext.Provider value={{ result, setResult, selectedQuote, setSelectedQuote, checkout, setCheckout, hydrated }}>
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
