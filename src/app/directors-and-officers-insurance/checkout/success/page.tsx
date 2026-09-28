import { getCheckoutContent } from "@/lib/api/checkout";
import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { SuccessView } from "@/components/features/checkout/SuccessView";

/**
 * Checkout (Success): the end of the journey, after Pay on Review. Server
 * Component: fetches the checkout copy and a fallback quote (for direct
 * opens), then hands off to the client <SuccessView>, which reads the paid
 * quote, the order and the flow values.
 */
export default async function CheckoutSuccessPage() {
  const [content, quotes] = await Promise.all([getCheckoutContent(), getQuotesPageContent()]);
  const fallbackQuote = quotes.feed.quotes.find((q) => q.price) ?? quotes.feed.quotes[0];
  return <SuccessView content={content} quotesHref="/directors-and-officers-insurance/quotes" fallbackQuote={fallbackQuote} />;
}
