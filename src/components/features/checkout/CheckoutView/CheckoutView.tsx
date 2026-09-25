"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CheckoutContent, CheckoutStepId } from "@/types/checkout";
import type { QuoteCardData } from "@/types/quotesPage";
import { Toast } from "@/components/ui/Toast";
import { QuotesHeader } from "@/components/features/quotes/QuotesHeader";
import { useCheckout } from "../useCheckout";
import { CheckoutStepper } from "../CheckoutStepper";
import { FormCard } from "../FormCard";
import { StepForm } from "../StepForm";
import { ReviewStep } from "../ReviewStep";
import { CheckoutEditDrawer } from "../CheckoutEditDrawer";
import { PurchaseSummary } from "../PurchaseSummary";
import { Disclaimer } from "../Disclaimer";
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
 * CheckoutView — one checkout step (Figma 484:25856 Billing, 484:26420
 * Company, 484:26922 KYC, 484:27578 Review). The Quotes page's megamenu bar
 * (logo + Contact Support) spans the top. Below it, left: back chip, serif
 * title + stepper, the form card and the disclaimer over a lavender wash with a
 * kolam watermark (the only part that scrolls). Right: progress and the
 * Purchase Summary with the step CTA (fixed). Save & Continue unlocks once the step is
 * complete; Review's final CTA ("Make Payment" / "Request Quote") unlocks on
 * consent.
 * Usage: <CheckoutView step="kyc" steps={…} basePath="…" quotesHref="…" content={c} fallbackQuote={q} />
 */
export function CheckoutView({ step, steps, basePath, quotesHref, content, fallbackQuote }: CheckoutViewProps) {
  const router = useRouter();
  const co = useCheckout(content, fallbackQuote);
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState<"company" | "kyc" | null>(null);
  const [toast, setToast] = useState(false);

  const i = steps.indexOf(step);
  const chrome = content.steps[step];
  const backHref = i === 0 ? quotesHref : `${basePath}/${steps[i - 1]}`;
  const { kyc } = content.steps;

  const cta =
    step === "review"
      ? {
          label: co.quote.immediate ? content.steps.review.payLabel : content.steps.review.requestLabel,
          enabled: consent,
          onClick: () => {
            setToast(false);
            requestAnimationFrame(() => setToast(true));
          },
        }
      : { label: content.summary.saveLabel, enabled: co.isComplete(step), onClick: () => router.push(`${basePath}/${steps[i + 1]}`) };

  const model = {
    value: co.valueOf,
    status: (f: Parameters<typeof co.statusOf>[0]) => co.statusOf(f),
    error: (f: Parameters<typeof co.errorOf>[0]) => co.errorOf(f),
    file: co.get,
    onChange: (key: string, v: string) => co.set({ [key]: v }),
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
        <div className={styles.left}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.header.watermarkSrc} alt="" aria-hidden className={styles.watermark} />

          <main className={styles.content}>
            <div className={styles.titleRow}>
              <div className={styles.titleLead}>
                <Link href={backHref} className={styles.back}>
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                    <path d="M10 6H2m3-3L2 6l3 3" stroke="var(--color-label-secondary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {chrome.backLabel}
                </Link>
                <h1 className={styles.title}>{chrome.title}</h1>
              </div>
              <CheckoutStepper steps={steps} current={step} labels={content.stepperLabels} ariaLabel={content.stepperAriaLabel} />
            </div>

            <FormCard
              banner={chrome.banner}
              bannerIconSrc={content.header.cautionIconSrc}
              bannerCompact={chrome.bannerCompact}
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

            <Disclaimer {...content.disclaimer} />
          </main>
        </div>

        <aside className={styles.right}>
          <PurchaseSummary
            content={content.summary}
            quote={co.quote}
            progress={chrome.progress}
            cta={cta}
            consent={step === "review" ? { text: content.steps.review.consentText, checked: consent, onToggle: () => setConsent((c) => !c) } : undefined}
          />
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
