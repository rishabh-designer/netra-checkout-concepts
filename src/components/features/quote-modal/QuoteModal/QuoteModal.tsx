"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { TextLoader } from "generative-loaders";
import { useStream } from "@/lib/useStream";
import "generative-loaders/styles.css";
import { cn, formatPhone } from "@/lib/utils";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { RingSweep } from "@/components/ui/RingSweep";
import { AITextLoading } from "@/components/ui/AITextLoading";
import { BorderGlow } from "@/components/ui/BorderGlow";
import { InteractiveInput, type FieldStatus } from "@/components/ui/InteractiveInput";
import { SegmentedField } from "@/components/ui/SegmentedField";
import { IkkatDivider } from "@/components/ui/IkkatDivider";
import { FilledCheck, ChevronDown, SearchIcon } from "@/components/ui/InteractiveInput/icons";
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

/* Morphing Modal motion tokens (beui.dev/components/motion/morphing-modal):
   panel spring, strong ease-out, and the blurred cross-fade between views. */
const MORPH_EASE = [0.16, 1, 0.3, 1] as const;
const MORPH_SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.5 } as const;
function morphView(reduced: boolean | null) {
  return reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.18, ease: MORPH_EASE } },
        exit: { opacity: 0, transition: { duration: 0.14, ease: MORPH_EASE } },
      }
    : {
        initial: { opacity: 0, y: 8, filter: "blur(4px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.24, ease: MORPH_EASE } },
        exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.16, ease: MORPH_EASE } },
      };
}

/* Drawer scrim — mirrors .overlay's A9ACB1 @ 80% + 6px blur (design node
   249:3516), as animatable start/end states. */
const DRAWER_SCRIM = {
  hidden: { backgroundColor: "rgba(169, 172, 177, 0)", backdropFilter: "blur(0px)" },
  shown: { backgroundColor: "rgba(169, 172, 177, 0.8)", backdropFilter: "blur(6px)" },
};

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
  /** Form-only lightbox (Edit Details on the Quotes page): hides the left
   *  Intelligence-Engine / AI-search column and skips the probe skeleton. */
  formOnly?: boolean;
  /** Prefill field values (by field key) — used by Edit Details to seed the
   *  user's already-entered answers instead of the mock case defaults. */
  initialValues?: Record<string, string>;
  /** Fired when the terminal CTA ("Go to Quotes") is submitted on the last step;
   *  receives the collected field values so the caller can carry them to the
   *  Quotes page. */
  onComplete?: (values: Record<string, string>) => void;
  /** Page drawn behind the lightbox while the (non-drawer) modal is open —
   *  e.g. the Quotes page skeleton, so results read as loading behind it. */
  backdrop?: ReactNode;
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
  formOnly = false,
  initialValues,
  onComplete,
  backdrop,
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
        if (f.key in next) return;
        // Prefill (edit mode) wins; else Name = the typed company name and
        // everything else takes its mock default.
        next[f.key] = initialValues?.[f.key] ?? (f.key === "name" ? companyName : f.value);
      });
      return next;
    });
    setConsent(false);
    // Form-only (edit) and Profile (collect mode) show fields at once — no probe.
    if (formOnly || reduced || step.collectMode || probedRef.current.has(stepIndex)) {
      setFetched(true);
      return;
    }
    setFetched(false);
    const id = window.setTimeout(() => {
      probedRef.current.add(stepIndex);
      setFetched(true);
    }, fetchDelay);
    return () => window.clearTimeout(id);
  }, [open, stepIndex, caseId, companyName, reduced, fetchDelay, qc.fields, step.collectMode, formOnly, initialValues]);

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
    // Every step gates on its mandatory fields; consent steps (case B) also
    // need the attestation ticked.
    if (!allMandatoryFilled(qc.fields)) return false;
    return qc.requiresConsent ? consent : true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetched, consent, values, qc.fields, qc.requiresConsent]);

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
   *  steps' keys aren't seeded yet, so the % climbs as the flow advances. */
  const percent = useMemo(() => {
    const answered = mandatoryKeys.filter((k) => (values[k] ?? "").trim() !== "").length;
    return Math.min(100, Math.round((answered / content.totalFlowQuestions) * 100));
  }, [mandatoryKeys, content.totalFlowQuestions, values]);

  const profileComplete = allMandatoryFilled(content.steps[0].cases[caseId].fields);

  /** Advance to the next form step (the probe re-runs for it). On the last step
   *  the CTA is terminal — hand the collected values to `onComplete`, which
   *  carries them to the Quotes results page. */
  const handleSubmit = () => {
    if (!canSubmit) return;
    if (stepIndex < lastStep) setStepIndex((i) => i + 1);
    else onComplete?.(values);
  };
  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return (
    <AnimatePresence>
      {open && backdrop && !formOnly && (
        <motion.div
          key="backdrop"
          className={styles.backdrop}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {backdrop}
        </motion.div>
      )}
      {open && (
        <motion.div
          key="overlay"
          className={cn(styles.overlay, formOnly && styles.overlayDrawer)}
          onClick={onClose}
          // Drawer (Edit Details): the scrim tints and blurs in as the panel
          // slides; the centred modal keeps its plain overlay fade.
          {...(formOnly
            ? {
                initial: DRAWER_SCRIM.hidden,
                animate: DRAWER_SCRIM.shown,
                exit: DRAWER_SCRIM.hidden,
                transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
              }
            : {
                // Morphing Modal (beui.dev): a quick scrim fade.
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.2, ease: MORPH_EASE },
              })}
        >
          <motion.div
            className={cn(styles.modal, formOnly && styles.modalFormOnly)}
            role="dialog"
            aria-modal="true"
            aria-label={step.title}
            onClick={(e) => e.stopPropagation()}
            // Drawer slides in from the left edge past its 32px gutter
            // (Figma 514:19015); the centred modal rises and fades.
            {...(formOnly
              ? {
                  initial: { x: reduced ? 0 : "calc(-100% - 32px)" },
                  animate: { x: 0 },
                  exit: { x: reduced ? 0 : "calc(-100% - 32px)" },
                  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                }
              : {
                  // Morphing Modal (beui.dev): the panel springs up from 20px
                  // below at 97% scale, and leaves quickly.
                  initial: { y: reduced ? 0 : 20, scale: reduced ? 1 : 0.97, opacity: 0 },
                  animate: { y: 0, scale: 1, opacity: 1 },
                  exit: {
                    y: reduced ? 0 : 20,
                    scale: reduced ? 1 : 0.98,
                    opacity: 0,
                    transition: { duration: 0.18, ease: MORPH_EASE },
                  },
                  transition: MORPH_SPRING,
                })}
          >
            <div className={styles.left}>
              {/* Title/nav + fields stack (Figma 503:14942) fills the height; only
                  the fields scroll, so the footer below never leaves the screen. */}
              <div className={styles.formStack}>
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
                    {/* Demo shortcut: a case with `demoFill` fills its fields
                        when the title is clicked. */}
                    <AnimatePresence mode="wait" initial={false}>
                    <motion.h2
                      key={stepIndex}
                      {...morphView(reduced)}
                      className={cn(styles.title, qc.demoFill && styles.titleFill)}
                      onClick={
                        qc.demoFill
                          ? () => setValues((s) => ({ ...s, ...qc.demoFill }))
                          : undefined
                      }
                    >
                      {step.title}
                    </motion.h2>
                    </AnimatePresence>
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

                <AnimatePresence mode="wait" initial={false}>
                <motion.div key={stepIndex} className={styles.fields} {...morphView(reduced)}>
                  {qc.fields.map((field) => (
                    <Fragment key={field.key}>
                      {/* Auto-personalize badge sits between the questions and the
                          coverage field (Insurance cases A + B), preceded by a
                          woven ikkat rule that closes off the binary questions. */}
                      {field.key === "coverage" && qc.personalize && (
                        <>
                          <IkkatDivider className={styles.fieldsDivider} />
                          <PersonalizeBadge personalize={qc.personalize} fetched={fetched} />
                        </>
                      )}
                      <Field
                        field={field}
                        caseId={caseId}
                        collectMode={!!step.collectMode}
                        consent={consent}
                        fetched={fetched}
                        value={values[field.key] ?? ""}
                        onChange={(v) => setValues((s) => ({ ...s, [field.key]: v }))}
                      />
                    </Fragment>
                  ))}
                </motion.div>
                </AnimatePresence>
              </div>

              {/* Pinned footer (Figma 503:15072): divider → consent → CTA. */}
              <div className={styles.actionRow}>
                <div className={styles.rowSep} aria-hidden>
                  <span className={styles.rowSepLine} />
                  <IkkatMark pattern={3} width={12} className={styles.rowMark} />
                  <span className={styles.rowSepLine} />
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
                lit by a pointer-tracking edge glow (panel stays light). Hidden in
                form-only (Edit Details) mode. */}
            {!formOnly && (
              <BorderGlow
                className={styles.rightGlow}
                borderRadius={0}
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
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---- per-field display status: name=userFilled (recalled from what the user
   typed before the modal), A=green, B=orange, C/collect=green-when-filled ---- */
function displayStatus(
  field: QuoteModalField,
  caseId: QuoteCaseId,
  value: string,
  collectMode: boolean,
  consent: boolean,
): QuoteFieldStatus {
  // The company name was supplied by the user in the hero field — we're recalling
  // their own data, so it reads as "prefilled by user", not system-verified.
  if (field.key === "name") return "userFilled";
  // Profile (collect mode): status follows whether the field is filled.
  if (collectMode) return value.trim() ? "success" : "empty";
  if (caseId === "A") return "success";
  if (caseId === "B") {
    // A web-guessed (fuzzy) value the user has edited — or attested as factual by
    // ticking the consent box — is cross-verified → success. Cleared → empty.
    if (!value.trim()) return "empty";
    // A field the source already confirmed (e.g. an MCA-verified PAN) reads green
    // from the start, even while sibling fields remain fuzzy guesses.
    if (field.status === "success") return "success";
    if (consent || value !== field.value) return "success";
    return "fuzzy";
  }
  return value.trim() ? "success" : "empty";
}

function Field({
  field,
  caseId,
  collectMode,
  consent,
  fetched,
  value,
  onChange,
}: {
  field: QuoteModalField;
  caseId: QuoteCaseId;
  collectMode: boolean;
  consent: boolean;
  fetched: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const isName = field.key === "name";
  const fetching = !isName && !fetched;
  const status = displayStatus(field, caseId, value, collectMode, consent);
  const uiStatus: FieldStatus = fetching ? "loading" : status;
  // The coverage field reads "Approximating…" while the probe runs (Figma).
  const fetchingLabel = field.key === "coverage" ? "Approximating…" : "Fetching…";
  // The neutral "Fetched from…" disclaimer shows only while the field is still a
  // guess (fuzzy); it disappears once the user corrects it to success. A
  // success- or basic-tone help line shows only on success. Row stays reserved regardless.
  const onResolved = field.helpTone === "success" || field.helpTone === "basic";
  const visibleHelp =
    field.helpText &&
    (onResolved ? uiStatus === "success" : uiStatus === "fuzzy")
      ? field.helpText
      : undefined;

  // Binary Yes/No → the DSL SegmentedField (Insurance questions).
  if (field.control === "toggle") {
    return (
      <SegmentedField
        label={field.label || undefined}
        showLabel={!!field.label}
        mandatory={field.mandatory}
        options={field.options ?? ["Yes", "No"]}
        value={value}
        onChange={onChange}
        status={uiStatus}
        helpText={visibleHelp}
        helpTone={field.helpTone}
        showHelp
      />
    );
  }

  // Phone: show an error help line until 10 digits are entered.
  const validate =
    field.key === "phone"
      ? (v: string) => {
          const digits = v.replace(/\D/g, "");
          return digits.length > 0 && digits.length < 10 ? "Enter a valid 10-digit number" : null;
        }
      : undefined;

  const control =
    field.control === "select" ? "select" : field.control === "search" ? "search" : "text";
  // Phone reads "xxxx xxx xxx" as it's typed (and for prefilled values).
  const isPhone = field.key === "phone";
  const shown = isPhone ? formatPhone(value) : value;

  return (
    <InteractiveInput
      label={field.label}
      mandatory={field.mandatory}
      control={control}
      options={field.options}
      value={fetching ? "" : shown}
      onChange={isPhone ? (v) => onChange(formatPhone(v)) : onChange}
      readOnly={isName}
      clearable={!isName}
      prefix={field.prefix}
      placeholder={fetching ? fetchingLabel : field.placeholder}
      status={uiStatus}
      validate={validate}
      helpText={visibleHelp}
      helpTone={field.helpTone}
      infoTooltip={field.infoTooltip}
      showHelp
    />
  );
}

/* Personalize badge (Insurance cases A + B): "New" chip + a status line that flips
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
  // Streaming Response (beui.dev): once the probe returns, the result streams
  // in reading order — sentence (with its highlight), heading, each detail,
  // footer — each element mounting only when the cursor reaches it.
  const details = body?.details ?? [];
  const stream = useStream(
    [before ?? "", highlight ?? "", after ?? "", body?.detailsHeading ?? "", ...details, body?.footer ?? "", body ? "" : search.emptyNote ?? ""],
    fetched || !body,
  );
  const D0 = 4; // index of the first detail piece
  const FOOT = D0 + details.length;
  const EMPTY = FOOT + 1;

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
          {!fetched ? (
            <>
              {body.cinSentence && <TextLoader text={body.cinSentence} variant="skeleton" className={styles.cinSentence} />}
              <TextLoader text={body.detailsHeading} variant="skeleton" className={styles.detailsHeading} />
              <ul className={styles.detailsList}>
                {body.details.map((detail) => (
                  <li key={detail} className={styles.detailItem}>
                    <TextLoader text={detail} variant="skeleton" />
                  </li>
                ))}
              </ul>
              <TextLoader text={body.footer} variant="skeleton" className={styles.resultFooter} />
            </>
          ) : (
            <div aria-busy={!stream.done} className={styles.streamBody}>
              {body.cinSentence && stream.started(0) && (
                <p className={styles.cinSentence}>
                  {stream.reveal(0)}
                  {stream.started(1) && (
                    <mark className={cn(styles.cinMark, body.tentative && styles.cinMarkGuess)}>{stream.reveal(1)}</mark>
                  )}
                  {stream.reveal(2)}
                </p>
              )}
              {stream.started(3) && (
                <h3 className={cn(styles.detailsHeading, body.tentative && styles.detailsHeadingGuess)}>{stream.reveal(3)}</h3>
              )}
              {stream.started(D0) && (
                <ul className={styles.detailsList}>
                  {details.map(
                    (detail, i) =>
                      stream.started(D0 + i) && (
                        <li key={detail} className={styles.detailItem}>
                          {stream.reveal(D0 + i)}
                          {body.founderTag && i === details.length - 1 && stream.finished(D0 + i) && (
                            <motion.span
                              className={styles.sourceTag}
                              initial={reduced ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            >
                              {body.founderTag}
                            </motion.span>
                          )}
                        </li>
                      ),
                  )}
                </ul>
              )}
              {stream.started(FOOT) && <p className={styles.resultFooter}>{stream.reveal(FOOT)}</p>}
            </div>
          )}
        </>
      ) : (
        <motion.div variants={item} className={styles.emptyState}>
          <EmptyGlyph />
          <p aria-busy={!stream.done}>{stream.reveal(EMPTY)}</p>
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
  // The engine's reply streams in like an agent response.
  const reply = useStream([message]);
  return (
    <motion.div
      className={styles.engine}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      {/* Request bubble + engine reply persist on every step (Figma 503:14900). */}
      <motion.div variants={item} className={styles.engineIntro}>
        <div className={styles.requestBubble}>
          <span>{engine.requestLabel}</span>
          <CheckboxTick />
        </div>
        <div className={styles.engineMessage} aria-busy={!reply.done} aria-label={message}>
          <span className={styles.engineGhost} aria-hidden>{message}</span>
          <span aria-hidden>{reply.reveal(0)}</span>
        </div>
      </motion.div>

      <motion.div variants={item} className={styles.engineRunner} layout={reduced ? false : "position"}>
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
  // Active task with an embedded search is a real accordion — open by default,
  // collapsible via its head. Hook stays above the done/pending early returns.
  const [expanded, setExpanded] = useState(true);

  // Position-only layout: rows slide to their new spot without Motion scaling
  // them (full `layout` scale-warps the label and lurches the column). The one
  // thing that changes height is the accordion body below, on a matched ease.
  const layoutMode = reduced ? false : "position";
  const layoutTransition = {
    layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  };

  if (state === "done") {
    return (
      <motion.li
        layout={layoutMode}
        transition={layoutTransition}
        className={cn(styles.taskRow, styles.taskDone)}
      >
        <FilledCheck color="var(--color-brand-primary)" />
        <span className={styles.taskDoneLabel}>{task.doneLabel}</span>
      </motion.li>
    );
  }
  if (state === "pending") {
    return (
      <motion.li
        layout={layoutMode}
        transition={layoutTransition}
        className={cn(styles.taskRow, styles.taskPending)}
      >
        <RingSweep spin={false} muted />
        <span className={styles.taskPendingLabel}>{task.activeLabel}</span>
      </motion.li>
    );
  }

  // Active: purple pill head with a shimmering label; Business/Insurance expand
  // the embedded search, Profile swaps its label to "Ready…" once complete.
  const label =
    !task.hasSearch && profileComplete ? task.readyLabel ?? task.activeLabel : task.activeLabel;
  return (
    <motion.li
      layout={layoutMode}
      transition={layoutTransition}
      className={cn(styles.taskRow, styles.taskActiveRow, task.hasSearch && !expanded && styles.taskActiveCollapsed)}
    >
      {task.hasSearch ? (
        <button
          type="button"
          className={cn(styles.taskHead, styles.taskHeadButton)}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <RingSweep />
          <AITextLoading text={label} className={styles.taskActiveLabel} />
          <motion.span
            className={styles.taskChevron}
            animate={{ rotate: expanded ? 0 : 180 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronDown />
          </motion.span>
        </button>
      ) : (
        <div className={styles.taskHead}>
          {/* Active Profile task: a purple sweeping ring while the user is still
              filling it in, resolving to the purple filled check once complete. */}
          {profileComplete ? <FilledCheck color="var(--color-brand-primary)" /> : <RingSweep />}
          <AITextLoading text={label} className={styles.taskActiveLabel} />
        </div>
      )}
      {task.hasSearch && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="body"
              className={styles.taskBody}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: reduced ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.2 } }}
            >
              {/* The body's height is layout-driven (it fills the active row, Figma
                  503:13700), so the reveal is a content fade rather than a height
                  tween: fades in just after the row opens, out as it closes. */}
              <motion.div
                className={styles.taskBodyInner}
                initial={reduced ? false : { opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: reduced ? 0 : 0.28, delay: reduced ? 0 : 0.12, ease: [0.4, 0, 0.2, 1] },
                }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
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
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.li>
  );
}

/* Orange (Secondary) checked box with a white tick — the "Personalize My
   Quote" box in the engine's request bubble (Figma 503:14905, 16px r4). */
function CheckboxTick() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <rect width="16" height="16" rx="4" fill="var(--color-brand-secondary)" />
      <path
        d="m4.4 8.2 2.2 2.2 5-5.2"
        stroke="var(--color-label-inverse)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

/* 4px status dot in a 4px box: purple (current), green (done), muted grey (upcoming). */
function StepBullet({ state }: { state: "done" | "current" | "todo" }) {
  const fill =
    state === "current"
      ? "var(--color-brand-primary)"
      : state === "done"
        ? "var(--color-success)"
        : "var(--color-label-tertiary)";
  return (
    <svg viewBox="0 0 4 4" width="4" height="4" fill="none" aria-hidden>
      <circle cx="2" cy="2" r="2" fill={fill} />
    </svg>
  );
}

function splitHighlight(sentence: string, highlight: string): [string, string, string] {
  if (!highlight) return [sentence, "", ""];
  const i = sentence.indexOf(highlight);
  if (i < 0) return [sentence, "", ""];
  return [sentence.slice(0, i), highlight, sentence.slice(i + highlight.length)];
}

/* ---- inline icons ---- (status roundels/affordances now live in
   ui/InteractiveInput/icons; FilledCheck, ChevronDown, SearchIcon imported above) */

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
