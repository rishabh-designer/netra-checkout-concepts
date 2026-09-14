"use client";

import { useState } from "react";
import type { LeadFormContent, QuoteModalContent } from "@/types/productPage";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { InteractiveInput } from "@/components/ui/InteractiveInput";
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
  if (n === "rambo underwear") return "B";
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
  const [companyName, setCompanyName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<QuoteCaseId>("C");
  const [toastOpen, setToastOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);

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

  // Terminal "Go to Quotes" — the Quotes results page isn't built yet, so close
  // the flow and confirm with a toast (rather than a silent dead-end).
  const handleComplete = () => {
    setModalOpen(false);
    setDoneOpen(false);
    requestAnimationFrame(() => setDoneOpen(true));
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
            <SquareCheck />
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
          active
          autoFocusDesktop
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
      <Toast
        open={doneOpen}
        title={quoteModal.completeToast.title}
        description={quoteModal.completeToast.description}
        onClose={() => setDoneOpen(false)}
      />
    </div>
  );
}

/* Square "selected" check for the promo banner — the info blue (matches the
   "Know More" link), echoing /figma/checkbox-checked.svg but token-driven so it
   recolours with the theme. */
function SquareCheck() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      aria-hidden
      className={styles.squareCheck}
    >
      <rect width="16" height="16" rx="4" fill="var(--color-info)" />
      <path
        d="m4.8 8.2 2 2 4-4.4"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
