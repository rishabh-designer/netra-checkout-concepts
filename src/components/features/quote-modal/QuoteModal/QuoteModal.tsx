"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { IkkatMark } from "@/components/ui/IkkatMark";
import type {
  QuoteCase,
  QuoteFieldStatus,
  QuoteModalContent,
  QuoteModalField,
  QuoteSearchPanel,
} from "@/types/productPage";
import styles from "./QuoteModal.module.css";

export type QuoteCaseId = "A" | "B" | "C";

export interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  content: QuoteModalContent;
  /** Which outcome to resolve to after the probe (from the typed name). */
  caseId: QuoteCaseId;
  /** The legal company name the user typed — fills the Name field. */
  companyName: string;
  /** ms the agent "probes" before resolving. */
  fetchDelay?: number;
}

/**
 * QuoteModal — the lead flow opened from the CTA. It slides up over a blurred
 * overlay, "probes" for `fetchDelay`, then resolves to one of three outcomes:
 * A (confirmed / green), B (fuzzy guess / orange + consent) or C (nothing found
 * / manual). The right panel reveals bottom-up with a staggered blur.
 * Figma: A 241:27879, B 254:3547, C 254:3952, loading 182:21186.
 */
export function QuoteModal({
  open,
  onClose,
  content,
  caseId,
  companyName,
  fetchDelay = 2000,
}: QuoteModalProps) {
  const reduced = useReducedMotion();
  const qc = content.cases[caseId];

  const [fetched, setFetched] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const init: Record<string, string> = {};
    qc.fields.forEach((f) => {
      init[f.key] = f.key === "name" ? companyName : f.value;
    });
    setValues(init);
    setConsent(false);
    if (reduced) {
      setFetched(true);
      return;
    }
    setFetched(false);
    const id = window.setTimeout(() => setFetched(true), fetchDelay);
    return () => window.clearTimeout(id);
  }, [open, caseId, companyName, reduced, fetchDelay, qc.fields]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSubmit = useMemo(() => {
    if (!fetched) return false;
    if (caseId === "A") return true;
    if (caseId === "B") return consent;
    return qc.fields
      .filter((f) => f.mandatory)
      .every((f) => (values[f.key] ?? "").trim() !== "");
  }, [fetched, caseId, consent, values, qc.fields]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={`${content.title} profile`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: reduced ? 0 : 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.left}>
              <header className={styles.header}>
                <button className={styles.iconBtn} aria-label="Back">
                  <ChevronLeft />
                </button>
                <span className={styles.stepper}>
                  <span className={styles.stepDot} /> {content.stepLabel}
                </span>
                <button className={styles.iconBtn} aria-label="Close" onClick={onClose}>
                  <Close />
                </button>
              </header>

              <h2 className={styles.title}>{content.title}</h2>

              <div className={styles.fields}>
                {qc.fields.map((field) => (
                  <Field
                    key={field.key}
                    field={field}
                    caseId={caseId}
                    fetched={fetched}
                    value={values[field.key] ?? ""}
                    onChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}
                  />
                ))}
              </div>

              {qc.requiresConsent && (
                <label className={styles.consent}>
                  <input
                    type="checkbox"
                    className={styles.consentBox}
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={!fetched}
                  />
                  <span>{qc.consentText}</span>
                </label>
              )}

              <div className={styles.actionRow}>
                <IkkatMark pattern={1} width={20} className={styles.rowMark} />
                <button
                  type="button"
                  className={cn(styles.submit, canSubmit && styles.submitOn)}
                  disabled={!canSubmit}
                >
                  <span>{content.ctaLabel}</span>
                  <Arrow />
                </button>
              </div>
            </div>

            <div className={styles.right}>
              <AnimatePresence mode="wait">
                {fetched ? (
                  <SearchResult
                    key="result"
                    search={qc.search}
                    companyName={companyName}
                    reduced={!!reduced}
                  />
                ) : (
                  <SearchSkeleton key="skeleton" reduced={!!reduced} />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---- per-field display status: name=purple, A=green, B=orange, C=green-when-filled ---- */
function displayStatus(
  field: QuoteModalField,
  caseId: QuoteCaseId,
  value: string,
): QuoteFieldStatus {
  if (field.key === "name") return "verified";
  if (caseId === "A") return "success";
  if (caseId === "B") return "fuzzy";
  return value.trim() ? "success" : "empty";
}

function Field({
  field,
  caseId,
  fetched,
  value,
  onChange,
}: {
  field: QuoteModalField;
  caseId: QuoteCaseId;
  fetched: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const isName = field.key === "name";
  const fetching = !isName && !fetched;
  const status = displayStatus(field, caseId, value);
  const isSelect = field.control === "select";

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {field.label}
        {field.mandatory && <span className={styles.req}>*</span>}
      </label>
      <div className={styles.inputWrap} data-status={fetching ? "fetching" : status}>
        {fetching ? (
          <span className={cn(styles.value, styles.placeholder)}>Fetching…</span>
        ) : isSelect ? (
          <select
            className={styles.select}
            data-empty={value ? undefined : true}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>
              {field.placeholder ?? "Select…"}
            </option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : isName ? (
          <span className={styles.value}>{value}</span>
        ) : (
          <input
            className={styles.textInput}
            data-empty={value ? undefined : true}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        <div className={styles.suffix}>
          {isSelect && !fetching && <ChevronDown />}
          {!fetching && !isSelect && value && (
            <button
              className={styles.suffixBtn}
              aria-label="Clear"
              onClick={() => !isName && onChange("")}
            >
              <Clear />
            </button>
          )}
          <Info />
          <span className={styles.suffixDivider} />
          {fetching ? <Spinner /> : <StatusIcon status={status} />}
        </div>
      </div>
    </div>
  );
}

/* ---- right search-result panel ---- */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
  },
};

function SearchResult({
  search,
  companyName,
  reduced,
}: {
  search: QuoteSearchPanel;
  companyName: string;
  reduced: boolean;
}) {
  const body = search.body;
  const query = companyName || search.query;
  const [before, highlight, after] = body?.cinSentence
    ? splitHighlight(body.cinSentence, body.cinHighlight ?? "")
    : ["", "", ""];

  return (
    <motion.div
      className={styles.result}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      <motion.div variants={item} className={styles.searchBar}>
        <span className={styles.searchQuery}>{query}</span>
        <div className={styles.searchIcons}>
          <SearchIcon />
          <Close />
        </div>
      </motion.div>

      <motion.div variants={item} className={styles.tabs}>
        {search.tabs.map((tab, i) => (
          <span key={tab} className={cn(styles.tab, i === 0 && styles.tabActive)}>
            {tab}
          </span>
        ))}
      </motion.div>

      {body ? (
        <>
          {body.cinSentence && (
            <motion.p variants={item} className={styles.cinSentence}>
              {before}
              <mark className={cn(styles.cinMark, body.tentative && styles.cinMarkGuess)}>
                {highlight}
              </mark>
              {after}
            </motion.p>
          )}
          <motion.h3
            variants={item}
            className={cn(styles.detailsHeading, body.tentative && styles.detailsHeadingGuess)}
          >
            {body.detailsHeading}
          </motion.h3>
          <ul className={styles.detailsList}>
            {body.details.map((detail, i) => (
              <motion.li key={detail} variants={item} className={styles.detailItem}>
                <span>{detail}</span>
                {body.founderTag && i === body.details.length - 1 && (
                  <span className={styles.sourceTag}>{body.founderTag}</span>
                )}
              </motion.li>
            ))}
          </ul>
          <motion.p variants={item} className={styles.resultFooter}>
            {body.footer}
          </motion.p>
        </>
      ) : (
        <motion.div variants={item} className={styles.emptyState}>
          <EmptyGlyph />
          <p>{search.emptyNote}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Shimmer placeholder shown in the right panel during the probe. Mirrors the
   SearchResult layout (search bar → tabs → sentence → heading → list → footer)
   so the reveal doesn't jump. Crossfades out as the result fades in. */
function SearchSkeleton({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      className={styles.skeleton}
      initial={{ opacity: reduced ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="Searching public records"
    >
      <div className={cn(styles.skel, styles.skelSearchBar)} />
      <div className={styles.skelTabs}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={cn(styles.skel, styles.skelTab)} />
        ))}
      </div>
      <div className={styles.skelLines}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={cn(styles.skel, styles.skelLine)} />
        ))}
      </div>
      <div className={cn(styles.skel, styles.skelHeading)} />
      <div className={styles.skelList}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.skelRow}>
            <span className={cn(styles.skel, styles.skelDot)} />
            <span className={cn(styles.skel, styles.skelLine)} />
          </div>
        ))}
      </div>
      <div className={styles.skelFooter}>
        {Array.from({ length: 2 }).map((_, i) => (
          <span key={i} className={cn(styles.skel, styles.skelFooterLine)} />
        ))}
      </div>
    </motion.div>
  );
}

function splitHighlight(sentence: string, highlight: string): [string, string, string] {
  if (!highlight) return [sentence, "", ""];
  const i = sentence.indexOf(highlight);
  if (i < 0) return [sentence, "", ""];
  return [sentence.slice(0, i), highlight, sentence.slice(i + highlight.length)];
}

/* ---- inline icons ---- */
function StatusIcon({ status }: { status: QuoteFieldStatus }) {
  if (status === "fuzzy") return <Alert />;
  if (status === "empty") return <MutedDot />;
  return <Check tone={status === "verified" ? "brand" : "success"} />;
}

function Spinner() {
  return (
    <span className={styles.spinner} role="status" aria-label="Fetching">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="var(--color-input-stroke)" strokeWidth="2" />
        <path
          d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
          stroke="var(--color-brand-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Check({ tone }: { tone: "brand" | "success" }) {
  const color = tone === "brand" ? "var(--color-brand-primary)" : "var(--color-success)";
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
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

function Alert() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="var(--color-brand-secondary)" />
      <path d="M8 4.2v4.4" stroke="var(--color-label-inverse)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.2" r="0.95" fill="var(--color-label-inverse)" />
    </svg>
  );
}

function MutedDot() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="var(--color-input-stroke)" strokeWidth="1.4" />
    </svg>
  );
}

function Info() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="var(--color-info)" strokeWidth="1.3" />
      <circle cx="8" cy="5" r="0.9" fill="var(--color-info)" />
      <path d="M8 7.5v4" stroke="var(--color-info)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Clear() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="m4.5 4.5 7 7m0-7-7 7" stroke="var(--color-label-basic)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="m4 6 4 4 4-4" stroke="var(--color-label-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
      <path d="m14.5 7-5 5 5 5" stroke="var(--color-label-basic)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Close() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path d="m7 7 10 10M17 7 7 17" stroke="var(--color-label-basic)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="var(--color-label-tertiary)" strokeWidth="1.5" />
      <path d="m11 11 3 3" stroke="var(--color-label-tertiary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path d="M5 12h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyGlyph() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="11" stroke="var(--color-label-tertiary)" strokeWidth="2" />
      <path d="m26 26 7 7" stroke="var(--color-label-tertiary)" strokeWidth="2" strokeLinecap="round" />
      <path d="m14 18 8 0" stroke="var(--color-label-tertiary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
