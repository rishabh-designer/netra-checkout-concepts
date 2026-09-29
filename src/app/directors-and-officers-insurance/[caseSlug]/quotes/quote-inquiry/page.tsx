import { getGoldInquiryContent } from "@/lib/api/goldInquiry";
import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { GoldInquiryView } from "@/components/features/gold-inquiry/GoldInquiryView";

/**
 * The Quote Request page (an offline quote's Get Quote): the Gold Inquiry
 * layout in its "quote" variant, for the insurer picked on the Quotes page.
 * Server Component: fetches its copy and the Quotes page content, then hands
 * off to the client <GoldInquiryView>.
 */
export default async function QuoteInquiryPage({ params }: { params: Promise<{ caseSlug: string }> }) {
  const { caseSlug } = await params;
  const [content, quotes] = await Promise.all([getGoldInquiryContent(), getQuotesPageContent()]);
  return (
    <GoldInquiryView
      variant="quote"
      content={content}
      header={quotes.header}
      feed={quotes.feed}
      quotesHref={`/directors-and-officers-insurance/${caseSlug}/quotes`}
    />
  );
}
