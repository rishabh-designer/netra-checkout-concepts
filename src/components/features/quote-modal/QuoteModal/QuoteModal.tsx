"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { TextLoader } from "generative-loaders";
import "generative-loaders/styles.css";
import { cn } from "@/lib/utils";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { RingSweep } from "@/components/ui/RingSweep";
import { AITextLoading } from "@/components/ui/AITextLoading";
import { BorderGlow } from "@/components/ui/BorderGlow";
import type {
  EngineTask,
  IntelligenceEngine as IntelligenceEngineContent,
  QuoteFieldStatus,
  QuoteModalContent,
  QuoteModalField,
  QuotePersonalize,
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
 * overlay and walks a multi-step form (Profile → Business → Insurance). The
 * typed name resolves one case — A (confirmed / green), B (fuzzy guess / orange
 * + consent), C (nothing found / manual) — that themes each step. The left panel
 * is a persistent "Intelligence Engine": an agentic task-runner whose active
 * task expands the Netra search viz and whose meter tracks live flow progress.
 * Figma: Profile 319:25317, Business 320:26136, Insurance 320:26281.
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

  const [stepIndex, setStepIndex] = useState(0);
  const step = content.steps[stepIndex];
  const qc = step.cases[caseId];
  const lastStep = content.steps.length - 1;

  const [fetched, setFetched] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  /** Steps whose probe has already resolved — revisiting skips the skeleton. */
  const probedRef = useRef<Set<number>>(new Set());

  // (Re)opening resets the flow to the first step with fresh state.
  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setValues({});
    probedRef.current = new Set();
  }, [open]);

  // Seed the current step's field values — merged, since field keys are unique
  // per step, so returning to an earlier step keeps its entries — then run the
  // probe on first visit (a revisited or reduced-motion step resolves at once).
  useEffect(() => {
    if (!open) return;
    setValues((prev) => {
      const next = { ...prev };
      qc.fields.forEach((f) => {
        if (!(f.key in next)) next[f.key] = f.key === "name" ? companyName : f.value;
      });
      return next;
    });
    setConsent(false);
    // The Profile step collects input directly (no agent probe / skeleton).
    if (reduced || step.collectMode || probedRef.current.has(stepIndex)) {
      setFetched(true);
      return;
    }
    setFetched(false);
    const id = window.setTimeout(() => {
      probedRef.current.add(stepIndex);
      setFetched(true);
    }, fetchDelay);
    return () => window.clearTimeout(id);
  }, [open, stepIndex, caseId, companyName, reduced, fetchDelay, qc.fields, step.collectMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const allMandatoryFilled = (fields: QuoteModalField[]) =>
    fields.filter((f) => f.mandatory).every((f) => (values[f.key] ?? "").trim() !== "");

  const canSubmit = useMemo(() => {
    if (!fetched) return false;
    // Profile (collect mode) gates on every mandatory field being filled.
    if (step.collectMode) return allMandatoryFilled(qc.fields);
    if (caseId === "A") return true;
    if (caseId === "B") return consent;
    return allMandatoryFilled(qc.fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetched, caseId, consent, values, qc.fields, step.collectMode]);

  /** The distinct mandatory field keys across the whole flow — the meter's
   *  numerator pool. Depends only on the resolved case, not on typed values, so
   *  it isn't rebuilt on every keystroke. */
  const mandatoryKeys = useMemo(() => {
    const keys = new Set<string>();
    content.steps.forEach((st) =>
      st.cases[caseId].fields.forEach((f) => {
        if (f.mandatory) keys.add(f.key);
      }),
    );
    return [...keys];
  }, [content.steps, caseId]);

  /** Live progress meter: share of those questions answered so far. Unvisited
   *  steps' keys aren't seeded yet, so the % climbs as the flow advances;
   *  `Report` is reserved in `totalFlowQuestions`. */
  const percent = useMemo(() => {
    const answered = mandatoryKeys.filter((k) => (values[k] ?? "").trim() !== "").length;
    return Math.min(100, Math.round((answered / content.totalFlowQuestions) * 100));
  }, [mandatoryKeys, content.totalFlowQuestions, values]);

  const profileComplete = allMandatoryFilled(content.steps[0].cases[caseId].fields);

  /** Advance to the next form step (the probe re-runs for it); last step is
   *  terminal for now (the "Quotes" step has no form yet). */
  const handleSubmit = () => {
    if (canSubmit && stepIndex < lastStep) setStepIndex((i) => i + 1);
  };
  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

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
            aria-label={`${step.title} profile`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: reduced ? 0 : 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 80, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.left}>
              {/* No-stepper header (Figma 306:5068): back-chevron + title in one
                  lead stack, close control on the right. */}
              <header className={styles.header}>
                <div className={styles.headerLead}>
                  <button
                    type="button"
                    className={styles.ctrl}
                    aria-label="Back"
                    onClick={handleBack}
                    disabled={stepIndex === 0}
                  >
                    <ChevronLeft />
                  </button>
                  <h2 className={styles.title}>{step.title}</h2>
                </div>
                <button
                  type="button"
                  className={styles.ctrl}
                  aria-label="Close"
                  onClick={onClose}
                >
                  <HeaderClose />
                </button>
              </header>

              <div className={styles.fields}>
                {qc.fields.map((field) => (
                  <Fragment key={field.key}>
                    {/* Auto-personalize badge sits between the questions and the
                        coverage field (Insurance case A only). */}
                    {field.key === "coverage" && qc.personalize && (
                      <PersonalizeBadge personalize={qc.personalize} fetched={fetched} />
                    )}
                    <Field
                      field={field}
                      caseId={caseId}
                      collectMode={!!step.collectMode}
                      fetched={fetched}
                      value={values[field.key] ?? ""}
                      onChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}
                    />
                  </Fragment>
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
                <div className={styles.rowSep} aria-hidden>
                  <span className={styles.rowSepLine} />
                  <IkkatMark pattern={3} width={12} className={styles.rowMark} />
                  <span className={styles.rowSepLine} />
                </div>
                <button
                  type="button"
                  className={cn(styles.submit, canSubmit && styles.submitOn)}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  <span>{content.ctaLabel}</span>
                  <Arrow />
                </button>
              </div>
            </div>

            {/* Left visual — the persistent "Intelligence Engine" task-runner,
                lit by a pointer-tracking edge glow (panel stays light). */}
            <BorderGlow
              className={styles.rightGlow}
              borderRadius={16}
              edgeSensitivity={30}
              glowRadius={40}
              glowIntensity={1}
            >
              <div className={styles.right}>
                <div className={styles.rightScroll}>
                  <IntelligenceEngine
                    engine={content.engine}
                    stepIndex={stepIndex}
                    companyName={companyName}
                    percent={percent}
                    profileComplete={profileComplete}
                    fetched={fetched}
                    search={qc.search}
                    activeTab={step.activeTab}
                    reduced={!!reduced}
                  />
                </div>
                <PanelStepper steps={content.stepperLabels} active={stepIndex} />
              </div>
            </BorderGlow>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---- per-field display status: name=purple, A=green, B=orange, C/collect=green-when-filled ---- */
function displayStatus(
  field: QuoteModalField,
  caseId: QuoteCaseId,
  value: string,
  collectMode: boolean,
): QuoteFieldStatus {
  if (field.key === "name") return "verified";
  // Profile (collect mode): status follows whether the field is filled.
  if (collectMode) return value.trim() ? "success" : "empty";
  if (caseId === "A") return "success";
  if (caseId === "B") return "fuzzy";
  return value.trim() ? "success" : "empty";
}

function Field({
  field,
  caseId,
  collectMode,
  fetched,
  value,
  onChange,
}: {
  field: QuoteModalField;
  caseId: QuoteCaseId;
  collectMode: boolean;
  fetched: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const isName = field.key === "name";
  const fetching = !isName && !fetched;
  const status = displayStatus(field, caseId, value, collectMode);
  const isSelect = field.control === "select";
  const isSearch = field.control === "search";
  // The coverage field reads "Approximating…" while the probe runs (Figma).
  const fetchingLabel = field.key === "coverage" ? "Approximating…" : "Fetching…";

  // Toggle — a Yes/No segmented pair (Insurance questions). Themed by status:
  // success = purple pill + green tick, fuzzy = orange pill + orange tick,
  // unselected/empty = grey outline dot.
  if (field.control === "toggle") {
    const options = field.options ?? ["Yes", "No"];
    const tone = status === "fuzzy" ? "var(--color-brand-secondary)" : "var(--color-success)";
    return (
      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {field.label}
          {field.mandatory && <span className={styles.req}>*</span>}
        </label>
        <div className={styles.toggleRow} role="radiogroup" aria-label={field.label}>
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(styles.toggleOpt, selected && styles.toggleOptOn)}
                data-status={selected ? status : undefined}
                onClick={() => onChange(opt)}
                disabled={fetching}
              >
                <span>{opt}</span>
                {fetching ? (
                  <Spinner />
                ) : selected ? (
                  <FilledCheck color={tone} />
                ) : (
                  <MutedDot />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {field.label}
        {field.mandatory && <span className={styles.req}>*</span>}
      </label>
      <div className={styles.inputWrap} data-status={fetching ? "fetching" : status}>
        {fetching ? (
          <span className={cn(styles.value, styles.placeholder)}>{fetchingLabel}</span>
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
          <>
            {field.prefix && (
              <span className={styles.fieldPrefix} aria-hidden>
                {field.prefix}
              </span>
            )}
            <input
              className={styles.textInput}
              data-empty={value ? undefined : true}
              value={value}
              placeholder={field.placeholder}
              onChange={(e) => onChange(e.target.value)}
            />
          </>
        )}

        <div className={styles.suffix}>
          {isSelect && !fetching && <ChevronDown />}
          {isSearch && !fetching && <SearchIcon />}
          {!fetching && !isSelect && !isSearch && value && (
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

/* Personalize badge (Insurance case A): "New" chip + a status line that flips
   from "…Being Personalized" (pending, purple + Skip) to "Personalized!" (done,
   orange). Skip is presentational for now. */
function PersonalizeBadge({
  personalize,
  fetched,
}: {
  personalize: QuotePersonalize;
  fetched: boolean;
}) {
  return (
    <div className={cn(styles.personalize, fetched && styles.personalizeDone)}>
      <IndicatorBadge label="New" />
      <span className={styles.personalizeLabel}>
        {fetched ? personalize.doneLabel : personalize.pendingLabel}
      </span>
      {!fetched && (
        <button type="button" className={styles.personalizeSkip}>
          {personalize.skipLabel}
        </button>
      )}
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
  activeTab,
  companyName,
  reduced,
  fetched,
  compact = false,
}: {
  search: QuoteSearchPanel;
  /** Which tab reads active on this step (Business "Netra Mode", Insurance "News"). */
  activeTab: string;
  companyName: string;
  reduced: boolean;
  /** false = the engine is still probing → result text shows as skeletons. */
  fetched: boolean;
  /** true = the smaller variant embedded inside an active engine task. */
  compact?: boolean;
}) {
  const body = search.body;
  const query = companyName || search.query;
  const [before, highlight, after] = body?.cinSentence
    ? splitHighlight(body.cinSentence, body.cinHighlight ?? "")
    : ["", "", ""];

  return (
    <motion.div
      className={cn(styles.result, compact && styles.resultCompact)}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      <motion.div variants={item} className={styles.searchBar}>
        <span className={styles.searchQuery}>{query}</span>
        <div className={styles.searchIcons}>
          <SearchIcon />
        </div>
      </motion.div>

      <motion.div variants={item} className={styles.tabs}>
        {search.tabs.map((tab) => (
          <span key={tab} className={cn(styles.tab, tab === activeTab && styles.tabActive)}>
            {tab}
          </span>
        ))}
      </motion.div>

      {body ? (
        <>
          {/* The engine "results" load as skeletons, then redact-reveal (the
              detail lines / footer) or blur-in (the highlighted CIN + heading). */}
          {body.cinSentence &&
            (fetched ? (
              <motion.p variants={item} className={styles.cinSentence}>
                {before}
                <mark className={cn(styles.cinMark, body.tentative && styles.cinMarkGuess)}>
                  {highlight}
                </mark>
                {after}
              </motion.p>
            ) : (
              <TextLoader text={body.cinSentence} variant="skeleton" className={styles.cinSentence} />
            ))}

          {fetched ? (
            <motion.h3
              variants={item}
              className={cn(styles.detailsHeading, body.tentative && styles.detailsHeadingGuess)}
            >
              {body.detailsHeading}
            </motion.h3>
          ) : (
            <TextLoader text={body.detailsHeading} variant="skeleton" className={styles.detailsHeading} />
          )}

          <ul className={styles.detailsList}>
            {body.details.map((detail, i) => (
              <li key={detail} className={styles.detailItem}>
                <TextLoader text={detail} variant={fetched ? "redact" : "skeleton"} />
                {fetched && body.founderTag && i === body.details.length - 1 && (
                  <span className={styles.sourceTag}>{body.founderTag}</span>
                )}
              </li>
            ))}
          </ul>

          <TextLoader
            text={body.footer}
            variant={fetched ? "redact" : "skeleton"}
            className={styles.resultFooter}
          />
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

/* ---- left "Intelligence Engine" — the persistent agentic task-runner ----
   A request bubble + the engine's reply (both only on the Profile step, then
   they slide/blur up and out), a live progress meter, and the 3-task runner.
   The active task expands: Business/Insurance embed the compact search viz,
   Profile has no body (it ingests from the form). Figma 319:25317 / 320:26136 /
   320:26281. */
function IntelligenceEngine({
  engine,
  stepIndex,
  companyName,
  percent,
  profileComplete,
  fetched,
  search,
  activeTab,
  reduced,
}: {
  engine: IntelligenceEngineContent;
  stepIndex: number;
  companyName: string;
  percent: number;
  profileComplete: boolean;
  fetched: boolean;
  search: QuoteSearchPanel;
  activeTab: string;
  reduced: boolean;
}) {
  const message = engine.messageTemplate.replace("{company}", companyName || "your company");
  return (
    <motion.div
      className={styles.engine}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      <AnimatePresence initial={false}>
        {stepIndex === 0 && (
          <motion.div
            key="intro"
            className={styles.engineIntro}
            initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: -12, filter: "blur(6px)", height: 0, marginBottom: 0 }
            }
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.requestBubble}>
              <span>{engine.requestLabel}</span>
              <CheckboxTick />
            </div>
            <div className={styles.engineMessage}>{message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className={styles.engineRunner} layout={!reduced}>
        <div className={styles.meterRow}>
          <span className={styles.meterHeading}>{engine.headingLabel}</span>
          <div className={styles.meterRight}>
            <motion.span
              key={percent}
              className={styles.meterPct}
              initial={reduced ? false : { opacity: 0.4 }}
              animate={{ opacity: 1 }}
            >
              {percent}%
            </motion.span>
            <div className={styles.meterTrack}>
              <motion.div
                className={styles.meterFill}
                animate={{ width: `${percent}%` }}
                transition={{ duration: reduced ? 0 : 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        <ol className={styles.taskList}>
          {engine.tasks.map((task, i) => (
            <TaskRow
              key={task.doneLabel}
              task={task}
              state={i < stepIndex ? "done" : i === stepIndex ? "active" : "pending"}
              profileComplete={profileComplete}
              fetched={fetched}
              search={search}
              activeTab={activeTab}
              companyName={companyName}
              reduced={reduced}
            />
          ))}
        </ol>
      </motion.div>
    </motion.div>
  );
}

function TaskRow({
  task,
  state,
  profileComplete,
  fetched,
  search,
  activeTab,
  companyName,
  reduced,
}: {
  task: EngineTask;
  state: "done" | "active" | "pending";
  profileComplete: boolean;
  fetched: boolean;
  search: QuoteSearchPanel;
  activeTab: string;
  companyName: string;
  reduced: boolean;
}) {
  if (state === "done") {
    return (
      <motion.li layout={!reduced} className={cn(styles.taskRow, styles.taskDone)}>
        <FilledCheck color="var(--color-brand-primary)" />
        <span className={styles.taskDoneLabel}>{task.doneLabel}</span>
      </motion.li>
    );
  }
  if (state === "pending") {
    return (
      <motion.li layout={!reduced} className={cn(styles.taskRow, styles.taskPending)}>
        <RingSweep />
        <span className={styles.taskPendingLabel}>{task.activeLabel}</span>
      </motion.li>
    );
  }

  // Active: purple pill head with a shimmering label; Business/Insurance expand
  // the embedded search, Profile swaps its label to "Ready…" once complete.
  const label =
    !task.hasSearch && profileComplete ? task.readyLabel ?? task.activeLabel : task.activeLabel;
  return (
    <motion.li layout={!reduced} className={cn(styles.taskRow, styles.taskActiveRow)}>
      <div className={styles.taskHead}>
        {task.hasSearch ? (
          <RingSweep />
        ) : profileComplete ? (
          <FilledCheck color="var(--color-brand-primary)" />
        ) : (
          <MinusMark />
        )}
        <AITextLoading text={label} className={styles.taskActiveLabel} />
        {task.hasSearch && <ChevronDown />}
      </div>
      {task.hasSearch && (
        <motion.div
          className={styles.taskBody}
          initial={reduced ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <SearchResult
            compact
            search={search}
            activeTab={activeTab}
            companyName={companyName}
            reduced={reduced}
            fetched={fetched}
          />
        </motion.div>
      )}
    </motion.li>
  );
}

/* Filled purple roundel with a white tick — the checked "Personalize My Quote"
   box in the engine's request bubble (Figma 319:25319). */
function CheckboxTick() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden>
      <rect width="18" height="18" rx="5" fill="var(--color-brand-primary)" />
      <path
        d="m5 9.2 2.4 2.4L13 6"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Minus glyph in a soft box — the collapsed indicator on the Profile task while
   it is still being filled (Figma 319:25336). */
function MinusMark() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="13" height="13" rx="4" stroke="var(--color-brand-primary-border)" />
      <path d="M4 7h6" stroke="var(--color-brand-primary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ---- panel-footer stepper (Figma 306:5036, pinned to the bottom of the
   result panel) — divider line then the flow steps. Steps before `active` read
   as completed (green), `active` is current (purple), the rest upcoming (grey).
   Labels come from content, never hard-coded. */
function PanelStepper({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className={styles.panelStepper}>
      <span className={styles.stepperDivider} aria-hidden />
      <ol className={styles.stepRow}>
        {steps.map((label, i) => {
          const state = i < active ? "done" : i === active ? "current" : "todo";
          return (
            <li
              key={label}
              className={cn(
                styles.stepPill,
                state === "current" && styles.stepCurrent,
                state === "done" && styles.stepDone,
                state === "todo" && styles.stepTodo,
              )}
              aria-current={state === "current" ? "step" : undefined}
            >
              <StepBullet state={state} />
              <span className={styles.stepLabel}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* 12px status dot: purple (current), green (done), muted grey (upcoming). */
function StepBullet({ state }: { state: "done" | "current" | "todo" }) {
  const fill =
    state === "current"
      ? "var(--color-brand-primary)"
      : state === "done"
        ? "var(--color-success)"
        : "var(--color-label-tertiary)";
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4" fill={fill} />
    </svg>
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
  return <FilledCheck color={color} />;
}

/* Filled roundel with a white tick, in an arbitrary colour (toggle selection). */
function FilledCheck({ color }: { color: string }) {
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

/* Header back-chevron (Figma 306:5068, 16px in a 24px box, hint grey #6f7378). */
function ChevronLeft() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M10.5 13 5.5 8l5-5"
        stroke="var(--color-label-secondary)"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Header close X (Figma 306:5068, 16px in a 24px box, hint grey #6f7378). */
function HeaderClose() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="var(--color-label-secondary)" strokeWidth="1.5" strokeLinecap="round" />
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
