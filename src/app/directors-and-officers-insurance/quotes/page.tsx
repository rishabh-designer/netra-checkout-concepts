import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { QuotesView } from "@/components/features/quotes/QuotesView";

/**
 * The D&O Live Quotes results page. Server Component: fetches the page content
 * once, then hands off to the client <QuotesView>, which merges the carried
 * flow result (live entries + Yes/No answer) over the mock.
 */
export default async function QuotesPage() {
  const content = await getQuotesPageContent();
  return <QuotesView content={content} />;
}
