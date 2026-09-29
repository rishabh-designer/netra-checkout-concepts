"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useCaseHref } from "@/lib/use-case-href";
import { priceFeed } from "@/lib/pricing";
import { useDemoNotice } from "@/lib/demo-notice";
import { GOLD_DETAILS_KEY, useQuoteFlow } from "@/lib/quote-flow";
import { resetCheckoutClock } from "@/components/features/checkout/useCheckoutClock";
import { BreadcrumbTrail } from "@/components/ui/BreadcrumbTrail";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { QuotesHeader } from "@/components/features/quotes/QuotesHeader";
import { QuoteCard, type QuoteCardLabels } from "@/components/features/quotes/QuoteCard";
import { AdditionalDetailsDrawer } from "@/components/features/quotes/GoldGate";
import type { GoldInquiryContent } from "@/types/goldInquiry";
import type { QuoteCardData, QuotesFeedContent, QuotesHeaderContent } from "@/types/quotesPage";
import { BackButton } from "@/components/ui/BackButton";
import styles from "./GoldInquiryView.module.css";

export interface GoldInquiryViewProps {
  content: GoldInquiryContent;
  header: QuotesHeaderContent;
  /** The Quotes feed: the case's other quotes and their card labels. */
  feed: QuotesFeedContent;
  quotesHref: string;
  /** "gold" (Case B's Gold Quote, the default) or "quote": an offline
   *  quote's Get Quote, a quote request to the insurer the user picked. */
  variant?: "gold" | "quote";
}

const Arrow = () => (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Chevron = ({ flip = false, size = 16 }: { flip?: boolean; size?: number }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M5.5 3 10.5 8l-5 5" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Were Case B's Additional Details sent (Unlock Quote), or skipped for a call? */
const readDetailsSent = () => {
  try {
    return window.sessionStorage.getItem(GOLD_DETAILS_KEY) !== null;
  } catch {
    return false;
  }
};
const noSubscribe = () => () => {};

/**
 * GoldInquiryView — the page after "Unlock Price" (Figma 642:30248). Case B's
 * Gold Quote can't be priced online yet, so the details are saved and an
 * expert calls to finish it: a thank-you card (what happens next, a questions
 * pill, the inquiry summary: Risk Report in progress, Additional Details
 * missing or verifying), the case's other
 * quotes in a scrolling row (Immediate Purchase ones still check out), and a side column
 * with Need Help contacts and a Rate Your Experience card.
 * Usage: <GoldInquiryView content={c} header={q.header} feed={q.feed} quotesHref="/…/quotes" />
 */
export function GoldInquiryView({ content, header, feed: baseFeed, quotesHref, variant = "gold" }: GoldInquiryViewProps) {
  const { result, selectedQuote, setSelectedQuote, setCheckout } = useQuoteFlow();
  const router = useRouter();
  const href = useCaseHref();
  const notify = useDemoNotice();
  const caseId = result?.caseId;
  const sumInsured = result?.values?.["coverage"] || undefined;
  // Priced for this business, as on the Quotes page.
  const feed = priceFeed(baseFeed, { sumInsured, turnover: result?.values?.["turnover"] });
  const detailsSent = useSyncExternalStore(noSubscribe, readDetailsSent, () => false);

  const allQuotes = ((caseId && feed.quotesByCase?.[caseId]) ?? feed.quotes).map((q) => (sumInsured ? { ...q, sumInsured } : q));
  // Quote request: the offline insurer picked on the Quotes page (else the
  // first offline one); it drops out of Other Quotes.
  const isRequest = variant === "quote";
  const onSale = (q: QuoteCardData) => !!q.immediate;
  const requested = isRequest ? (selectedQuote && !onSale(selectedQuote) ? selectedQuote : allQuotes.find((q) => !onSale(q))) : undefined;
  const quotes = requested ? allQuotes.filter((q) => q.insurer !== requested.insurer) : allQuotes;
  const fill = (text: string) => text.replace("{insurer}", requested?.insurer ?? "").replace("{price}", requested?.price ?? "");
  const labels: QuoteCardLabels = {
    sumInsured: feed.sumInsuredLabel,
    getQuote: feed.getQuoteLabel,
    compare: feed.compareLabel,
    comparisonUnavailable: feed.comparisonUnavailableLabel,
    immediatePurchase: feed.immediatePurchaseLabel,
    territory: feed.territoryLabels,
    tips: feed.cardTips,
    poweredBy: feed.poweredByLabel,
    topCoverages: feed.topCoveragesLabel,
    viewCoverages: feed.viewCoveragesLabel,
    coverageCount: feed.coverageCountLabel,
    personalizedCount: feed.personalizedCountLabel,
  };
  // Immediate Purchase quotes still check out from here; every other
  // insurer asks the underwriting questions, then requests the quote.
  const [requestFor, setRequestFor] = useState<QuoteCardData | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const checkoutFor = (q: QuoteCardData) =>
    onSale(q)
      ? () => {
          setSelectedQuote(q);
          setCheckout({});
          resetCheckoutClock();
          router.push(href(feed.checkoutHref));
        }
      : () => {
          setRequestFor(q);
          setRequestOpen(true);
        };
  const sendRequest = () => {
    if (!requestFor) return;
    setSelectedQuote(requestFor);
    setRequestOpen(false);
    router.push(href(feed.quoteInquiryHref));
  };

  // Other Quotes: the arrows page the row by one card.
  const rowRef = useRef<HTMLDivElement>(null);
  // Each arrow greys out at its end of the row.
  // "Showing N of M" counts up to the last card fully in view.
  const [ends, setEnds] = useState({ start: true, end: false, shown: 0 });
  const syncEnds = () => {
    const row = rowRef.current;
    if (!row) return;
    const right = row.getBoundingClientRect().right;
    const cells = Array.from(row.children) as HTMLElement[];
    const shown = cells.filter((c) => c.getBoundingClientRect().right <= right + 1).length;
    setEnds({ start: row.scrollLeft <= 1, end: row.scrollLeft + row.clientWidth >= row.scrollWidth - 1, shown });
  };
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(syncEnds);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  const page = (dir: 1 | -1) => {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (row && card) row.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
  };

  const [rating, setRating] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [before, after = ""] = content.questions.text.split("{email}");
  const { inquiry, quoteRequest } = content;
  const crumbs = content.breadcrumb.map((b) => (b.href ? { ...b, href: href(b.href) } : b));
  const breadcrumb = isRequest
    ? crumbs.map((b, i, all) => (i === all.length - 1 ? { label: quoteRequest.breadcrumbCurrent } : b))
    : crumbs;
  const steps = isRequest ? (requested?.price ? quoteRequest.pricedSteps : quoteRequest.steps).map(fill) : content.steps;

  return (
    <div className={styles.page}>
      <QuotesHeader
        content={{ ...header, ctaLabel: content.headerCtaLabel }}
        onCta={() => window.location.assign(content.expertHref)}
        icon={<Arrow />}
        iconAfter
      />
      <div className={styles.body}>
        <main className={styles.main}>
          {/* Thank-you card (642:32710) */}
          <section className={styles.thanks}>
            <div className={styles.topRow}>
              <BackButton href={quotesHref}>{content.backLabel}</BackButton>
              <BreadcrumbTrail items={breadcrumb} variant="slash" />
            </div>

            <div className={styles.content}>
              <div className={styles.rule}>
                <IkkatDivider unit={32} height={4} />
              </div>
              <div className={styles.titleBlock}>
                <h1 className={styles.title}>{isRequest ? quoteRequest.title : content.title}</h1>
                <p className={styles.intro}>{content.intro}</p>
              </div>
              <div className={styles.inquiryHead} data-variant={isRequest ? "quote" : undefined}>
                <h2 className={styles.inquiryTitle}>{isRequest ? quoteRequest.inquiryTitle : inquiry.title}</h2>
                {/* A priced request (e.g. Royal Sundaram) only waits on payment. */}
                {isRequest && requested?.price ? (
                  <button type="button" className={styles.expert} onClick={() => notify("paymentLink")}>
                    {quoteRequest.paymentLinkLabel}
                    <Arrow />
                  </button>
                ) : (
                  <a href={content.expertHref} className={styles.expert}>
                    {inquiry.ctaLabel}
                    <Arrow />
                  </a>
                )}
              </div>
              <ul className={styles.steps}>
                {steps.map((step) => (
                  <li key={step} className={styles.step}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={content.tickSrc} alt="" aria-hidden className={styles.tick} />
                    {step}
                  </li>
                ))}
              </ul>
              <a href={`mailto:${content.questions.email}`} className={styles.questions}>
                <span>
                  {before}
                  <span className={styles.email}>{content.questions.email}</span>
                  {after}
                </span>
                <Chevron />
              </a>

              <dl className={styles.stats}>
                {requested && (
                  <div className={styles.stat}>
                    <dt className={styles.statLabel}>{quoteRequest.insurerLabel}</dt>
                    <dd className={styles.statValue}>{requested.insurer}</dd>
                  </div>
                )}
                <div className={styles.stat}>
                  <dt className={styles.statLabel}>{inquiry.policyLabel}</dt>
                  <dd className={styles.statValue}>{inquiry.policyValue}</dd>
                </div>
                <div className={styles.stat}>
                  <dt className={styles.statLabel}>{inquiry.sumInsuredLabel}</dt>
                  <dd className={styles.statValue}>{sumInsured ?? quotes[0]?.sumInsured}</dd>
                </div>
                {isRequest ? (
                  <>
                    {requested?.price && (
                      <div className={styles.stat}>
                        <dt className={styles.statLabel}>{quoteRequest.priceLabel}</dt>
                        <dd className={styles.statValue}>{requested.price}</dd>
                      </div>
                    )}
                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>{quoteRequest.statusLabel}</dt>
                      <dd className={styles.statPending}>{quoteRequest.statusValue}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>{inquiry.riskReportLabel}</dt>
                      <dd className={styles.statValue}>{inquiry.riskReportValue}</dd>
                    </div>
                    <div className={styles.stat}>
                      <dt className={styles.statLabel}>{inquiry.detailsLabel}</dt>
                      <dd className={styles.statPending}>{detailsSent ? inquiry.detailsVerifying : inquiry.detailsMissing}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </section>

          {/* Other Quotes for This Policy (642:32815) */}
          <section className={styles.others}>
            <div className={styles.othersHead}>
              <h2 className={styles.othersTitle}>{content.otherQuotes.title}</h2>
              <div className={styles.nav}>
                <p className={styles.showing}>
                  {content.otherQuotes.showing.replace("{total}", String(quotes.length))}
                </p>
                <button type="button" className={styles.navBtn} onClick={() => page(-1)} disabled={ends.start} aria-label={content.otherQuotes.prevLabel} data-tooltip={content.otherQuotes.prevLabel}>
                  <Chevron flip size={12} />
                </button>
                <button type="button" className={styles.navBtn} onClick={() => page(1)} disabled={ends.end} aria-label={content.otherQuotes.nextLabel} data-tooltip={content.otherQuotes.nextLabel}>
                  <Chevron size={12} />
                </button>
              </div>
            </div>
            <div ref={rowRef} className={styles.row} onScroll={syncEnds}>
              {quotes.map((q) => (
                <div key={q.insurer} className={styles.cell}>
                  <QuoteCard mini quote={q} labels={labels} onSelect={checkoutFor(q)} />
                </div>
              ))}
            </div>
          </section>
        </main>
        <AdditionalDetailsDrawer open={requestOpen} content={feed.quoteRequestDrawer} onClose={() => setRequestOpen(false)} onProceed={sendRequest} priced={!!requestFor?.price} />

        <aside className={styles.aside}>
          {/* Need Help (642:32448) */}
          <div className={styles.help}>
            <div className={styles.helpTop}>
              <div className={styles.helpText}>
                <p className={styles.helpTitle}>{content.needHelp.title}</p>
                <p className={styles.helpSub}>{content.needHelp.subtitle}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.needHelp.avatarsSrc} alt={content.needHelp.avatarsAlt} className={styles.avatars} />
            </div>
            <hr className={styles.helpRule} />
            <div className={styles.contacts}>
              {content.needHelp.contacts.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className={c.primary ? styles.contactPrimary : styles.contact}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {c.label}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.iconSrc} alt="" aria-hidden width={12} height={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Rate Your Experience (642:32530) */}
          {/* Once sent: the badge turns a lap and the payment-success green
              beam runs round the card. */}
          <div className={styles.rateWrap}>
          {sent && (
            <span className={styles.beamGlow} aria-hidden>
              <span className={styles.beamSpin} />
            </span>
          )}
          <div className={styles.rate} data-sent={sent || undefined}>
            <div className={styles.rateTop}>
              <div className={styles.rateText}>
                <p className={styles.rateTitle}>{content.rate.title}</p>
                <p className={styles.rateSub}>{content.rate.subtitle}</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.rate.badgeSrc} alt="" aria-hidden width={56} height={56} className={styles.rateBadge} />
            </div>
            {sent ? (
              <p className={styles.rateThanks}>{content.rate.thanks}</p>
            ) : (
              <>
                <div className={styles.options} role="radiogroup" aria-label={content.rate.title}>
                  {content.rate.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={rating === o}
                      className={styles.option}
                      data-on={rating === o || undefined}
                      onClick={() => setRating(o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                <hr className={styles.rateRule} />
                <button type="button" className={styles.submit} disabled={!rating} data-tooltip={rating ? undefined : content.rate.submitBlockedTip} onClick={() => setSent(true)}>
                  {content.rate.submitLabel}
                </button>
              </>
            )}
            {sent && (
              <span className={styles.beamRing} aria-hidden>
                <span className={styles.beamSpin} />
              </span>
            )}
          </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
