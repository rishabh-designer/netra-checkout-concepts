"use client";

import { useParams } from "next/navigation";
import { useQuoteFlow } from "@/lib/quote-flow";
import { caseFromSlug, withCase } from "@/lib/case-route";

/** `href(path)`: a product link inside the current case (from the URL, else the flow). */
export function useCaseHref() {
  const params = useParams<{ caseSlug?: string }>();
  const { result } = useQuoteFlow();
  const id = caseFromSlug(params?.caseSlug) ?? result?.caseId;
  return (href: string) => withCase(href, id);
}
