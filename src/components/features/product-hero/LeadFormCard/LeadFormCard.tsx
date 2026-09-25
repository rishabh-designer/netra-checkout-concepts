"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeadFormContent, QuoteCaseMatch, QuoteModalContent } from "@/types/productPage";
import { useQuoteFlow } from "@/lib/quote-flow";
import { cn } from "@/lib/utils";
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
  /** Focus landing concept: no price block (it's the page headline) and a
   *  privacy line under the CTA. */
  focus?: { privacyLine: string };
}

/** Route the typed name to an outcome via the content's alias table (trimmed,
 *  case-insensitive, whitespace-collapsed). A match may swap in a canonical
 *  legal name for the rest of the flow; no match → Case C with the typed name. */
function resolveCase(name: string, matches: QuoteCaseMatch[]): { caseId: QuoteCaseId; displayName: string } {
  const n = name.trim().replace(/\s+/g, " ").toLowerCase();
  const hit = matches.find((m) => m.aliases.includes(n));
  return hit
    ? { caseId: hit.caseId, displayName: hit.canonicalName ?? name.trim() }
    : { caseId: "C", displayName: name.trim() };
}

/**
 * LeadFormCard — pricing headline, the "New | Personalize My Quote" banner,
 * company-name input, animated CTA (opens the quote modal), and the logo wall.
 * The typed company name routes the modal to Case A / B / C; an empty name
 * fires a toast instead of opening the modal.
 * Usage: <LeadFormCard content={leadForm} quoteModal={quoteModal} />
 */
export function LeadFormCard({ content, quoteModal, focus }: LeadFormCardProps) {
  const router = useRouter();
  const { setResult } = useQuoteFlow();
  const [companyName, setCompanyName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<QuoteCaseId>("C");
  // The name carried into the modal / Quotes page (canonical when matched).
  const [resolvedName, setResolvedName] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = () => {
    if (!companyName.trim()) {
      setToastOpen(false);
      // re-arm so a repeat click re-triggers the toast animation
      requestAnimationFrame(() => setToastOpen(true));
      return;
    }
    const { caseId: next, displayName } = resolveCase(companyName, quoteModal.caseMatches);
    setCaseId(next);
    setResolvedName(displayName);
    setModalOpen(true);
  };

  // Terminal "Go to Quotes" — stash the completed flow (name, case, entered
  // values, Yes/No answer) in the shared store and navigate to the Quotes page.
  const handleComplete = (values: Record<string, string>) => {
    setResult({
      companyName: resolvedName,
      caseId,
      values,
      reportInterest: values["reportInterest"] ?? "",
    });
    setModalOpen(false);
    router.push("/directors-and-officers-insurance/quotes");
  };

  return (
    <div className={cn(styles.card, focus && styles.cardFocus)}>
      <div className={styles.top}>
        {!focus && (
          <div className={styles.priceBlock}>
            <p className={styles.kicker}>{content.priceKicker}</p>
            <p className={styles.headline}>{content.priceHeadline}</p>
          </div>
        )}
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
          size="lg"
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
        {focus && (
          <p className={styles.privacy}>
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {focus.privacyLine}
          </p>
        )}
      </div>
      <QuoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={quoteModal}
        caseId={caseId}
        companyName={resolvedName}
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
