import type { QuoteCardData, QuotePricing, QuotesFeedContent } from "@/types/quotesPage";

/** "₹10 Cr" → 10, "₹50 Lakh" → 0.5 (crores); null if unreadable. */
export function crores(label?: string): number | null {
  if (!label) return null;
  const n = Number(label.replace(/[^\d.]/g, ""));
  if (!n) return null;
  return /lakh/i.test(label) ? n / 100 : n;
}

const rupees = (price: string) => Number(price.replace(/\D/g, ""));
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** The business a quote is priced for. */
export interface PricingInput {
  sumInsured?: string;
  turnover?: string;
}

/**
 * priceQuote — one quote's price for this business: its mock price (set for
 * the reference cover and turnover) scaled by the Sum Insured and the
 * turnover band, rounded. An offer keeps its discount: the struck price is
 * scaled the same way and the offer price stays the same share of it.
 */
export function priceQuote(q: QuoteCardData, input: PricingInput, p: QuotePricing): QuoteCardData {
  if (!q.price) return q;
  const cover = crores(input.sumInsured) ?? p.referenceCrore;
  const factor = Math.pow(cover / p.referenceCrore, p.coverExponent) * (p.turnoverFactors[input.turnover ?? ""] ?? 1);
  const round = (n: number) => Math.max(p.roundTo, Math.round(n / p.roundTo) * p.roundTo);
  if (q.originalPrice) {
    const was = round(rupees(q.originalPrice) * factor);
    const share = rupees(q.price) / rupees(q.originalPrice);
    return { ...q, originalPrice: inr(was), price: inr(round(was * share)) };
  }
  return { ...q, price: inr(round(rupees(q.price) * factor)) };
}

/** A whole feed's quotes (every case, the Gold Quotes too) priced for this business. */
export function priceFeed(feed: QuotesFeedContent, input: PricingInput): QuotesFeedContent {
  const price = (q: QuoteCardData) => priceQuote(q, input, feed.pricing);
  const byCase = <T,>(rec: Partial<Record<string, T>> | undefined, fn: (v: T) => T) =>
    rec && (Object.fromEntries(Object.entries(rec).map(([k, v]) => [k, v && fn(v as T)])) as typeof rec);
  return {
    ...feed,
    quotes: feed.quotes.map(price),
    quotesByCase: byCase(feed.quotesByCase, (list: QuoteCardData[]) => list.map(price)),
    goldQuote: price(feed.goldQuote),
    goldQuoteByCase: byCase(feed.goldQuoteByCase, price),
  };
}
