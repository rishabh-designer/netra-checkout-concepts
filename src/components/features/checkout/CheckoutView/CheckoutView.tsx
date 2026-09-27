"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CheckoutContent, CheckoutStepId } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { Toast } from "@/components/ui/Toast";
import { AgentProgress } from "@/components/ui/AgentProgress";
import { QuotesHeader } from "@/components/features/quotes/QuotesHeader";
import { useQuoteFlow } from "@/lib/quote-flow";
import { useCheckout } from "../useCheckout";
import { useCheckoutClock } from "../useCheckoutClock";
import { CheckoutStepper } from "../CheckoutStepper";
import { FormCard } from "../FormCard";
import { StepForm } from "../StepForm";
import { ReviewStep } from "../ReviewStep";
import { StepActions } from "../StepActions";
import { CheckoutEditDrawer } from "../CheckoutEditDrawer";
import { PurchaseSummary } from "../PurchaseSummary";
import { Disclaimer } from "../Disclaimer";
import { readLastCheckout, writeLastCheckout } from "../lastStep";
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
 * CheckoutView — one checkout step (Figma 638:16876 Billing, 638:20126 /
 * 638:18865 Company exact / fuzzy, 638:22763 KYC, 638:21971 Review). The
 * Quotes page's megamenu bar (logo + Contact Support) spans the top. Below it,
 * the conventional checkout split: left (scrolls), the task — back chip, the
 * serif "Checkout" title with the stepper on the same row, the step's form, then an ikkat rule
 * over the consent (when the step needs one) and the CTA, and the disclaimer.
 * Right (515, fixed), the reference: a lavender panel with the "Preparing
 * Checkout" Agent Progress (it runs from the first step until the final CTA)
 * over the Purchase Summary, and a kolam trailing below.
 * Steps with guessed details (Case B) need the verification ticked before
 * Save & Continue; Review's final CTA ("Pay ₹X" / "Request Quote") needs its
 * disclaimer ticked.
 * Usage: <CheckoutView step="kyc" steps={…} basePath="…" quotesHref="…" content={c} fallbackQuote={q} />
 */
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
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState<"company" | "kyc" | null>(null);
  const [toast, setToast] = useState(false);
  // The step we arrived from, so the stepper animates the hand-off.
  const [from] = useState(() => readLastCheckout());

  const i = steps.indexOf(step);
  const chrome = content.steps[step];
  useEffect(() => {
    writeLastCheckout({ step });
  }, [step]);
  const { kyc } = content.steps;
  const hrefFor = (s: CheckoutStepId) => `${basePath}/${s}`;

  const formStep = step === "review" ? null : step;
  // The current step's bar follows what's done (fields, uploads, the
  // verification; on Review the three sections and the consent), from 8% to
  // 95%. The last stretch fills, green, on Save & Continue.
  const progress =
    step === "review"
      ? {
          done: (["billing", "company", "kyc"] as const).filter((s) => co.isComplete(s)).length + (consent ? 1 : 0),
          total: 4,
        }
      : co.progressOf(step);
  const barPercent = Math.round(8 + (progress.total ? progress.done / progress.total : 1) * 87);
  const cta =
    step === "review"
      ? {
          label: co.quote.price ? content.steps.review.payLabel.replace("{price}", co.quote.price) : content.steps.review.requestLabel,
          enabled: consent,
          onClick: () => {
            clock.stop();
            setToast(false);
            requestAnimationFrame(() => setToast(true));
          },
        }
      : { label: content.saveLabel, enabled: co.isComplete(formStep!), onClick: () => router.push(hrefFor(steps[i + 1])) };

  const stepConsent =
    step === "review"
      ? { text: content.steps.review.consentText, checked: consent, onToggle: () => setConsent((c) => !c), tone: "review" as const }
      : co.needsVerify(formStep!)
        ? { text: content.verifyText, checked: co.verified(formStep!), onToggle: () => co.setVerified(formStep!, !co.verified(formStep!)), tone: "verify" as const }
        : undefined;

  // Live value of a Company field by key (seed or edit), for the pincode autofill.
  const live = (key: string) => {
    const f = co.fieldsFor("company").find((x) => x.key === key);
    return f ? co.valueOf(f) : co.get(key);
  };

  const model = {
    value: co.valueOf,
    status: (f: Parameters<typeof co.statusOf>[0]) => co.statusOf(f),
    error: (f: Parameters<typeof co.errorOf>[0]) => co.errorOf(f),
    file: co.get,
    fetched: co.isFetched,
    onChange: (key: string, v: string) => co.set(co.patchFor(key, v, live)),
  };

  return (
    <div className={styles.page}>
      {/* Same megamenu bar as the Quotes page, with Contact Support. */}
      <QuotesHeader
        content={{ logoSrc: content.header.logoSrc, logoAlt: content.header.logoAlt, ctaLabel: content.header.supportLabel }}
        logoHref={quotesHref}
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
              <Link href={i > 0 ? hrefFor(steps[i - 1]) : quotesHref} className={styles.back}>
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                  <path d="M10 6H2m3-3L2 6l3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {i > 0 ? content.backToStepLabel.replace("{step}", content.stepperLabels[steps[i - 1]]) : content.backLabel}
              </Link>
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
                  company={co.fieldsFor("company")}
                  kyc={co.fieldsFor("kyc")}
                  uploads={kyc.uploads}
                  valueOf={co.valueOf}
                  fileOf={co.get}
                  onEdit={setEditing}
                />
              ) : (
                <StepForm step={step} fields={co.fieldsFor(step)} uploads={kyc.uploads} uploadCopy={content.upload} model={model} />
              )}
            </FormCard>

            <StepActions cta={cta} consent={stepConsent} />

            <Disclaimer {...content.disclaimer} />
          </main>
        </div>
        {/* Summary panel (638:17106): the timer, the summary, and a kolam
            trailing below it. */}
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
            <PurchaseSummary content={content.summary} quote={co.quote} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.header.kolamSrc} alt="" aria-hidden className={styles.kolam} />
          </div>
        </aside>

      </div>

      <CheckoutEditDrawer
        section={editing}
        title={editing ? content.steps.review.sectionTitles[editing] : ""}
        fields={editing ? co.fieldsFor(editing) : []}
        uploads={editing === "kyc" ? kyc.uploads : []}
        uploadCopy={content.upload}
        co={co}
        labels={{ save: content.drawer.saveLabel, close: content.drawer.closeLabel }}
        onClose={() => setEditing(null)}
      />

      <Toast
        open={toast}
        title={content.steps.review.postCheckoutToast.title}
        description={content.steps.review.postCheckoutToast.description}
        onClose={() => setToast(false)}
      />
    </div>
  );
}
