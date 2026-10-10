import type { QuoteCardData, QuotePolicy, QuotesFeedContent, RiskFit, RiskFitByInsurer } from "@/types/quotesPage";
import type { QuoteCaseId } from "@/lib/quote-flow";

/** A quote's policy with the key lines it meets (its own wording) folded in:
 *  matched lines lead, replacing any same-titled or broader standard line. */
function mergePolicy(policy: QuotePolicy, own: RiskFitByInsurer[string]): QuotePolicy {
  const covTitles = new Set(own.coverages.map((c) => c.title));
  const excDrop = new Set(own.exclusions.flatMap((e) => [e.title, ...(e.replaces ? [e.replaces] : [])]));
  return {
    ...policy,
    coverages: [...own.coverages, ...policy.coverages.filter((c) => !covTitles.has(c.title))],
    exclusions: [...own.exclusions.map(({ title, body }) => ({ title, body })), ...policy.exclusions.filter((e) => !excDrop.has(e.title))],
  };
}

/**
 * withRiskFit — once a business's risk is scored (Cases A and B), every quote
 * is mapped to its key lines: the Gold Quote's first `listLength` coverages
 * and exclusions (the Score tab's lists). Each insurer's matched lines join
 * its policy for this case, and the quote carries which lines it meets (its
 * card chip reads "8/11 Match"; the policy popup ticks them). Case C, or a
 * feed without a Gold policy, comes back unchanged.
 * Usage: const feed = withRiskFit(priced, caseId, 6);
 */
export function withRiskFit(feed: QuotesFeedContent, caseId: QuoteCaseId | undefined, listLength: number): QuotesFeedContent {
  const fits = caseId && feed.riskFitByCase?.[caseId];
  const gold = caseId && (feed.goldQuoteByCase?.[caseId] ?? feed.goldQuote);
  if (!caseId || !fits || !gold?.policy) return feed;
  const keyCov = gold.policy.coverages.slice(0, listLength).map((c) => c.title);
  const keyExc = gold.policy.exclusions.slice(0, listLength).map((e) => e.title);

  const score = (policy: QuotePolicy): RiskFit => {
    const has = (list: { title: string }[], t: string) => list.some((x) => x.title === t);
    const lines = [
      ...keyCov.map((title) => ({ title, kind: "coverage" as const, met: has(policy.coverages, title) })),
      ...keyExc.map((title) => ({ title, kind: "exclusion" as const, met: has(policy.exclusions, title) })),
    ];
    return { met: lines.filter((l) => l.met).length, total: lines.length, lines };
  };
  const fit = (q: QuoteCardData): QuoteCardData => {
    if (!q.policy) return q;
    const own = q.gold ? undefined : fits[q.insurer];
    const policy = own ? mergePolicy(q.policy, own) : q.policy;
    return { ...q, policy, riskFit: score(policy) };
  };

  return {
    ...feed,
    quotesByCase: { ...feed.quotesByCase, [caseId]: (feed.quotesByCase?.[caseId] ?? feed.quotes).map(fit) },
    goldQuote: fit(feed.goldQuote),
    goldQuoteByCase: feed.goldQuoteByCase?.[caseId] ? { ...feed.goldQuoteByCase, [caseId]: fit(feed.goldQuoteByCase[caseId]!) } : feed.goldQuoteByCase,
  };
}
