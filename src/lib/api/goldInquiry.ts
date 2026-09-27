import { mockGoldInquiryContent } from "@/mocks/goldInquiry";
import type { GoldInquiryContent } from "@/types/goldInquiry";

function simulateNetworkDelay(ms = 40): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch the copy for the Gold Inquiry page (after "Unlock Price").
 * The single seam to swap for a real backend later — callers never change.
 */
export async function getGoldInquiryContent(): Promise<GoldInquiryContent> {
  await simulateNetworkDelay();
  return mockGoldInquiryContent;
}
