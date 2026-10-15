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
import { DitherBurst } from "@/components/ui/DitherBurst";
import { Toast } from "@/components/ui/Toast";
import { useCheckoutClock } from "../useCheckoutClock";
import { useCheckoutMobile } from "../useCheckoutMobile";
import { CheckoutFooter } from "../CheckoutFooter";
import { PurchaseSummary } from "../PurchaseSummary";
import { Disclaimer } from "../Disclaimer";
import { SuccessSteps, SuccessTimeline, type SuccessStep, type SuccessTimelineItem } from "../SuccessTimeline";
import { SuccessSkeleton } from "../SuccessSkeleton";
import { RmCard, Suggestions } from "../SuccessMore";
import type { NetraBotHandle } from "@/components/ui/NetraBot";
import { SuccessBadge } from "../SuccessBadge";
import { RiskHeldModal } from "../RiskHeldModal";
import { readOrder, type PaidOrder } from "../order";
import styles from "./SuccessView.module.css";
import { Button } from "@/components/ui/Button";
import { EASE_OUT as EASE, EASE_SMOOTH } from "@/lib/motion";
import { useAtMost } from "@/lib/media";

export interface SuccessViewProps {
  content: CheckoutContent;
  quotesHref: string;
  /** Used when the page opens without a chosen quote (direct URL). */
  fallbackQuote: QuoteCardData;
}

/** How long the skeleton holds before the page draws in. */
const LOAD_MS = 1800;

/** Fill `{token}`s; each filled value is highlighted (a <mark>, or <u> for links). */
function fill(template: string, vars: Record<string, string>, links: string[] = []): ReactNode {
  return template.split(/\{(\w+)\}/).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const v = vars[part] ?? "";
    return links.includes(part) ? <u key={i}>{v}</u> : <mark key={i}>{v}</mark>;
  });
}

/** Every date on the page reads DD/MM/YYYY. */
const ddmmyyyy = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
/** `days` working days (Mon to Fri) after `from`, which is day 0. */
function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from);
  for (let left = days; left > 0; ) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) left--;
  }
  return d;
}

/** The paid amount, counting up from zero once the summary has landed. */
function CountUp({ to, delay }: { to: number; delay: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    const c = animate(0, to, { duration: 1.1, delay, ease: EASE_SMOOTH, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [to, delay, reduced]);
  return <>{formatInr(n)}</>;
}

/**
 * SuccessView — Checkout (Success), Figma 670:51168: the end of the journey,
 * after Pay on Review. A skeleton of the page holds for a beat, then it draws
 * in: the journey's pills, the headline (by first name) and policy stats, the
 * green badge popping with a burst, then what comes next row by row, then the
 * ikkat rule and BimaNetra Suggests; the paid Purchase Summary slides in
 * beside it with its amount counting up, over the RM card. Stacked (phones),
 * the summary and RM card sit between the greeting card and what comes next.
 * The copy follows the paid quote (Gold, immediate, or confirmed by an
 * expert) and the flow's case.
 * Usage: <SuccessView content={checkout} quotesHref="…" fallbackQuote={q} />
 */
export function SuccessView(props: SuccessViewProps) {
  const { hydrated } = useQuoteFlow();
  return hydrated ? <SuccessScreen {...props} /> : null;
}

function SuccessScreen({ content, quotesHref, fallbackQuote }: SuccessViewProps) {
  const reduced = useReducedMotion();
  const mobile = useCheckoutMobile();
  // Phones: the badge drops to 56, so its burst shrinks with it.
  const small = useAtMost("mobile");
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
  // The Risk Held Letter opens a beat after the page has fully drawn in;
  // either action confirms and closes it, and the × closes it as is.
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
  const issueDate = ddmmyyyy(addWorkingDays(paidAt, s.upNext.issueWorkingDays));
  const final = splitPrice(quote.price ?? "", content.summary.gstRate).total;
  const count = (quote.coverages ?? quote.policy?.top ?? []).length;
  // A scored quote counts its key coverages and exclusions (as on the quote
  // cards); otherwise its top coverages.
  const fit = quote.riskFit;
  const countLabel = fit
    ? s.keyLinesLabel.replace("{count}", String(fit.met))
    : (quote.gold ? s.personalizedLabel : s.coveragesLabel).replace("{count}", String(count));
  const coverageItems = fit
    ? fit.lines.map((l) => ({ label: l.title, kind: l.kind, met: l.met }))
    : (quote.coverages ?? quote.policy?.top ?? []);
  const sign = () => {
    setToast(false);
    requestAnimationFrame(() => setToast(true));
  };
  // The Suggests bot also eggs on the page's actions: a nod for the mandate
  // and a curious look at whatever a chevron is about to reveal.
  const bot = useRef<NetraBotHandle>(null);
  const cheerSign = () => bot.current?.react("nodYes");
  const peekDetails = () => bot.current?.react("curiousPeek");
  // Opening a fold earns a soft smile; closing one, a glance as it's tucked away.
  const folded = (open: boolean) => bot.current?.react(open ? "softSmile" : "tuckAway");

  // The broker mandate was given at checkout: nothing left to sign; the next
  // action is the Risk Held Letter.
  const signed = !!content.steps.verification.mandate?.cases.includes(caseId);
  const downloadRiskHeld = () => finishRiskHeld(s.riskHeld.downloadToast);
  // The journey's pills (692:58157): done up to checkout, then where it is now.
  const steps: SuccessStep[] = [
    { label: s.stepLabels[0], state: "done" },
    { label: s.stepLabels[1], state: "done" },
    { label: s.stepLabels[2], state: "done" },
    ...(signed ? [] : [{ label: s.stepLabels[3], state: "active" as const }]),
    { label: s.stepLabels[4], state: signed ? "active" : "pending" },
  ];
  // What comes next: the action now, then the policy copy once issued.
  const next: SuccessTimelineItem[] = [
    signed
      ? { label: s.next.now, state: "active", title: s.riskHeldStep.title, body: s.riskHeldStep.body, action: { label: s.riskHeldLabel, onClick: downloadRiskHeld, onHover: cheerSign, download: true } }
      : { label: s.next.now, state: "active", title: s.mandate.title, body: fill(s.mandate.body ?? "", { mandate: s.mandate.link }, ["mandate"]), action: { label: s.signLabel, onClick: sign, onHover: cheerSign } },
    {
      label: s.next.after.replace("{days}", String(s.upNext.issueWorkingDays)),
      state: "pending",
      title: s.issuance.title,
      body: s.issuance.body?.replace("{issueDate}", issueDate),
      action: { label: s.viewPolicyLabel, pendingTip: s.viewPolicyPendingTip },
    },
  ];
  // The page's lead action (header, mobile footer): with nothing left to
  // sign (A), it's the BimaKendra dashboard.
  const lead = signed ? { label: s.dashboardLabel, onClick: () => notify("dashboard") } : { label: s.signLabel, onClick: sign };
  const company = checkout.companyName || result?.companyName || content.fallbackCompanyName;
  // "Amit, Your Policy Booking is Confirmed!": the buyer by first name.
  const headline = s.headline.replace("{name}", name.trim().split(/\s+/)[0] ?? "");
  // The premium is in the Purchase Summary, so three stats.
  const stats = [
    { label: s.stats.startLabel, value: ddmmyyyy(paidAt) },
    { label: s.stats.endLabel, value: ddmmyyyy(ends) },
    { label: s.stats.periodLabel, value: s.stats.periodValue },
  ];
  const rise = (d: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, delay: d, ease: EASE } };
  // The paid summary over the RM card: beside the journey on wide screens
  // (sliding in from the right), under the greeting card when stacked.
  const summary = (
    <motion.div
      className={styles.summary}
      initial={reduced ? false : mobile ? { opacity: 0, y: 10 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
    >
      <PurchaseSummary
        content={content.summary}
        quote={quote}
        company={company}
        beam={false}
        coverages={coverageItems.length ? { label: countLabel, items: coverageItems } : undefined}
        paid={{
          label: s.paidLabel.replace("{date}", ddmmyyyy(paidAt)),
          amount: <CountUp to={final} delay={0.7} />,
          // Download Invoice is hidden for now (pass `invoice` to bring it back).
          onToggleHover: peekDetails,
          onToggle: folded,
        }}
        below={<RmCard rm={s.rm} delay={0.9} />}
      />
    </motion.div>
  );

  return (
    <div className={styles.page}>
      <QuotesHeader
        content={{ logoSrc: content.header.logoSrc, logoAlt: content.header.logoAlt, ctaLabel: content.header.supportLabel }}
        logoHref={quotesHref}
        variant="outline"
        onCta={() => notify("contactSupport")}
        // Mobile: Sign Mandate Letter moves to a footer (735:36146).
        leadCta={mobile ? undefined : { ...lead, onHover: cheerSign }}
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
                  {/* The journey so far, as a row of pills (692:58157). */}
                  <SuccessSteps steps={steps} delay={0.1} />
                  {/* Greeting card (692:58159): the badge, the headline, the policy
                      stats and Up Next, under a slow green border beam. */}
                  <motion.div className={styles.helloBeam} {...rise(0)}>
                    <span className={styles.beamGlow} aria-hidden>
                      <span className={styles.beamSpin} />
                    </span>
                    {/* Figma 692:58159: the headline, the stats and Up Next beside
                        the badge (stacked on phones, the badge first). */}
                    <div className={styles.hello}>
                      <div className={styles.helloTop}>
                        <div className={styles.helloText}>
                          <motion.h1 className={styles.headline} {...rise(0.05)}>
                            {headline}
                          </motion.h1>
                          <dl className={styles.stats}>
                            {stats.map((st, i) => (
                              <motion.div key={st.label} className={styles.stat} {...rise(0.1 + i * 0.06)}>
                                <dt>{st.label}</dt>
                                <dd>{st.value}</dd>
                              </motion.div>
                            ))}
                          </dl>
                          {/* Up Next (838:24646), under the stats once the mandate is
                              given. */}
                          {signed && (
                            <motion.div className={styles.upNextText} {...rise(0.3)}>
                              <p className={styles.upNextBody}>
                                <strong className={styles.upNextLead}>{s.upNext.lead}</strong>{" "}
                                {s.upNext.body.replace("{issueDate}", issueDate).split(/(\{riskHeld\}|\{dashboard\})/).map((part, i) =>
                                  part === "{riskHeld}" ? (
                                    <button key={i} type="button" className={styles.upNextLink} onClick={() => setRiskHeld(true)}>
                                      {s.upNext.riskHeld}
                                    </button>
                                  ) : part === "{dashboard}" ? (
                                    <button key={i} type="button" className={styles.upNextLink} onClick={() => notify("dashboard")}>
                                      {s.upNext.dashboard}
                                    </button>
                                  ) : (
                                    part
                                  ),
                                )}
                              </p>
                            </motion.div>
                          )}
                        </div>
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
                          <DitherBurst radius={small ? 84 : 120} delay={0.3} duration={1.1} edgeToken="--color-success" coreToken="--color-success-border" />
                        </div>
                      </div>
                    </div>
                    <span className={styles.beamRing} aria-hidden>
                      <span className={styles.beamSpin} />
                    </span>
                  </motion.div>

                  {/* Stacked (phones): the summary and RM card come next. */}
                  {mobile && summary}

                  {/* What comes next (692:58157): the action now, then the policy copy. */}
                  <SuccessTimeline items={next} delay={0.5} />

                  {!s.hideNextUp && (
                    <motion.div className={styles.next} {...rise(1.25)}>
                      <p className={styles.nextText}>{s.nextUp}</p>
                      <Button arrow onClick={sign}>
                        {s.signLabel}
                      </Button>
                    </motion.div>
                  )}

                </main>
                {/* Right column once paid (Figma 670:51168): the summary (no beam),
                    and the Relationship Manager as its own card under it. */}
                {!mobile && <aside className={styles.side}>{summary}</aside>}
              </div>

              {/* Under both columns, full width like the disclaimer: the ikkat rule,
                  then BimaNetra Suggests. */}
              <div className={styles.more}>
                <motion.div
                  className={styles.rule}
                  initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
                >
                  <IkkatDivider height={4} unit={22} />
                </motion.div>

                <Suggestions suggestions={s.suggestions} delay={1.2} botRef={bot} />
              </div>

              <motion.div {...rise(1.7)}>
                <Disclaimer title={content.disclaimer.title} toggleLabel={content.disclaimer.toggleLabel} paragraphs={[content.disclaimer.contextual.success, ...content.disclaimer.paragraphs]} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mobile && <CheckoutFooter cta={{ ...lead, enabled: true }} />}

      <RiskHeldModal
        open={riskHeld}
        content={s.riskHeld}
        company={company}
        onDownload={() => finishRiskHeld(s.riskHeld.downloadToast)}
        onWhatsApp={() => finishRiskHeld(s.riskHeld.whatsappToast)}
        onClose={() => setRiskHeld(false)}
      />
      <Toast open={!!notice} tone="success" title={notice?.title ?? ""} description={notice?.description} onClose={closeNotice} />
      <Toast open={toast} title={s.mandateToast.title} description={s.mandateToast.description.replace("{email}", email)} onClose={() => setToast(false)} />
    </div>
  );
}
