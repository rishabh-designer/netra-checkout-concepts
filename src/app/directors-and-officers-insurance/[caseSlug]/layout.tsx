import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getProductPageContent } from "@/lib/api/productPage";
import { CASE_IDS, caseFromSlug, caseSlug } from "@/lib/case-route";
import { CaseSync } from "@/components/features/CaseSync";

export function generateStaticParams() {
  return CASE_IDS.map((id) => ({ caseSlug: caseSlug(id) }));
}

/**
 * Every page after the landing carries its case in the URL
 * (/directors-and-officers-insurance/case-b/quotes), so any page of any case
 * can be opened straight from a link. <CaseSync> swaps in that case's demo
 * company when the saved flow is for another case (or there is none).
 */
export default async function CaseLayout({ children, params }: { children: ReactNode; params: Promise<{ caseSlug: string }> }) {
  const { caseSlug: slug } = await params;
  const caseId = caseFromSlug(slug);
  if (!caseId) notFound();
  const product = await getProductPageContent();
  const demoName = product.quoteModal.caseMatches.find((m) => m.caseId === caseId)?.canonicalName ?? "";
  return <CaseSync caseId={caseId} demoName={demoName}>{children}</CaseSync>;
}
