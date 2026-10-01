import { notFound, redirect } from "next/navigation";
import { getCheckoutContent } from "@/lib/api/checkout";
import { getQuotesPageContent } from "@/lib/api/quotesPage";
import { CheckoutView } from "@/components/features/checkout/CheckoutView";
import type { CheckoutStepId } from "@/types/checkout";

const STEPS: CheckoutStepId[] = ["billing", "verification", "review"];

export function generateStaticParams() {
  return STEPS.map((step) => ({ step }));
}

/**
 * Checkout (Billing → Verification → Review), one URL per step so browser
 * back/forward walk the journey. Server Component: fetches the checkout copy and
 * a fallback quote (the first priced Case C quote, for cold opens), then hands
 * off to the client <CheckoutView>, which reads the chosen quote + flow values.
 */
export default async function CheckoutPage({ params }: { params: Promise<{ caseSlug: string; step: string }> }) {
  const { caseSlug, step } = await params;
  // Company and KYC were their own steps; they're Verification now.
  if (step === "company" || step === "kyc") redirect(`/directors-and-officers-insurance/${caseSlug}/checkout/verification`);
  if (!STEPS.includes(step as CheckoutStepId)) notFound();
  const [content, quotes] = await Promise.all([getCheckoutContent(), getQuotesPageContent()]);
  const fallbackQuote = quotes.feed.quotes.find((q) => q.price) ?? quotes.feed.quotes[0];
  return (
    <CheckoutView
      step={step as CheckoutStepId}
      steps={STEPS}
      basePath={`/directors-and-officers-insurance/${caseSlug}/checkout`}
      quotesHref={`/directors-and-officers-insurance/${caseSlug}/quotes`}
      content={content}
      fallbackQuote={fallbackQuote}
    />
  );
}
