"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { useQuoteFlow, type QuoteCaseId } from "@/lib/quote-flow";

/**
 * CaseSync — keeps the flow on the URL's case. A link opened cold (or one
 * for another case than the saved flow) starts that case with its demo
 * company, so /case-b/quotes always shows Case B. Children wait for it.
 * Usage: <CaseSync caseId="B" demoName="Sabyasachi Calcutta LLP">{page}</CaseSync>
 */
export function CaseSync({ caseId, demoName, children }: { caseId: QuoteCaseId; demoName: string; children: ReactNode }) {
  const { result, setResult, hydrated } = useQuoteFlow();
  const matches = result?.caseId === caseId;
  useLayoutEffect(() => {
    if (hydrated && !matches) setResult({ companyName: demoName, caseId, values: {}, reportInterest: "" });
  }, [hydrated, matches, caseId, demoName, setResult]);
  return hydrated && !matches ? null : children;
}
