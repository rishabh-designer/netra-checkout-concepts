import type { QuoteCaseId } from "@/lib/quote-flow";

/** The product's root; every page after the landing sits under a case. */
export const PRODUCT_BASE = "/directors-and-officers-insurance";
export const CASE_IDS: QuoteCaseId[] = ["A", "B", "C"];

/** "B" → "case-b" (the URL segment). */
export const caseSlug = (id: QuoteCaseId) => `case-${id.toLowerCase()}`;

/** "case-b" → "B"; anything else → undefined. */
export function caseFromSlug(slug: string | undefined): QuoteCaseId | undefined {
  const m = /^case-([abc])$/.exec(slug ?? "");
  return m ? (m[1].toUpperCase() as QuoteCaseId) : undefined;
}

/**
 * Puts the case into a product link: "/directors-and-officers-insurance/quotes"
 * → "/directors-and-officers-insurance/case-b/quotes" (quotes and checkout
 * pages only; the landing and outside links pass through).
 */
export function withCase(href: string, id: QuoteCaseId | undefined): string {
  if (!id) return href;
  return href.replace(/^\/directors-and-officers-insurance\/(quotes|checkout)(?=\/|$|\?)/, `${PRODUCT_BASE}/${caseSlug(id)}/$1`);
}
