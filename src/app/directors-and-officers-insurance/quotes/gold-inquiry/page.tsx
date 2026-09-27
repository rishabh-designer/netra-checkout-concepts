import { getGoldInquiryContent } from "@/lib/api/goldInquiry";
import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { GoldInquiryView } from "@/components/features/gold-inquiry/GoldInquiryView";

/**
 * The Gold Inquiry page (after "Unlock Price" on Case B's Gold Quote).
 * Server Component: fetches its copy and the Quotes page content (header and
 * the other quotes), then hands off to the client <GoldInquiryView>.
 */
export default async function GoldInquiryPage() {
  const [content, quotes] = await Promise.all([getGoldInquiryContent(), getQuotesPageContent()]);
  return (
    <GoldInquiryView
      content={content}
      header={quotes.header}
      feed={quotes.feed}
      quotesHref="/directors-and-officers-insurance/quotes"
    />
  );
}
