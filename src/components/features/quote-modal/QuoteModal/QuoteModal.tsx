"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useStream } from "@/lib/useStream";
import { cn, formatPhone } from "@/lib/utils";
import { passesRule } from "@/lib/checkout";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { IndicatorBadge } from "@/components/ui/IndicatorBadge";
import { RingSweep } from "@/components/ui/RingSweep";
import { AITextLoading } from "@/components/ui/AITextLoading";
import { InteractiveInput, type FieldStatus } from "@/components/ui/InteractiveInput";
import { SegmentedField } from "@/components/ui/SegmentedField";
import { AgentProgress } from "@/components/ui/AgentProgress";
import { completionsFor } from "@/lib/completions";
import { CloseButton, IconButton } from "@/components/ui/IconButton";
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
import { useResearchTimeline, type ResearchView } from "../useResearchTimeline";
import { ResearchSources } from "../ResearchSources";
import { useDemoNotice } from "@/lib/demo-notice";
import { useFieldTip } from "@/lib/field-tips";
import styles from "./QuoteModal.module.css";
import { Chevron } from "@/components/icons/Chevron";
import { Button } from "@/components/ui/Button";
import { EASE_OUT, EASE_OUT as MORPH_EASE, EASE_STD } from "@/lib/motion";
import { useAtMost } from "@/lib/media";
import { useDialog } from "@/lib/dialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { SCRIM } from "@/components/ui/SideDrawer";
import { StepPill, type StepPillState } from "@/components/ui/StepPill";

/** Research timeline per probed step (one clock, useResearchTimeline): the
 *  query types in, Agent Progress + the sources scan for PROBE_MS, the
 *  findings type out over TYPE_OUT_MS, then the evidence wave resolves each
 *  field (≈2s in), the meter climbs with it and the verdict lands. */
const PROBE_MS = 800;
const TYPE_OUT_MS = 1000;
const QUERY_TYPE_MS = 300;
const FIELD_WAVE_MS = 80;
/** No records (Case C): say so quickly instead of a full research beat. */
const EMPTY_PROBE_MS = 700;

export type QuoteCaseId = "A" | "B" | "C";

/* Morphing Modal motion tokens (beui.dev/components/motion/morphing-modal):
   panel spring, strong ease-out, and the blurred cross-fade between views. */
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
  /** The terminal CTA was pressed and the Quotes page is on its way: the
   *  modal leaves but the backdrop (the Quotes skeleton) stays up until the
   *  route swaps, so the page under it never shows through. */
  handingOff?: boolean;
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
  fetchDelay = PROBE_MS,
  formOnly = false,
  initialValues,
  onComplete,
  backdrop,
  handingOff = false,
}: QuoteModalProps) {
  const reduced = useReducedMotion();
  // Phones (≤900): the form is a bottom sheet (Figma 737:38615) that rises
  // from the screen's foot and drops back down, rather than popping in.
  const sheet = useAtMost("sheet");
  // Mobile sheet's engine card: "intro" (open on arrival, no rise), "open",
  // "closing" (shrinking back), "closed" (the strip over Continue).
  const [engineState, setEngineState] = useState<"closed" | "intro" | "open" | "closing">("closed");
  const glowRef = useRef<HTMLDivElement>(null);
  // Opened by the choreography (not the user): closes itself on the verdict.
  const autoOpenRef = useRef(false);
  const openEngine = (auto: boolean) => {
    const glow = glowRef.current;
    if (glow) glow.style.setProperty("--engine-from", `${glow.offsetHeight}px`);
    autoOpenRef.current = auto;
    setEngineState("open");
  };
  // Before closing, lay the card out closed for a moment (no paint in
  // between) to read the strip's height, which it shrinks onto, and how far
  // the meter sits below where the strip keeps it. The intro folds up by that
  // much as the card shrinks, so the meter rides the top edge down and
  // nothing jumps once it's closed.
  const measureFold = () => {
    const glow = glowRef.current;
    const modal = glow?.closest<HTMLElement>("[data-engine]");
    const meter = glow?.querySelector<HTMLElement>(`.${styles.meterRow}`);
    const row = glow?.querySelector<HTMLElement>(`.${styles.taskActiveRow}`);
    if (!glow || !modal) return;
    // The open card is scrolled down past the Profile request and reply; the
    // closed layout doesn't scroll, so measuring it resets that. Kept here and
    // put back below, or the hidden intro drops into view as the fold starts.
    const scroller = glow.querySelector<HTMLElement>(`.${styles.rightScroll}`);
    const scrolled = scroller?.scrollTop ?? 0;
    const meterTop = () => (meter ? meter.getBoundingClientRect().top - glow.getBoundingClientRect().top : 0);
    const openTop = meterTop();
    const prev = modal.dataset.engine;
    modal.dataset.engine = "closed";
    glow.style.setProperty("--engine-from", `${glow.offsetHeight}px`);
    glow.style.setProperty("--intro-fold", `${Math.max(0, openTop - meterTop())}px`);
    // The task row's folded height: it shrinks with the card no further.
    glow.style.setProperty("--task-fold", `${row?.offsetHeight ?? 0}px`);
    modal.dataset.engine = prev;
    if (scroller) scroller.scrollTop = scrolled;
  };
  const closeEngine = () => {
    autoOpenRef.current = false;
    measureFold();
    setEngineState((s) => (s === "open" || s === "intro" ? (reduced ? "closed" : "closing") : s));
  };

  const [stepIndex, setStepIndex] = useState(0);
  const step = content.steps[stepIndex];
  const qc = step.cases[caseId];
  const lastStep = content.steps.length - 1;
  // Edit Details (form-only): every question of the flow in one scrolling
  // list, in step order, instead of one step at a time.
  const allFields = useMemo(() => {
    const seen = new Set<string>();
    return content.steps.flatMap((st) =>
      st.cases[caseId].fields.filter((f) => (seen.has(f.key) ? false : (seen.add(f.key), true))),
    );
  }, [content.steps, caseId]);
  const formFields = formOnly ? allFields : qc.fields;
  /** Fields from a collect-mode step (Profile) keep that step's plain status. */
  const collectKeys = useMemo(
    () => new Set(content.steps.filter((st) => st.collectMode).flatMap((st) => st.cases[caseId].fields.map((f) => f.key))),
    [content.steps, caseId],
  );
  const needsConsent = !formOnly && !!qc.requiresConsent;

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
      formFields.forEach((f) => {
        if (f.key in next) return;
        // Prefill (edit mode) wins; else Name = the typed company name and
        // everything else takes its mock default.
        next[f.key] = initialValues?.[f.key] ?? (f.key === "name" ? companyName : f.value);
      });
      return next;
    });
    setConsent(false);
  }, [open, stepIndex, caseId, companyName, formFields, initialValues]);

  // One clock for the step's research. Form-only (edit), Profile (collect
  // mode), reduced motion and revisited steps start at rest.
  const researchKeys = useMemo(() => qc.fields.map((f) => f.key).filter((k) => k !== "name"), [qc.fields]);
  const instant = formOnly || !!reduced || !!step.collectMode || probedRef.current.has(stepIndex);
  const runKey = `${stepIndex}:${caseId}`;
  const probeMs = qc.search.body ? fetchDelay : Math.min(fetchDelay, EMPTY_PROBE_MS);
  const tl = useResearchTimeline({ runKey, active: open, instant, fieldKeys: researchKeys, probeMs });
  const ready = tl.done;
  useEffect(() => {
    if (tl.done && !step.collectMode) probedRef.current.add(stepIndex);
  }, [tl.done, stepIndex, step.collectMode]);

  // Mobile sheet choreography (Figma 739:40166 → 739:40764). Profile opens
  // with the engine card up (the introduction: what BimaNetra is doing) and it
  // settles down once the reply has typed. On a researched step with data
  // (Cases A and B) the form visibly moves on, the card rises a beat later to
  // show the research, and closes onto the filled fields when it's done.
  // Revisited steps, Case C and reduced motion stay at rest.
  const introSeenRef = useRef(false);
  const autoResearch = !!qc.search.body && !!content.engine.tasks[stepIndex]?.hasSearch && !instant;
  useEffect(() => {
    autoOpenRef.current = false;
    /* eslint-disable react-hooks/set-state-in-effect -- the card follows the step */
    if (!open || !sheet || formOnly || reduced) {
      if (!open) introSeenRef.current = false;
      setEngineState("closed");
      return;
    }
    // Marked seen only once it plays out (onReplyDone), so re-running this
    // (Strict Mode, or a re-render) never cuts the intro short.
    if (stepIndex === 0) {
      setEngineState(introSeenRef.current ? "closed" : "intro");
      return;
    }
    setEngineState("closed");
    /* eslint-enable react-hooks/set-state-in-effect */
    if (!autoResearch) return;
    const id = window.setTimeout(() => openEngine(true), AUTO_OPEN_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- per step / open
  }, [open, stepIndex, sheet]);
  // The research has landed: linger on the verdict, then close onto the form.
  useEffect(() => {
    if (!tl.done || engineState !== "open" || !autoOpenRef.current) return;
    const id = window.setTimeout(closeEngine, RESULT_HOLD_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl.done, engineState]);
  // Closing plays out, then the card is back to the strip.
  useEffect(() => {
    if (engineState !== "closing") return;
    const id = window.setTimeout(() => setEngineState("closed"), ENGINE_MS);
    return () => window.clearTimeout(id);
  }, [engineState]);
  const onReplyDone = () => {
    if (!sheet) return;
    window.setTimeout(() => {
      introSeenRef.current = true;
      measureFold();
      setEngineState((s) => (s === "intro" ? "closing" : s));
    }, INTRO_HOLD_MS);
  };
  function toggleEngine() {
    if (engineState === "closed") openEngine(false);
    else if (engineState !== "closing") closeEngine();
  }
  const engineSheet: EngineSheet | undefined =
    sheet && !formOnly
      ? { expanded: engineState !== "closed", closing: engineState === "closing", toggle: toggleEngine }
      : undefined;

  // Focus moves into the panel and stays there; Esc closes; the page behind
  // holds still; focus returns to the CTA that opened it.
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog({ open, onClose, panelRef });

  const allMandatoryFilled = (fields: QuoteModalField[]) =>
    fields.filter((f) => f.mandatory).every((f) => (values[f.key] ?? "").trim() !== "");

  // A field's format error (phone, email, PAN), or null when it passes.
  const errorFor = (f: QuoteModalField) =>
    f.validate && !passesRule(f.validate, values[f.key] ?? "") ? (content.validationMessages[f.validate] ?? null) : null;

  const canSubmit = useMemo(() => {
    if (!ready) return false;
    // Every step gates on its mandatory fields and valid formats; consent
    // steps (case B) also need the attestation ticked.
    if (!allMandatoryFilled(formFields)) return false;
    if (formFields.some((f) => errorFor(f))) return false;
    return needsConsent ? consent : true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, consent, values, formFields, needsConsent]);

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
    // This step's researched answers only count once they've resolved, so the
    // meter climbs in steps as the evidence lands rather than jumping on entry.
    const pending = new Set(researchKeys.filter((k) => !tl.resolved.has(k)));
    const answered = mandatoryKeys.filter((k) => !pending.has(k) && (values[k] ?? "").trim() !== "").length;
    return Math.min(100, Math.round((answered / content.totalFlowQuestions) * 100));
  }, [mandatoryKeys, content.totalFlowQuestions, values, researchKeys, tl.resolved]);

  // The closing readout: sources that returned something, fields filled.
  const verdict = step.collectMode
    ? null
    : qc.search.verdict
        .replace("{sources}", String(qc.search.sources.filter((src) => src.result !== "miss").length))
        .replace("{fields}", String(researchKeys.filter((k) => (values[k] ?? "").trim() !== "").length));
  const research: ResearchView = {
    fetched: tl.fetched,
    instant,
    done: tl.done,
    onStreamDone: tl.onStreamDone,
    progressLabel: content.engine.progressLabel,
    verdict,
    probeMs,
    sourceTips: content.sourceResultTips,
  };
  // Evidence wave: once the findings finish typing, the fields resolve one
  // after another in form order (the meter climbs with each).
  const { evidence, resolve } = tl;
  useEffect(() => {
    if (!evidence || instant) return;
    const ids = researchKeys.map((key, i) => window.setTimeout(() => resolve(key), i * FIELD_WAVE_MS));
    return () => ids.forEach((id) => window.clearTimeout(id));
    // One wave per step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evidence, instant, runKey]);

  const profileFields = content.steps[0].cases[caseId].fields;
  // Cases A and B swap the typed name for the MCA legal name: say so.
  const matchHelp = content.caseMatches.find((m) => m.caseId === caseId)?.nameHelp;
  const nameHelp = matchHelp?.text;
  const profileComplete = allMandatoryFilled(profileFields) && !profileFields.some((f) => errorFor(f));

  /** Advance to the next form step (the probe re-runs for it). On the last step
   *  the CTA is terminal — hand the collected values to `onComplete`, which
   *  carries them to the Quotes results page. */
  const handleSubmit = () => {
    if (!canSubmit) return;
    if (formOnly) onComplete?.(values);
    else if (stepIndex < lastStep) setStepIndex((i) => i + 1);
    else onComplete?.(values);
  };
  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  return (
    <AnimatePresence>
      {(open || handingOff) && backdrop && !formOnly && (
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
                initial: SCRIM.hidden,
                animate: SCRIM.shown,
                exit: SCRIM.hidden,
                transition: { duration: 0.45, ease: EASE_STD },
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
            ref={panelRef}
            tabIndex={-1}
            className={cn(styles.modal, formOnly && styles.modalFormOnly)}
            data-engine={engineSheet ? engineState : undefined}
            role="dialog"
            aria-modal="true"
            aria-label={formOnly ? content.editTitle : step.title}
            onClick={(e) => e.stopPropagation()}
            // Drawer slides in from the left edge past its 32px gutter
            // (Figma 514:19015); on phones it rises as the form's sheet does.
            // The centred modal rises and fades.
            {...(formOnly && !sheet
              ? {
                  initial: { x: reduced ? 0 : "calc(-100% - 32px)" },
                  animate: { x: 0 },
                  exit: { x: reduced ? 0 : "calc(-100% - 32px)" },
                  transition: { duration: 0.55, ease: EASE_OUT },
                }
              : sheet
                ? {
                    initial: { y: reduced ? 0 : "100%" },
                    animate: { y: 0 },
                    exit: { y: reduced ? 0 : "100%", transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
                    transition: { duration: 0.45, ease: MORPH_EASE },
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
                {/* Header (Figma 306:5068): back-chevron (from the second
                    step on) + title + step pills in one lead stack, close
                    control on the right. */}
                <header className={styles.header}>
                  <div className={styles.headerLead}>
                    {stepIndex > 0 && !formOnly && (
                      <IconButton label="Back" onClick={handleBack}>
                        <ChevronLeft />
                      </IconButton>
                    )}
                    {/* The title mirrors the current step's pill label.
                        Hidden demo shortcut: on a step whose case has
                        `demoFill`, clicking it fills the fields. */}
                    {formOnly ? (
                      <h2 className={styles.title}>{content.editTitle}</h2>
                    ) : (
                      <>
                        <h2
                          className={cn(styles.title, qc.demoFill && styles.titleFill)}
                          onClick={
                            qc.demoFill
                              ? () => setValues((s) => ({ ...s, ...qc.demoFill }))
                              : undefined
                          }
                        >
                          {content.stepperLabels[stepIndex]}
                        </h2>
                        <StepPills steps={content.stepperLabels} active={stepIndex} />
                      </>
                    )}
                  </div>
                  <CloseButton label="Close" onClick={onClose} />
                </header>

                <AnimatePresence mode="wait" initial={false}>
                <motion.div key={stepIndex} className={styles.fields} {...morphView(reduced)}>
                  {formFields.map((field) => (
                    <Fragment key={field.key}>
                      {/* Auto-personalize badge sits between the questions and the
                          coverage field (Insurance cases A + B), preceded by a
                          woven ikkat rule that closes off the binary questions. */}
                      {field.key === "coverage" && qc.personalize && !formOnly && (
                        <>
                          <IkkatDivider className={styles.fieldsDivider} />
                          <PersonalizeBadge personalize={qc.personalize} fetched={ready} />
                        </>
                      )}
                      <Field
                        field={field}
                        caseId={caseId}
                        collectMode={formOnly ? collectKeys.has(field.key) : !!step.collectMode}
                        consent={consent}
                        fetched={formOnly || field.key === "name" || tl.resolved.has(field.key)}
                        value={values[field.key] ?? ""}
                        error={errorFor(field)}
                        nameHelp={field.key === "name" ? nameHelp : undefined}
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
                {needsConsent && (
                  <label className={styles.consent}>
                    <Checkbox
                      className={styles.consentBox}
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      disabled={!ready}
                    />
                    <span>{qc.consentText}</span>
                  </label>
                )}
                <Button
                  arrow
                  block
                  disabled={!canSubmit}
                  data-tooltip={
                    canSubmit
                      ? undefined
                      : !ready
                        ? content.submitBlocked.researching
                        : needsConsent && !consent && allMandatoryFilled(formFields) && !formFields.some((f) => errorFor(f))
                          ? content.submitBlocked.consent
                          : content.submitBlocked.fields
                  }
                  onClick={handleSubmit}
                >
                  {formOnly ? content.saveLabel : stepIndex < lastStep ? content.continueLabel : content.ctaLabel}
                </Button>
              </div>
            </div>

            {/* Left visual — the persistent "Intelligence Engine" task-runner.
                Hidden in form-only (Edit Details) mode. */}
            {!formOnly && (
              <div ref={glowRef} className={styles.rightGlow}>
                <div className={styles.right}>
                  <div className={styles.rightScroll}>
                    <IntelligenceEngine
                      engine={content.engine}
                      stepIndex={stepIndex}
                      companyName={companyName}
                      percent={percent}
                      profileComplete={profileComplete}
                      formDone={canSubmit}
                      research={research}
                      search={qc.search}
                      activeTab={step.activeTab}
                      reduced={!!reduced}
                      sheet={engineSheet}
                      onReplyDone={onReplyDone}
                    />
                  </div>
                </div>
              </div>
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
  error,
  nameHelp,
  onChange,
}: {
  field: QuoteModalField;
  caseId: QuoteCaseId;
  collectMode: boolean;
  consent: boolean;
  /** The engine's research has resolved this field (the evidence wave). */
  fetched: boolean;
  value: string;
  /** Format error for the current value; shown once the field is blurred. */
  error: string | null;
  /** Company name only: the (tertiary) note that its legal name came from
   *  the MCA, so a swapped-in legal name never reads as a glitch. */
  nameHelp?: string;
  onChange: (value: string) => void;
}) {
  // Errors wait for blur (a half-typed value reads neutral, not wrong); once
  // shown they clear live as the user fixes it. A prefilled value counts as touched.
  const [touched, setTouched] = useState(value !== "");
  const sharedTip = useFieldTip(field.key);
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
      <div data-field={field.key}>
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
      </div>
    );
  }

  const shownError = touched && !fetching ? error : null;
  const format = (v: string) => (field.key === "phone" ? formatPhone(v) : field.upper ? v.toUpperCase() : v);

  const control =
    field.control === "select" ? "select" : field.control === "search" ? "search" : "text";
  // Phone reads "xxxx xxx xxx" as it's typed (and for prefilled values).
  const isPhone = field.key === "phone";
  const shown = isPhone ? formatPhone(value) : value;

  return (
    <div data-field={field.key}>
    <InteractiveInput
      label={field.label}
      mandatory={field.mandatory}
      control={control}
      options={field.options}
      value={fetching ? "" : shown}
      onChange={(v) => onChange(format(v))}
      readOnly={isName}
      clearable={!isName}
      prefix={field.prefix}
      placeholder={fetching ? fetchingLabel : field.placeholder}
      status={shownError ? "error" : error && uiStatus === "success" ? "empty" : uiStatus}
      helpText={shownError ?? nameHelp ?? visibleHelp}
      helpTone={shownError ? "error" : nameHelp ? "neutral" : field.helpTone}
      helpAlign={nameHelp && !shownError ? "end" : "start"}
      inputMode={field.inputMode}
      maxLength={field.maxLength}
      onFocus={() => !error && setTouched(false)}
      onBlur={() => setTouched(true)}
      infoTooltip={field.infoTooltip ?? sharedTip}
      showHelp
      completions={completionsFor(field.key, {})}
    />
    </div>
  );
}

/* Personalize badge (Insurance cases A + B): "New" chip + a status line that flips
   from "…being personalised" (pending, purple + Skip) to "personalised!" (done,
   orange). Skip is presentational for now. */
function PersonalizeBadge({
  personalize,
  fetched,
}: {
  personalize: QuotePersonalize;
  fetched: boolean;
}) {
  const notify = useDemoNotice();
  return (
    <div className={cn(styles.personalize, fetched && styles.personalizeDone)}>
      <IndicatorBadge label="New" />
      <span className={styles.personalizeLabel}>
        {fetched ? personalize.doneLabel : personalize.pendingLabel}
      </span>
      {!fetched && (
        <button type="button" className={styles.personalizeSkip} onClick={() => notify("skipPersonalize")}>
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
    transition: { duration: 0.55, ease: EASE_STD },
  },
};

function SearchResult({
  search,
  activeTab,
  companyName,
  reduced,
  research,
  compact = false,
}: {
  search: QuoteSearchPanel;
  /** Which tab reads active on this step (Business "Netra Mode", Insurance "News"). */
  activeTab: string;
  companyName: string;
  reduced: boolean;
  /** The step's research timeline (probe → findings → evidence → verdict). */
  research: ResearchView;
  /** true = the smaller variant embedded inside an active engine task. */
  compact?: boolean;
}) {
  const { fetched, onStreamDone, progressLabel, verdict, done } = research;
  // At rest if we arrived here already researched (revisit / reduced motion).
  const [settled] = useState(research.instant || research.fetched);
  const body = search.body;
  const query = companyName || search.query;
  const [before, highlight, after] = body?.cinSentence
    ? splitHighlight(body.cinSentence, body.cinHighlight ?? "")
    : ["", "", ""];
  // Streaming Response (beui.dev): once the probe returns, the result streams
  // in reading order — sentence (with its highlight), heading, each detail —
  // each element mounting only when the cursor reaches it.
  const details = body?.details ?? [];
  const pieces = [before ?? "", highlight ?? "", after ?? "", body?.detailsHeading ?? "", ...details, body ? "" : search.emptyNote ?? ""];
  // Paced so the whole finding types out in TYPE_OUT_MS, whatever its length.
  const chars = pieces.reduce((n, p) => n + p.length, 0);
  // No records: the note lands at once rather than typing out.
  const stream = useStream(pieces, fetched, settled || !body ? 1e6 : Math.max(40, (chars * 1000) / TYPE_OUT_MS));
  // The query types into the search bar first, as if the engine is asking.
  const typedQuery = useStream([query], !settled, Math.max(20, (query.length * 1000) / QUERY_TYPE_MS));
  useEffect(() => {
    if (fetched && stream.done) onStreamDone?.();
  }, [fetched, stream.done, onStreamDone]);
  // Chat-feed behaviour: the panel follows the newest content as findings
  // type in and when the verdict lands.
  const scrollRef = useRef<HTMLDivElement>(null);
  const revealed = pieces.reduce((n, _, i) => n + stream.reveal(i).length, 0);
  const verdictShown = !!verdict && done;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || settled) return;
    el.scrollTo({ top: el.scrollHeight, behavior: verdictShown ? "smooth" : "auto" });
  }, [revealed, verdictShown, settled]);
  const D0 = 4; // index of the first detail piece
  const EMPTY = D0 + details.length;

  return (
    <motion.div
      ref={scrollRef}
      className={cn(styles.result, compact && styles.resultCompact)}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      <motion.div variants={item} className={styles.searchBar}>
        <span className={styles.searchQuery}>{settled ? query : typedQuery.reveal(0)}</span>
        <div className={styles.searchIcons}>
          <SearchIcon />
        </div>
      </motion.div>

      {/* Only the step's own tab shows (BimaNetra for Business, News for Risk). */}
      <motion.div variants={item} className={styles.tabs}>
        {search.tabs
          .filter((tab) => tab === activeTab)
          .map((tab) => (
            <span key={tab} className={cn(styles.tab, styles.tabActive)}>
              {tab}
            </span>
          ))}
      </motion.div>

      {/* The scan: Agent Progress (beui Agent Loading States, left-aligned
          where the text starts) with the sources lighting up in turn. Agent
          Progress then lifts away (fade + crop up); the sources stay as a
          record of what was checked. */}
      <div className={styles.research}>
        <AnimatePresence initial={false}>
          {!fetched && (
            <motion.div
              key="progress"
              className={styles.progressRow}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: EASE_STD }}
            >
              <AgentProgress label={progressLabel} />
            </motion.div>
          )}
        </AnimatePresence>
        {search.sources.length > 0 && <ResearchSources sources={search.sources} scanning={!fetched} settled={settled} probeMs={research.probeMs} resultTips={research.sourceTips} />}
      </div>

      {body ? (
        <>
          {/* Nothing but Agent Progress while probing; the findings then
              type out in reading order. */}
          {!fetched ? null : (
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
                        <li key={detail} className={styles.detailItem} data-tooltip={body.detailTips?.[i]}>
                          {stream.reveal(D0 + i)}
                          {body.founderTag && i === details.length - 1 && stream.finished(D0 + i) && (
                            <motion.span
                              className={styles.sourceTag}
                              data-tooltip={body.founderTagTip}
                              initial={reduced ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22, ease: EASE_OUT }}
                            >
                              {body.founderTag}
                            </motion.span>
                          )}
                        </li>
                      ),
                  )}
                </ul>
              )}
            </div>
          )}
        </>
      ) : (
        fetched && (
          <motion.div variants={item} className={styles.emptyState}>
            <EmptyGlyph />
            <p aria-busy={!stream.done}>{stream.reveal(EMPTY)}</p>
          </motion.div>
        )
      )}

      {/* Verdict: settles once every field has its answer. */}
      <AnimatePresence initial={false}>
        {verdict && done && (
          <motion.p
            key="verdict"
            className={cn(styles.verdict, body?.tentative && styles.verdictGuess, !body && styles.verdictEmpty)}
            initial={settled || reduced ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }}
          >
            {body ? <FilledCheck color="currentColor" /> : <InfoDot />}
            {verdict}
          </motion.p>
        )}
      </AnimatePresence>
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
  formDone,
  research,
  search,
  activeTab,
  reduced,
  sheet,
  onReplyDone,
}: {
  engine: IntelligenceEngineContent;
  stepIndex: number;
  companyName: string;
  percent: number;
  profileComplete: boolean;
  /** The step's CTA is enabled: only then does the timer show. */
  formDone: boolean;
  /** The active step's research timeline. */
  research: ResearchView;
  search: QuoteSearchPanel;
  activeTab: string;
  reduced: boolean;
  sheet?: EngineSheet;
  /** BimaNetra's intro message has finished typing. */
  onReplyDone?: () => void;
}) {
  const message = engine.messageTemplate.replace("{company}", companyName || "your company");
  const request = engine.requestLabel.replace("{company}", companyName || "your company");
  // The engine's reply streams in like an agent response, the company name
  // in brand purple (its own piece, so it's coloured as it types).
  const [replyBefore, replyAfter = ""] = engine.messageTemplate.split("{company}");
  const reply = useStream([replyBefore, companyName || "your company", replyAfter]);
  useEffect(() => {
    if (reply.done) onReplyDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per reply
  }, [reply.done]);
  return (
    <motion.div
      className={styles.engine}
      variants={container}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
    >
      {/* Request bubble + engine reply (Figma 503:14900) belong to Profile:
          leaving it, they lift away (rise, blur, fade) while their space
          folds shut, and the runner glides up into place. Not
          initial={false}: that would freeze the bubble at rest while the
          panel's stagger rises everything around it. */}
      <AnimatePresence>
        {stepIndex === 0 && (
          <motion.div
            key="intro"
            variants={item}
            className={styles.engineIntro}
            exit={
              reduced
                ? { opacity: 0, height: 0, marginBottom: -24 }
                : {
                    opacity: 0,
                    y: -28,
                    scale: 0.97,
                    filter: "blur(10px)",
                    height: 0,
                    marginBottom: -24,
                    transition: {
                      default: { duration: 0.45, ease: EASE_STD },
                      height: { duration: 0.6, ease: [0.65, 0, 0.35, 1], delay: 0.12 },
                      marginBottom: { duration: 0.6, ease: [0.65, 0, 0.35, 1], delay: 0.12 },
                    },
                  }
            }
          >
            <div className={styles.requestBubble}>
              <span>{request}</span>
              <CheckboxTick />
            </div>
            <div className={styles.engineMessage} aria-busy={!reply.done} aria-label={message}>
              <span className={styles.engineGhost} aria-hidden>{message}</span>
              <span aria-hidden>
                {reply.reveal(0)}
                {reply.started(1) && <span className={styles.engineCompany}>{reply.reveal(1)}</span>}
                {reply.reveal(2)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A chat feed fills top-down: the runner (meter, then tasks) only
          arrives once the engine's reply has finished typing. */}
      <AnimatePresence initial={false}>
      {reply.done && (
      <motion.div
        key="runner"
        className={styles.engineRunner}
        layout={reduced || sheet ? false : "position"}
        initial={reduced ? false : "hidden"}
        animate="visible"
        variants={container}
      >
        <motion.div variants={item} className={styles.meterRow}>
          {/* Agent Progress around the step heading (glyph + live timer), in
              the heading's own type; the timer restarts per step and stops
              once the step is ready. */}
          <AgentProgress
            key={stepIndex}
            label={engine.headingLabels[stepIndex] ?? engine.headingLabels[0]}
            running={stepIndex === 0 ? !profileComplete : !research.done}
            // Out of sight until the form is done: a ticking clock while
            // someone retypes a field only adds anxiety.
            hideTime={!formDone}
            labelClassName={styles.meterHeading}
          />
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
                transition={{ duration: reduced ? 0 : 0.6, ease: EASE_STD }}
              />
            </div>
          </div>
        </motion.div>

        <motion.ol variants={item} className={styles.taskList}>
          {engine.tasks.map((task, i) => (
            <TaskRow
              key={task.doneLabel}
              task={task}
              state={i < stepIndex ? "done" : i === stepIndex ? "active" : "pending"}
              profileComplete={profileComplete}
              research={research}
              search={search}
              activeTab={activeTab}
              companyName={companyName}
              reduced={reduced}
              sheet={sheet}
            />
          ))}
        </motion.ol>
      </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Mobile sheet: the engine card opens and closes slowly and softly
 *  (CSS engine-grow / engine-shrink, 600ms on --ease-engine, a soft in-out). */
const ENGINE_MS = 600;
/** The Profile intro holds this long after BimaNetra's message has typed. */
const INTRO_HOLD_MS = 900;
/** A beat after a step changes (the form visibly moves) before the card opens. */
const AUTO_OPEN_MS = 450;
/** The card lingers on the verdict before closing onto the filled form. */
const RESULT_HOLD_MS = 900;

/** The mobile sheet's engine card, as TaskRow sees it. */
interface EngineSheet {
  expanded: boolean;
  closing: boolean;
  toggle: () => void;
}

function TaskRow({
  sheet,
  task,
  state,
  profileComplete,
  research,
  search,
  activeTab,
  companyName,
  reduced,
}: {
  task: EngineTask;
  state: "done" | "active" | "pending";
  profileComplete: boolean;
  research: ResearchView;
  search: QuoteSearchPanel;
  activeTab: string;
  companyName: string;
  reduced: boolean;
  /** Mobile sheet: the engine card's state, owned by the modal. */
  sheet?: EngineSheet;
}) {
  // Active task with an embedded search is a real accordion — open by default
  // on web; collapsible via its head. On the mobile sheet the modal drives it
  // (`sheet`: the engine card's open / closing state and its toggle). Hooks
  // stay above the done/pending early returns.
  const [localExpanded, setLocalExpanded] = useState(true);
  const expanded = sheet ? sheet.expanded : localExpanded;
  const closing = sheet?.closing ?? false;
  const toggle = () => (sheet ? sheet.toggle() : setLocalExpanded((v) => !v));

  // Position-only layout: rows slide to their new spot without Motion scaling
  // them (full `layout` scale-warps the label and lurches the column). The one
  // thing that changes height is the accordion body below, on a matched ease.
  // On the mobile sheet the card's own fold moves the rows; a layout tween
  // on top of it sends them on a path of their own (the fold wobbles).
  const layoutMode = reduced || sheet ? false : "position";
  const layoutTransition = {
    layout: { duration: 0.4, ease: EASE_STD },
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
          onClick={toggle}
          aria-expanded={expanded}
          data-closing={closing || undefined}
        >
          <RingSweep />
          <AITextLoading text={label} className={styles.taskActiveLabel} />
          <motion.span
            className={styles.taskChevron}
            // Turns as the card starts to fold, not after it has landed.
            animate={{ rotate: expanded && !closing ? 0 : 180 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE_STD }}
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
              exit={{ opacity: 0, transition: { duration: reduced || closing ? 0 : 0.2 } }}
            >
              {/* The body's height is layout-driven (it fills the active row, Figma
                  503:13700), so the reveal is a content fade rather than a height
                  tween: fades in just after the row opens, out as it closes. */}
              <motion.div
                className={styles.taskBodyInner}
                initial={reduced ? false : { opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: reduced ? 0 : 0.28, delay: reduced ? 0 : 0.12, ease: EASE_STD },
                }}
                exit={reduced || closing ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.15, ease: EASE_STD } }}
              >
                <SearchResult
                  compact
                  search={search}
                  activeTab={activeTab}
                  companyName={companyName}
                  reduced={reduced}
                  research={research}
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

/** The flow's Profile / Business / Risk pills: the checkout stepper's pill
 *  (StepPill) without its bars. On Continue / Back the step just left pops
 *  green (or back to grey) and the new one blooms. Keyed by state, so a pill
 *  whose state changed remounts and plays its entrance. */
function StepPills({ steps, active }: { steps: string[]; active: number }) {
  // The step before this one (null on arrival: nothing pops as the form opens).
  const [shown, setShown] = useState(active);
  const [prev, setPrev] = useState<number | null>(null);
  if (shown !== active) {
    setPrev(shown);
    setShown(active);
  }
  const stateAt = (i: number, at: number): StepPillState => (i < at ? "done" : i === at ? "current" : "upcoming");
  return (
    <ol className={styles.stepRow}>
      {steps.map((label, i) => {
        const state = stateAt(i, active);
        return (
          <li key={`${label}-${state}`} aria-current={state === "current" ? "step" : undefined}>
            <StepPill state={state} label={label} from={prev === null ? undefined : stateAt(i, prev)} />
          </li>
        );
      })}
    </ol>
  );
}

/* Header back-chevron (Figma 306:5068, 16px in a 24px box, hint grey #6f7378). */
function ChevronLeft() {
  return <Chevron dir="left" />;
}

function splitHighlight(sentence: string, highlight: string): [string, string, string] {
  if (!highlight) return [sentence, "", ""];
  const i = sentence.indexOf(highlight);
  if (i < 0) return [sentence, "", ""];
  return [sentence.slice(0, i), highlight, sentence.slice(i + highlight.length)];
}

/* ---- inline icons ---- (status roundels/affordances now live in
   ui/InteractiveInput/icons; FilledCheck, ChevronDown, SearchIcon imported above) */




/** Neutral "i" for the no-records readout (a tick would read as success). */
function InfoDot() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="8" cy="5.2" r="0.8" fill="currentColor" />
      <path d="M8 7.3v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
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
