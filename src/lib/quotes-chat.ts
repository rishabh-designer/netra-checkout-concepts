import type { QuoteCardData, QuotesChatContent } from "@/types/quotesPage";

/** What Ask BimaNetra can see on the Quotes page. */
export interface QuotesChatContext {
  quotes: QuoteCardData[];
  /** The Gold Quote, and whether the customer has revealed it yet. */
  gold?: { quote: QuoteCardData; revealed: boolean };
  company: string;
  sumInsured: string;
  /** Your Details, as shown in the sidebar. */
  details: { label: string; value: string }[];
  phone: string;
}

type Replies = QuotesChatContent["replies"];

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

/** "a, b and c" */
const list = (items: string[], and: string) =>
  items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")}${and}${items[items.length - 1]}`;

const amount = (price?: string) => Number((price ?? "").replace(/[^\d]/g, "")) || 0;

/* Words that name no insurer on their own ("Your Personalised Insurance Quote"). */
const STOP = new Set(["general", "insurance", "company", "your", "personalised", "quote"]);

/* The words someone might use for an insurer: its first word ("hdfc",
   "generali"), plus any "ergo" / "lombard"-style second word. */
const aliasesOf = (insurer: string) => {
  const words = insurer.toLowerCase().split(/\s+/);
  return [insurer.toLowerCase(), words[0], words[1]].filter((w) => w && w.length > 2 && !STOP.has(w));
};

const has = (q: string, re: RegExp) => re.test(q);

/**
 * answerQuotesQuestion — Ask BimaNetra's reply to a typed question, built only
 * from what's on the page (the quotes, the revealed Gold Quote, Your Details).
 * Keyword intents, checked most specific first. It never picks an insurer
 * (IRDAI): "which is best" gets the differences instead.
 */
export function answerQuotesQuestion(question: string, ctx: QuotesChatContext, r: Replies): string {
  const q = question.toLowerCase().replace(/[’']/g, "'").trim();
  const goldShown = ctx.gold?.revealed ? [ctx.gold.quote] : [];
  const all = [...goldShown, ...ctx.quotes];
  const priced = all.filter((x) => x.price);
  const names = (qs: QuoteCardData[]) => list(qs.map((x) => x.insurer), r.and);
  const mentioned = all.filter((x) => aliasesOf(x.insurer).some((a) => q.includes(a)));
  // Dedupe by insurer (the Gold card can share one with a feed card).
  const insurers = mentioned.filter((x, i) => mentioned.findIndex((y) => y.insurer === x.insurer) === i);
  const priceOf = (x: QuoteCardData) => x.price ?? "unpriced";
  const topOf = (x: QuoteCardData) => list((x.policy?.top ?? x.coverages ?? []).slice(0, 2), r.and) || "its standard cover";

  if (has(q, /\b(best|recommend|should i|suggest|better|which one|pick)\b/) && insurers.length < 2) return r.noRecommend;

  if (insurers.length >= 2 || (has(q, /compare|differ|\bvs\b|versus/) && priced.length >= 2)) {
    const [a, b] = insurers.length >= 2 ? insurers : priced;
    return fill(r.compare, { a: a.insurer, b: b.insurer, priceA: priceOf(a), priceB: priceOf(b), topA: topOf(a), topB: topOf(b) });
  }

  if (has(q, /gold/)) {
    if (!ctx.gold) return r.fallback;
    if (!ctx.gold.revealed || !ctx.gold.quote.price) return r.goldLocked;
    return fill(r.goldRevealed, { insurer: ctx.gold.quote.insurer, price: ctx.gold.quote.price, list: topOf(ctx.gold.quote) });
  }

  if (insurers.length === 1) {
    const x = insurers[0];
    if (has(q, /not cover|exclu|doesn't|does not|won't|isn't covered/)) {
      const ex = x.policy?.exclusions.slice(0, 3).map((e) => e.title) ?? [];
      return ex.length ? fill(r.exclusions, { insurer: x.insurer, list: list(ex, r.and) }) : r.fallback;
    }
    if (has(q, /price|premium|cost|how much|₹|rate/))
      return fill(x.price ? r.price : r.priceOffline, { insurer: x.insurer, price: x.price ?? "", sum: ctx.sumInsured });
    const top = x.policy?.top ?? x.coverages ?? [];
    return top.length
      ? fill(r.coverages, { insurer: x.insurer, list: list(top, r.and) })
      : fill(r.priceOffline, { insurer: x.insurer });
  }

  if (has(q, /cheap|lowest|least|minimum|afford|low price|budget/) && priced.length) {
    const low = Math.min(...priced.map((y) => amount(y.price)));
    const tied = priced.filter((y) => amount(y.price) === low);
    return fill(tied.length > 1 ? r.cheapestTied : r.cheapest, { insurer: names(tied), price: tied[0].price!, sum: ctx.sumInsured });
  }
  if (has(q, /expensive|highest|costliest|most/) && priced.length) {
    const high = Math.max(...priced.map((y) => amount(y.price)));
    const tied = priced.filter((y) => amount(y.price) === high);
    return fill(r.priciest, { insurer: names(tied), price: tied[0].price! });
  }
  if (has(q, /immediate|buy (it )?now|right now|instant|online|today/)) {
    const now = all.filter((x) => x.immediate);
    return now.length ? fill(r.immediate, { list: names(now) }) : r.fallback;
  }
  if (has(q, /offline|get quote|no price|unpriced|without (a )?price/)) {
    const off = ctx.quotes.filter((x) => !x.price);
    return off.length ? fill(r.offline, { list: names(off) }) : r.fallback;
  }
  if (has(q, /india only|only india|within india/)) {
    const ind = all.filter((x) => x.territory === "india");
    return ind.length ? fill(r.india, { list: names(ind) }) : r.fallback;
  }
  if (has(q, /worldwide|abroad|international|global|outside india|overseas|countr/)) {
    const ww = all.filter((x) => x.territory === "worldwide");
    return ww.length ? fill(r.worldwide, { list: names(ww) }) : r.fallback;
  }
  if (has(q, /sum insured|how much cover|cover amount|limit|coverage amount/)) return fill(r.sumInsured, { sum: ctx.sumInsured });
  if (has(q, /claims made|claims basis|claims-made/)) return r.claimsBasis;
  if (has(q, /my details|my company|\bpan\b|turnover|business type|about me|details/))
    return fill(r.details, { company: ctx.company, list: list(ctx.details.map((d) => `${d.label.toLowerCase()} ${d.value}`), r.and) });
  if (has(q, /what is d|what's d|d&o|d and o|directors and officers|directors & officers|what does this insurance/)) return r.whatIsDo;
  if (has(q, /how many|number of quotes|count|all (the )?quotes|list/))
    return fill(r.count, { count: String(all.length), list: names(all) });
  if (has(q, /help|call|expert|phone|human|agent|talk to|contact/)) return fill(r.help, { phone: ctx.phone });
  if (has(q, /thank|thanks|great|cool|ok\b|okay/)) return r.thanks;
  if (has(q, /^(hi|hello|hey|namaste)\b/)) return r.greet;
  return r.fallback;
}
