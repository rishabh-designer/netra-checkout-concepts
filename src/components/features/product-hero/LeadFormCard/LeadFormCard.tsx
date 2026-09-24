"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadFormContent, QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { InteractiveInput } from "@/components/ui/InteractiveInput";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { CtaButton } from "@/components/ui/CtaButton";
import { Toast } from "@/components/ui/Toast";
import {
  QuoteModal,
  type QuoteCaseId,
} from "@/components/features/quote-modal/QuoteModal";
import styles from "./LeadFormCard.module.css";

export interface LeadFormCardProps {
  content: LeadFormContent;
  quoteModal: QuoteModalContent;
}

/** Route the typed name to an outcome (case-insensitive, trimmed). */
function resolveCase(name: string): QuoteCaseId {
  const n = name.trim().toLowerCase();
  if (n === "rambo undergarments") return "A";
  if (n === "sabyasachi calcutta llp" || n === "sabyasachi calcutta") return "B";
  return "C";
}

/**
 * LeadFormCard — pricing headline, the "New | Personalize My Quote" banner,
 * company-name input, animated CTA (opens the quote modal), and the logo wall.
 * The typed company name routes the modal to Case A / B / C; an empty name
 * fires a toast instead of opening the modal.
 * Usage: <LeadFormCard content={leadForm} quoteModal={quoteModal} />
 */
export function LeadFormCard({ content, quoteModal }: LeadFormCardProps) {
  const router = useRouter();
  const { setResult } = useQuoteFlow();
  const [companyName, setCompanyName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<QuoteCaseId>("C");
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = () => {
    if (!companyName.trim()) {
      setToastOpen(false);
      // re-arm so a repeat click re-triggers the toast animation
      requestAnimationFrame(() => setToastOpen(true));
      return;
    }
    setCaseId(resolveCase(companyName));
    setModalOpen(true);
  };

  // Terminal "Go to Quotes" — stash the completed flow (name, case, entered
  // values, Yes/No answer) in the shared store and navigate to the Quotes page.
  const handleComplete = (values: Record<string, string>) => {
    setResult({
      companyName,
      caseId,
      values,
      reportInterest: values["reportInterest"] ?? "",
    });
    setModalOpen(false);
    router.push("/directors-and-officers-insurance/quotes");
  };

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.priceBlock}>
          <p className={styles.kicker}>{content.priceKicker}</p>
          <p className={styles.headline}>{content.priceHeadline}</p>
        </div>
        <div className={styles.promoBanner}>
          <div className={styles.promoLeft}>
            <IndicatorBadge label={content.promoBadge} />
            <span className={styles.promoLabel}>{content.promoLabel}</span>
          </div>
          <div className={styles.promoRight}>
            <a href="#" className={styles.promoLink}>
              {content.promoLinkLabel}
            </a>
            <SquareCheckbox tone="info" state="checked" />
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <InteractiveInput
          placeholder={content.inputPlaceholder}
          name="legal-company-name"
          value={companyName}
          onChange={setCompanyName}
          status={companyName.trim().length >= 4 ? "success" : "empty"}
          clearable
          infoTooltip={content.inputTooltip}
          onSubmit={handleSubmit}
        />
        <div className={styles.actions}>
          <CtaButton
            label={content.ctaLabel}
            meta={content.ctaMeta}
            onClick={handleSubmit}
          />
        </div>
      </div>
      <QuoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={quoteModal}
        caseId={caseId}
        companyName={companyName}
        onComplete={handleComplete}
      />
      <Toast
        open={toastOpen}
        title={quoteModal.emptyNameToast.title}
        description={quoteModal.emptyNameToast.description}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
