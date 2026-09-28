"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import type { CheckoutContent } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { useDemoNotice } from "@/lib/demo-notice";
import { formatInr, splitPrice } from "@/lib/checkout";
import { QuotesHeader } from "@/components/features/quotes/QuotesHeader";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { EyeIcon, type EyeIconHandle } from "@/components/icons/EyeIcon";
import { DitherBurst } from "@/components/ui/DitherBurst";
import { Toast } from "@/components/ui/Toast";
import { useCheckoutClock } from "../useCheckoutClock";
import { PurchaseSummary } from "../PurchaseSummary";
import { Disclaimer } from "../Disclaimer";
import { SuccessTimeline, type SuccessTimelineItem } from "../SuccessTimeline";
import { SuccessSkeleton } from "../SuccessSkeleton";
import { RmCard, Suggestions } from "../SuccessMore";
import { SuccessBadge } from "../SuccessBadge";
import { RiskHeldModal } from "../RiskHeldModal";
import { readOrder, type PaidOrder } from "../order";
import styles from "./SuccessView.module.css";

export interface SuccessViewProps {
  content: CheckoutContent;
  quotesHref: string;
  /** Used when the page opens without a chosen quote (direct URL). */
  fallbackQuote: QuoteCardData;
}

/** How long the skeleton holds before the page draws in. */
const LOAD_MS = 1800;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Fill `{token}`s; each filled value is highlighted (a <mark>, or <u> for links). */
function fill(template: string, vars: Record<string, string>, links: string[] = []): ReactNode {
  return template.split(/\{(\w+)\}/).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const v = vars[part] ?? "";
    return links.includes(part) ? <u key={i}>{v}</u> : <mark key={i}>{v}</mark>;
  });
}

const short = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const long = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
const duration = (s: number) => (s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`);

/** The paid amount, counting up from zero once the summary has landed. */
function CountUp({ to, delay }: { to: number; delay: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    const c = animate(0, to, { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [to, delay, reduced]);
  return <>{formatInr(n)}</>;
}

/**
 * SuccessView — Checkout (Success), Figma 670:51168: the end of the journey,
 * after Pay on Review. A skeleton of the page holds for a beat, then it draws
 * in: the greeting and policy stats, the green badge popping with a burst,
 * the ikkat rule, the journey timeline row by row (Profiling, Quotes and
 * Checkout done; Due Diligence open on Sign Mandate Letter; Policy Issuance
 * waiting), the paid Purchase Summary sliding in beside it with its amount
 * counting up, and finally the RM card and BimaNetra Suggests. The copy
 * follows the paid quote (Gold, immediate, or confirmed by an expert) and
 * the flow's case.
 * Usage: <SuccessView content={checkout} quotesHref="…" fallbackQuote={q} />
 */
export function SuccessView(props: SuccessViewProps) {
  const { hydrated } = useQuoteFlow();
  return hydrated ? <SuccessScreen {...props} /> : null;
}

function SuccessScreen({ content, quotesHref, fallbackQuote }: SuccessViewProps) {
  const reduced = useReducedMotion();
  const s = content.success;
  const { result, selectedQuote, checkout } = useQuoteFlow();
  const quote = selectedQuote ?? fallbackQuote;
  const caseId = result?.caseId ?? "C";
  const flow = result?.values ?? content.fallbackValues;
  const name = checkout.fullName || flow.fullName || content.fallbackValues.fullName;
  const email = checkout.email || flow.email || content.fallbackValues.email;
  const clock = useCheckoutClock();
  const notify = useDemoNotice();
  const [order] = useState<PaidOrder>(() => readOrder());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), LOAD_MS);
    return () => window.clearTimeout(id);
  }, []);
  // The Risk Held Letter opens a beat after the page has fully drawn in; it
  // can't be dismissed, only acted on (either action confirms and closes it).
  const [riskHeld, setRiskHeld] = useState(false);
  const [notice, setNotice] = useState<{ title: string; description: string } | null>(null);
  useEffect(() => {
    if (loading) return;
    const id = window.setTimeout(() => setRiskHeld(true), s.riskHeld.delayMs);
    return () => window.clearTimeout(id);
  }, [loading, s.riskHeld.delayMs]);
  const closeNotice = useCallback(() => setNotice(null), []);
  const phone = checkout.phone || flow.phone || content.fallbackValues.phone;
  const finishRiskHeld = (t: { title: string; description: string }) => {
    setRiskHeld(false);
    setNotice({ title: t.title, description: t.description.replace("{email}", email).replace("{phone}", phone) });
  };
  // Pay stops the checkout clock; a direct visit stops it here.
  const { stop } = clock;
  useEffect(() => stop(), [stop]);

  const paidAt = new Date(order.paidAt);
  const ends = new Date(paidAt);
  ends.setFullYear(ends.getFullYear() + 1);
  ends.setDate(ends.getDate() - 1);
  const final = splitPrice(quote.price ?? "", content.summary.gstRate).total;
  const count = (quote.coverages ?? quote.policy?.top ?? []).length;
  const countLabel = (quote.gold ? s.personalizedLabel : s.coveragesLabel).replace("{count}", String(count));
  const product = content.summary.productLines.join(" ");
  const sign = () => {
    setToast(false);
    requestAnimationFrame(() => setToast(true));
  };

  const pick = quote.gold ? s.quoteGold : s.quoteOther;
  // Bought outright (not an expert-confirmed quote): the Immediate Purchase
  // pill sits where the row's status would.
  const expert = !quote.gold && !quote.immediate;
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<EyeIconHandle>(null);
  // The Gold Quote's Quote Selected row carries Powered by BimaNetra.
  const goldTag = quote.gold ? (
    <span
      className={styles.tag}
      data-tone="gold"
      onMouseEnter={() => eyeRef.current?.startAnimation()}
      onMouseLeave={() => eyeRef.current?.stopAnimation()}
    >
      <EyeIcon ref={eyeRef} size={10} color="var(--color-brand-secondary)" />
      {content.summary.poweredByLabel}
    </span>
  ) : undefined;
  const purchaseTag = expert ? undefined : (
    <span
      className={styles.tag}
      onMouseEnter={() => bagRef.current?.startAnimation()}
      onMouseLeave={() => bagRef.current?.stopAnimation()}
    >
      <ShoppingBagIcon ref={bagRef} size={10} color="var(--color-success)" />
      {content.summary.immediateLabel}
    </span>
  );
  const diligence = expert ? s.diligence.expert : s.diligence[caseId];
  const time = duration(clock.seconds);
  const rows: SuccessTimelineItem[] = [
    { pill: s.stepLabels[0], state: "done", title: s.profiling.title, body: fill(s.profiling.body, { product }), status: { label: s.profiling.statusLabel!, time: s.profiling.time! }, link: { label: s.riskReportLabel, onClick: () => notify("riskReport") } },
    { pill: s.stepLabels[1], state: "done", title: pick.title, body: fill(pick.body, { product, count: countLabel, insurer: quote.insurer }), status: { label: pick.statusLabel!, time: pick.time! }, tag: goldTag },
    { pill: s.stepLabels[2], state: "done", title: diligence.title, body: fill(diligence.body, { time }), status: { label: diligence.statusLabel!, time }, tag: purchaseTag },
    { pill: s.stepLabels[3], state: "active", title: s.mandate.title, body: fill(s.mandate.body, { mandate: s.mandate.link }, ["mandate"]), action: { label: s.signLabel, onClick: sign } },
    { pill: s.stepLabels[4], state: "pending", title: s.issuance.title, body: s.issuance.body, action: { label: s.viewPolicyLabel } },
  ];
  const company = checkout.companyName || result?.companyName || content.fallbackCompanyName;
  const [greetA, greetB = ""] = s.greeting.replace("{name}", name).replace("{company}", company).split("{order}");
  const stats = [
    { label: s.stats.startLabel, value: short(paidAt) },
    { label: s.stats.endLabel, value: short(ends) },
    { label: s.stats.premiumLabel, value: formatInr(final) },
    { label: s.stats.periodLabel, value: s.stats.periodValue },
  ];
  const rise = (d: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay: d, ease: EASE } };

  return (
    <div className={styles.page}>
      <QuotesHeader
        content={{ logoSrc: content.header.logoSrc, logoAlt: content.header.logoAlt, ctaLabel: content.header.supportLabel }}
        logoHref={quotesHref}
        variant="outline"
        onCta={() => notify("contactSupport")}
        leadCta={{ label: s.signLabel, onClick: sign }}
        icon={<span className={styles.headset} style={{ "--icon": `url(${content.header.supportIconSrc})` } as CSSProperties} aria-hidden />}
      />

      <div className={styles.body}>
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div key="skeleton" exit={{ opacity: 0, transition: { duration: 0.25 } }}>
              <SuccessSkeleton label={s.loadingLabel} nextUp={!s.hideNextUp} />
            </motion.div>
          ) : (
            <motion.div key="content" className={styles.content} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div className={styles.fold}>
                <main className={styles.main}>
                  {/* Greeting card (692:58159): the badge, the greeting and the
                      policy stats, under a slow green border beam. */}
                  <motion.div className={styles.helloBeam} {...rise(0)}>
                    <span className={styles.beamGlow} aria-hidden>
                      <span className={styles.beamSpin} />
                    </span>
                    <div className={styles.hello}>
                      <div className={styles.badgeWrap}>
                        <motion.div
                          className={styles.badge}
                          initial={reduced ? false : { scale: 0.3, rotate: -40, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
                        >
                          <SuccessBadge label={s.badgeAlt} />
                        </motion.div>
                        {/* The Gold Quote's dithered shockwave and glitter, in green. */}
                        <DitherBurst radius={120} delay={0.3} duration={1.1} edgeToken="--color-success" coreToken="--color-success-border" />
                      </div>
                      <div className={styles.helloText}>
                        <motion.h1 className={styles.greeting} {...rise(0.1)}>
                          {greetA}
                          <mark>#{s.orderPrefix}-{order.id}</mark>
                          {greetB}
                        </motion.h1>
                        <dl className={styles.stats}>
                          {stats.map((st, i) => (
                            <motion.div key={st.label} className={styles.stat} {...rise(0.2 + i * 0.06)}>
                              <dt>{st.label}</dt>
                              <dd>{st.value}</dd>
                            </motion.div>
                          ))}
                        </dl>
                      </div>
                    </div>
                    <span className={styles.beamRing} aria-hidden>
                      <span className={styles.beamSpin} />
                    </span>
                  </motion.div>

                  <motion.div
                    className={styles.rule}
                    initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
                    animate={{ clipPath: "inset(0 0% 0 0)" }}
                    transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
                  >
                    <IkkatDivider height={4} unit={22} />
                  </motion.div>

                  <SuccessTimeline items={rows} delay={0.5} />

                  {!s.hideNextUp && (
                    <motion.div className={styles.next} {...rise(1.25)}>
                      <p className={styles.nextText}>{s.nextUp}</p>
                      <button type="button" className={styles.nextCta} onClick={sign}>
                        {s.signLabel}
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                          <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </motion.div>
                  )}
                </main>
                {/* Right column once paid (Figma 670:51168): the summary (no beam)
                    over the Relationship Manager. */}
                <aside className={styles.side}>
                  <motion.div
                    className={styles.summary}
                    initial={reduced ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                  >
                  <PurchaseSummary
                    content={content.summary}
                    quote={quote}
                    company={company}
                    beam={false}
                    coverages={count ? { label: countLabel, items: quote.coverages ?? quote.policy?.top ?? [] } : undefined}
                    paid={{ label: s.paidLabel.replace("{date}", long(paidAt)), amount: <CountUp to={final} delay={0.7} /> }}
                  />
                  </motion.div>
                  <RmCard rm={s.rm} delay={0.9} />
                </aside>
              </div>

              <motion.div
                className={styles.pageRule}
                initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 1, delay: 1.2, ease: EASE }}
              >
                <IkkatDivider height={4} unit={25.5} />
              </motion.div>

              <Suggestions suggestions={s.suggestions} delay={1.35} />

              <motion.div {...rise(1.7)}>
                <Disclaimer {...content.disclaimer} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RiskHeldModal
        open={riskHeld}
        content={s.riskHeld}
        company={company}
        onDownload={() => finishRiskHeld(s.riskHeld.downloadToast)}
        onWhatsApp={() => finishRiskHeld(s.riskHeld.whatsappToast)}
      />
      <Toast open={!!notice} tone="success" title={notice?.title ?? ""} description={notice?.description} onClose={closeNotice} />
      <Toast open={toast} title={s.mandateToast.title} description={s.mandateToast.description.replace("{email}", email)} onClose={() => setToast(false)} />
    </div>
  );
}
