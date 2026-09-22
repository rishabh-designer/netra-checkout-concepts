import { mockQuotesPageContent } from "@/mocks/quotesPage";
import type { QuotesPageContent } from "@/types/quotesPage";

function simulateNetworkDelay(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch all content for the Quotes results page.
 * The single seam to swap for a real backend later — callers never change.
 */
export async function getQuotesPageContent(): Promise<QuotesPageContent> {
  await simulateNetworkDelay();
  return mockQuotesPageContent;
}
