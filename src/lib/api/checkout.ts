import { mockCheckoutContent } from "@/mocks/checkout";
import type { CheckoutContent } from "@/types/checkout";

function simulateNetworkDelay(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch all content for the checkout journey (Billing → Company → KYC → Review).
 * The single seam to swap for a real backend later.
 */
export async function getCheckoutContent(): Promise<CheckoutContent> {
  await simulateNetworkDelay();
  return mockCheckoutContent;
}
