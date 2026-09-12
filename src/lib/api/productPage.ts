import { mockProductPageContent } from "@/mocks/productPage";
import type { ProductPageContent } from "@/types/productPage";

function simulateNetworkDelay(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch all content for the D&O product page.
 * The single seam to swap for a real backend later — callers never change.
 */
export async function getProductPageContent(): Promise<ProductPageContent> {
  await simulateNetworkDelay();
  return mockProductPageContent;
}
