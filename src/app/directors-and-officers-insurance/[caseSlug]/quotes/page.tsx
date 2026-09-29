import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { getProductPageContent } from "@/lib/api/productPage";
import { QuotesView } from "@/components/features/quotes/QuotesView";

/**
 * The D&O Live Quotes results page. Server Component: fetches the page content
 * (and the modal content, so Edit Details can open the form in place), then hands
 * off to the client <QuotesView>, which merges the carried flow result (live
 * entries + Yes/No answer) over the mock.
 */
export default async function QuotesPage() {
  const [content, product] = await Promise.all([getQuotesPageContent(), getProductPageContent()]);
  return <QuotesView content={content} quoteModal={product.quoteModal} />;
}
