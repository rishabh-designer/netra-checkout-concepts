"use client";

import { useCallback, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { LeadFormContent, QuoteCaseMatch, QuoteModalContent } from "@/types/productPage";
import type { QuotesPreview } from "@/types/quotesPage";
import { QuotesBackdrop } from "@/components/features/quotes/QuotesBackdrop";
import { useQuoteFlow } from "@/lib/quote-flow";
import { cn } from "@/lib/utils";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { InteractiveInput } from "@/components/ui/InteractiveInput";
import { CtaButton } from "@/components/ui/CtaButton";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { CompanySuggest, defaultCompanyOption, findCompanyOptions, type CompanyOption, type CompanySuggestMode } from "../CompanySuggest";
import {
  QuoteModal,
  preloadQuoteModal,
  type QuoteCaseId,
} from "@/components/features/quote-modal/QuoteModal";
import { emitHeroPulse } from "@/lib/heroPulse";
import styles from "./LeadFormCard.module.css";

export interface LeadFormCardProps {
  content: LeadFormContent;
  quoteModal: QuoteModalContent;
  /** Focus landing concept: no price block (it's the page headline) and a
   *  privacy line under the CTA. */
  focus?: { privacyLine: string };
  /** When given, the Quotes page skeleton loads behind the modal's lightbox. */
  quotesPreview?: QuotesPreview;
  /** A row over the promo banner (the Focus hero's product pills). */
  topSlot?: ReactNode;
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
export function LeadFormCard({ content, quoteModal, focus, quotesPreview, topSlot }: LeadFormCardProps) {
  const router = useRouter();
  const { setResult } = useQuoteFlow();
  const [companyName, setCompanyName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [caseId, setCaseId] = useState<QuoteCaseId>("C");
  // The name carried into the modal / Quotes page (canonical when matched).
  const [resolvedName, setResolvedName] = useState("");
  // Sent empty: the field shows the error in its help row until typed in.
  const [emptyError, setEmptyError] = useState(false);
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);
  // Type-ahead: opens as the customer types, so they pick their legal entity
  // before continuing. Enter picks the highlighted row (then submits).
  const suggestId = useId();
  const [suggestOpen, setSuggestOpen] = useState(false);
  // "Enter New Company?" switches the list to an MCA search request for what's
  // typed; clearing the field goes back to the registry.
  const [suggestMode, setSuggestMode] = useState<CompanySuggestMode>("search");
  // -1 = the default row (the first match, else the lead row).
  const [hovered, setHovered] = useState(-1);
  const options = findCompanyOptions(companyName, content.companySearch, suggestMode);
  const active = hovered < 0 ? defaultCompanyOption(options) : hovered;
  const listShown = suggestOpen && options.length > 0;
  const pickCompany = (opt: CompanyOption | undefined) => {
    if (!opt) return;
    if (opt.kind === "new") {
      setSuggestMode("request");
      setHovered(-1);
      return;
    }
    if (opt.kind === "record") setCompanyName(opt.legalName);
    setSuggestOpen(false);
    emitHeroPulse("typing");
  };
  const onNameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!listShown) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setHovered((active + step + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pickCompany(options[active]);
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
    }
  };
  const closeKnowMore = useCallback(() => setKnowMoreOpen(false), []);
  // Hidden demo shortcut: the info icon cycles the demo names (A → B → C → A);
  // clearing the field starts the cycle over.
  const [demoIndex, setDemoIndex] = useState(-1);
  const cycleDemoName = () => {
    const names = content.demoNames;
    if (!names?.length) return;
    const next = (demoIndex + 1) % names.length;
    setDemoIndex(next);
    setCompanyName(names[next]);
    setSuggestMode("search");
    setSuggestOpen(false);
  };

  const handleSubmit = () => {
    emitHeroPulse("submit");
    if (!companyName.trim()) {
      setEmptyError(true);
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
        {topSlot}
        <div className={styles.promoBanner}>
          <div className={styles.promoLeft}>
            <IndicatorBadge label={content.promoBadge} />
            <span className={styles.promoLabel}>{content.promoLabel}</span>
          </div>
          <div className={styles.promoRight}>
            <button type="button" className={styles.promoLink} onClick={() => setKnowMoreOpen(true)} aria-haspopup="dialog">
              {content.promoLinkLabel}
            </button>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.nameField}>
        <InteractiveInput
          size="lg"
          placeholder={content.inputPlaceholder}
          name="legal-company-name"
          value={companyName}
          onFocus={preloadQuoteModal}
          onChange={(v) => {
            setCompanyName(v);
            setEmptyError(false);
            setSuggestOpen(true);
            setHovered(-1);
            if (!v.trim()) setSuggestMode("search");
            emitHeroPulse("typing");
          }}
          status={emptyError ? "error" : companyName.trim().length >= 4 ? "success" : "empty"}
          helpText={emptyError ? quoteModal.emptyNameError : undefined}
          helpTone="error"
          showHelp={emptyError}
          clearable
          onClear={() => {
            setDemoIndex(-1);
            setSuggestMode("search");
          }}
          infoTooltip={content.inputTooltip}
          onInfoClick={cycleDemoName}
          onSubmit={handleSubmit}
          onKeyDown={onNameKey}
          onBlur={() => setSuggestOpen(false)}
          combobox={{ listId: suggestId, expanded: suggestOpen && options.length > 0, activeId: `${suggestId}-${active}` }}
        />
          <CompanySuggest
            id={suggestId}
            open={suggestOpen}
            query={companyName}
            options={options}
            active={active}
            content={content.companySearch}
            onPick={pickCompany}
            onHover={setHovered}
          />
        </div>
        <div className={styles.actions}>
          <CtaButton
            label={content.ctaLabel}
            meta={content.ctaMeta}
            onClick={handleSubmit}
          />
        </div>
        {focus && (
          <p className={styles.privacy}>{focus.privacyLine}</p>
        )}
      </div>
      <QuoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        content={quoteModal}
        caseId={caseId}
        companyName={resolvedName}
        onComplete={handleComplete}
        backdrop={quotesPreview && <QuotesBackdrop preview={quotesPreview} caseId={caseId} />}
      />
      <SideDrawer
        open={knowMoreOpen}
        onClose={closeKnowMore}
        title={content.knowMore.title}
        closeLabel={content.knowMore.closeLabel}
        placement="center"
        width={480}
      >
        <div className={styles.knowMore}>
          <p className={styles.knowMoreIntro}>{content.knowMore.intro}</p>
          <ul className={styles.knowMoreList}>
            {content.knowMore.points.map((point) => (
              <li key={point.title} className={styles.knowMorePoint}>
                <span className={styles.knowMoreTitle}>{point.title}</span>
                <span className={styles.knowMoreBody}>{point.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </SideDrawer>
    </div>
  );
}
