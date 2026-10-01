"use client";

import { useEffect, useRef, useState } from "react";
import { completionsFor } from "@/lib/completions";
import { useRouter } from "next/navigation";
import type { CheckoutContent, CheckoutStepId } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { AgentProgress } from "@/components/ui/AgentProgress";
import { QuotesHeader } from "@/components/features/quotes/QuotesHeader";
import { useQuoteFlow } from "@/lib/quote-flow";
import { useDemoNotice } from "@/lib/demo-notice";
import { useCheckout } from "../useCheckout";
import { useCheckoutClock } from "../useCheckoutClock";
import { useCheckoutMobile } from "../useCheckoutMobile";
import { CheckoutStepper } from "../CheckoutStepper";
import { FormCard } from "../FormCard";
import { StepForm } from "../StepForm";
import { ReviewStep } from "../ReviewStep";
import { StepConsent, StepCta } from "../StepActions";
import { CheckoutEditDrawer } from "../CheckoutEditDrawer";
import { PurchaseSummary } from "../PurchaseSummary";
import { CheckoutFooter } from "../CheckoutFooter";
import { Disclaimer } from "../Disclaimer";
import { readLastCheckout, writeLastCheckout } from "../lastStep";
import { writeOrder } from "../order";
import { formatInr, splitPrice } from "@/lib/checkout";
import { BackButton } from "@/components/ui/BackButton";
import styles from "./CheckoutView.module.css";

export interface CheckoutViewProps {
  step: CheckoutStepId;
  steps: CheckoutStepId[];
  basePath: string;
  quotesHref: string;
  content: CheckoutContent;
  /** Used when checkout opens without a chosen quote (reload / direct URL). */
  fallbackQuote: QuoteCardData;
}

/**
 * CheckoutView — one checkout step (Figma 638:16876 Billing; Verification:
 * 638:22763 KYC over 638:20126 / 638:18865 Company; 638:21971 Review). The
 * Quotes page's megamenu bar (logo + Contact Support) spans the top. Below it,
 * the conventional checkout split: left (scrolls), the task — back chip, the
 * serif "Checkout" title with the stepper on the same row, the step's form, then an ikkat rule
 * over the consent (when the step needs one) and the CTA, and the disclaimer.
 * Right (515, fixed), the reference: a lavender panel with the "Preparing
 * Checkout" Agent Progress (it runs from the first step until the final CTA)
 * over the Purchase Summary, and a kolam trailing below.
 * Steps with guessed details (Case B) need the verification ticked before
 * Save & Continue; Review's final CTA ("Pay ₹X" / "Request Quote") needs its
 * disclaimer ticked; Pay opens the success page.
 * Verification puts KYC and Company on one step: uploading the GST
 * certificate or PAN card "reads" it (a beat of "Reading your document…"),
 * then fills in the numbers and the company details, in green.
 * Usage: <CheckoutView step="verification" steps={…} basePath="…" quotesHref="…" content={c} fallbackQuote={q} />
 */
/** How long a document "reads" before its details fill in. */
const READ_MS = 1200;

export function CheckoutView(props: CheckoutViewProps) {
  // Wait for the saved flow (a reload restores it before the first paint), so
  // the fields seed from the customer's details, not the demo fallback.
  const { hydrated } = useQuoteFlow();
  return hydrated ? <CheckoutScreen {...props} /> : null;
}

function CheckoutScreen({ step, steps, basePath, quotesHref, content, fallbackQuote }: CheckoutViewProps) {
  const router = useRouter();
  const co = useCheckout(content, fallbackQuote);
  const clock = useCheckoutClock();
  const notify = useDemoNotice();
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState<"verification" | null>(null);
  // A document being "read" (OCR): the fields it fills show a reading
  // placeholder for a beat, then fill in green.
  const [reading, setReading] = useState<string | null>(null);
  const readTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(readTimer.current), []);
  // The step we arrived from, so the stepper animates the hand-off.
  const [from] = useState(() => readLastCheckout());
  const mobile = useCheckoutMobile();

  const i = steps.indexOf(step);
  const chrome = content.steps[step];
  useEffect(() => {
    writeLastCheckout({ step });
  }, [step]);
  const { kyc, company } = content.steps;
  const hrefFor = (s: CheckoutStepId) => `${basePath}/${s}`;

  const formStep = step === "review" ? null : step;
  // The current step's bar follows what's done (fields, uploads, the
  // verification; on Review the three sections and the consent), from 8% to
  // 95%. The last stretch fills, green, on Save & Continue.
  const progress =
    step === "review"
      ? {
          done: (["billing", "verification"] as const).filter((s) => co.isComplete(s)).length + (consent ? 1 : 0),
          total: 3,
        }
      : co.progressOf(step);
  const barPercent = Math.round(8 + (progress.total ? progress.done / progress.total : 1) * 87);
  const cta =
    step === "review"
      ? {
          // Mobile: the footer shows the price beside it, so just "Pay Now".
          label: co.quote.price
            ? mobile
              ? content.steps.review.payNowLabel
              : content.steps.review.payLabel.replace("{price}", co.quote.price)
            : content.steps.review.requestLabel,
          enabled: consent,
          blockedTip: content.ctaBlocked.consent,
          // The journey's final CTA: BimaNetra's orange (secondary 500).
          tone: "secondary" as const,
          // Pay ends the journey: the clock stops, the order is written and
          // the success page takes over.
          onClick: () => {
            clock.stop();
            writeOrder();
            router.push(`${basePath}/success`);
          },
        }
      : {
          label: content.saveLabel,
          enabled: co.isComplete(formStep!),
          blockedTip: content.ctaBlocked.fields,
          onClick: () => router.push(hrefFor(steps[i + 1])),
        };

  const stepConsent =
    step === "review"
      ? { text: content.steps.review.consentText, checked: consent, onToggle: () => setConsent((c) => !c), tone: "review" as const }
      : undefined;

  // Live value of a Company field by key (seed or edit), for the pincode autofill.
  const live = (key: string) => {
    const f = co.fieldsFor("company").find((x) => x.key === key);
    return f ? co.valueOf(f) : co.get(key);
  };

  // Billing's (locked) company name: who the policy is for, in the summary.
  const nameField = co.fieldsFor("billing").find((f) => f.key === "companyName");
  const companyName = nameField ? co.valueOf(nameField) : "";

  type Field = Parameters<typeof co.statusOf>[0];
  const isReading = (f: Field) => !!reading && co.ocrKeys.includes(f.key);
  const model = {
    value: (f: Field) => (isReading(f) ? "" : co.valueOf(f)),
    status: (f: Field) => (isReading(f) ? "loading" : co.statusOf(f)),
    error: (f: Field) => (isReading(f) ? null : co.errorOf(f)),
    file: co.get,
    fetched: co.isFetched,
    note: (f: Field) => {
      const source = !isReading(f) && co.readFrom(f);
      return source ? kyc.ocrNotes[source] : undefined;
    },
    show: (f: Field) => (isReading(f) ? { ...f, placeholder: kyc.readingLabel } : f),
    onChange: (key: string, v: string) => {
      co.set(co.patchFor(key, v, live));
      // A new document (not the MCA's own copy): read it for a beat.
      if (kyc.uploads.some((u) => u.key === key) && v && !co.isFetched(key, v)) {
        setReading(key);
        window.clearTimeout(readTimer.current);
        readTimer.current = window.setTimeout(() => setReading(null), READ_MS);
      }
    },
    completions: (f: Parameters<typeof co.errorOf>[0]) =>
      completionsFor(f.key, { pincode: live("pincode"), place: live("place"), emailDomain: co.companyDomain }),
  };

  return (
    <div className={styles.page}>
      {/* Same megamenu bar as the Quotes page, with Contact Support. */}
      <QuotesHeader
        content={{ logoSrc: content.header.logoSrc, logoAlt: content.header.logoAlt, ctaLabel: content.header.supportLabel }}
        logoHref={quotesHref}
        onCta={() => notify("contactSupport")}
        icon={
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.header.supportIconSrc} alt="" aria-hidden className={styles.supportIcon} />
        }
      />
      <div className={styles.body}>
        <div className={styles.formPanel}>
          <main className={styles.content}>
            <div className={styles.head}>
              {/* Back goes one step at a time: the previous step, or the
                  quotes from the first. */}
              <BackButton href={i > 0 ? hrefFor(steps[i - 1]) : quotesHref}>
                {i > 0 ? content.backToStepLabel.replace("{step}", content.stepperLabels[steps[i - 1]]) : content.backLabel}
              </BackButton>
              {/* Title and stepper share one row (Figma 639:24325), closed by a
                  hairline; they stack on narrower screens. */}
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{content.title}</h1>
                <div className={styles.stepperSlot}>
                  <CheckoutStepper
                    steps={steps}
                    current={step}
                    labels={content.stepperLabels}
                    ariaLabel={content.stepperAriaLabel}
                    from={from?.step ?? null}
                    barPercent={barPercent}
                    hrefFor={hrefFor}
                    upcomingTip={content.stepperUpcomingTip}
                  />
                </div>
              </div>
            </div>

            <FormCard
              banner={chrome.banner}
              bannerIconSrc={content.header.cautionIconSrc}
              sectionTitle={chrome.sectionTitle}
              otherPerson={{ mode: chrome.otherPerson, label: content.otherPersonLabel, checked: co.otherPerson, onChange: co.setOtherPerson }}
            >
              {step === "review" ? (
                <ReviewStep
                  content={content.steps.review}
                  billing={co.fieldsFor("billing")}
                  verification={co.fieldsFor("verification")}
                  uploads={kyc.uploads}
                  valueOf={co.valueOf}
                  fileOf={co.get}
                  onEdit={setEditing}
                />
              ) : step === "verification" ? (
                <StepForm
                  step="verification"
                  fields={co.fieldsFor("kyc")}
                  companyFields={co.fieldsFor("company")}
                  companyTitle={company.sectionTitle}
                  uploads={kyc.uploads}
                  uploadCopy={content.upload}
                  model={model}
                />
              ) : (
                <StepForm step="billing" fields={co.fieldsFor("billing")} uploadCopy={content.upload} model={model} />
              )}
            </FormCard>

            <Disclaimer title={content.disclaimer.title} toggleLabel={content.disclaimer.toggleLabel} paragraphs={[content.disclaimer.contextual.checkout, ...content.disclaimer.paragraphs]} />
          </main>
        </div>
        {/* Summary panel (638:17106): the timer, the summary, and a kolam
            trailing below it. On mobile it's the footer instead. */}
        {!mobile && (
        <aside className={styles.summaryPanel}>
          <div className={styles.summaryStack}>
            <AgentProgress
              label={content.preparingLabel}
              elapsedSeconds={clock.seconds}
              running={clock.running}
              // The count still runs (and stops on Pay); it's just not shown.
              hideTime
              className={styles.preparing}
              labelClassName={styles.preparingLabel}
            />
            <PurchaseSummary
              content={content.summary}
              quote={co.quote}
              company={companyName}
              // Web: the step's CTA (and Review's consent) close the summary,
              // on the right. Mobile keeps them in the footer.
              footer={
                <>
                  {stepConsent && <StepConsent consent={stepConsent} variant="summary" />}
                  <StepCta cta={cta} block />
                </>
              }
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.header.kolamSrc} alt="" aria-hidden className={styles.kolam} />
          </div>
        </aside>
        )}

      </div>

      {mobile && (
        <CheckoutFooter
          preparing={{ label: content.preparingLabel, seconds: clock.seconds, running: clock.running }}
          labels={{ total: content.footer.totalLabel, show: content.footer.showSummaryLabel, hide: content.footer.hideSummaryLabel }}
          price={co.quote.price ? formatInr(splitPrice(co.quote.price, content.summary.gstRate).total) : undefined}
          cta={cta}
          consent={stepConsent}
        >
          <PurchaseSummary content={content.summary} quote={co.quote} compact />
        </CheckoutFooter>
      )}

      <CheckoutEditDrawer
        section={editing}
        title={editing ? content.steps.review.sectionTitles[editing] : ""}
        fields={co.fieldsFor("kyc")}
        companyFields={co.fieldsFor("company")}
        companyTitle={company.sectionTitle}
        uploads={kyc.uploads}
        uploadCopy={content.upload}
        co={co}
        labels={{ save: content.drawer.saveLabel, close: content.drawer.closeLabel }}
        onClose={() => setEditing(null)}
      />

    </div>
  );
}
