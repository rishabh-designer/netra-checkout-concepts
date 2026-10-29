"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type MotionValue } from "motion/react";
import { FilledCheck } from "@/components/ui/InteractiveInput/icons";
import { EASE_OUT, EASE_STD } from "@/lib/motion";
import { PAGE_H, scanKeyframes, type Track } from "./scanKeyframes";
import styles from "./ResearchScan.module.css";

export interface ResearchScanProps {
  /** A title per sweep of the bar, in turn: one full loop. */
  lines: string[];
  /** The line under the title while it scans. */
  note: string;
  /** Title and line once the research is in. */
  doneTitle: string;
  doneNote: string;
  /** Arrived already researched (revisit / reduced motion): start at rest. */
  settled: boolean;
  /** Every field has its answer: the page settles face-on with a tick. */
  done: boolean;
  /** The loop has played out: the fields may fill in. */
  onScanned?: () => void;
}

/** The page is tipped back this far throughout. */
const TILT = 8;
/** The page's text, as grey bars: a heading, two paragraphs. */
const LINES = [72, 92, 100, 64, 0, 100, 86, 48];
/** Sparkles round the bar: across (%), off its line (px), size, delay (ms). */
const SPARKS = [
  [12, -18, 7, 0],
  [30, 14, 5, 180],
  [46, -26, 6, 420],
  [58, 20, 8, 90],
  [72, -12, 5, 300],
  [86, 24, 6, 520],
  [22, 28, 4, 640],
  [64, -30, 4, 260],
] as const;

/** The bar's light on the paper: a wash, dither thinning away from the bar
 *  (it crawls, so it flickers) and sparkles twinkling round it. */
function Glint({ y }: { y: MotionValue<number> }) {
  return (
    <motion.span
      className={styles.glint}
      style={{ y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_STD }}
    >
      <span className={styles.dither} data-band="near" />
      <span className={styles.dither} data-band="mid" />
      <span className={styles.dither} data-band="far" />
      {SPARKS.map(([x, dy, s, d]) => (
        <span
          key={`${x}${dy}`}
          className={styles.spark}
          style={{ left: `${x}%`, top: `calc(50% + ${dy}px)`, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, animationDelay: `${d}ms` }}
        />
      ))}
    </motion.span>
  );
}

/** One side of the page: the sheet (its corner folded) with its text and
 *  the bar's light, and anything pinned over it (the tick). */
function Face({ back = false, glint, children }: { back?: boolean; glint: ReactNode; children?: ReactNode }) {
  return (
    <div className={styles.face} data-back={back || undefined}>
      <div className={styles.sheet}>
        {LINES.map((w, i) => (w ? <span key={i} className={styles.line} data-head={i === 0 || undefined} style={{ width: `${w}%` }} /> : <span key={i} className={styles.gap} />))}
        {glint}
      </div>
      {children}
    </div>
  );
}

/**
 * ResearchScan — the template stand-in for a researched step's findings
 * (after a "Scanning your document" reference): a page with a folded
 * corner under a purple bar, a slab through the page, whose light dithers
 * and sparkles on the paper as it sweeps down it. The page then flips over
 * (scanKeyframes: tossed, swinging past, landing, the corner lifting) and
 * the bar sweeps back up, a title per sweep. Once the loop has played out
 * it tells the timeline (`onScanned`) so the fields fill in; when they
 * have (`done`), the bar fades and the page settles face-on with a tick.
 * The same every time: no company data.
 * Usage: <ResearchScan lines={scan.lines} note={scan.note} doneTitle={…} doneNote={…} settled={false} done={false} onScanned={tl.onStreamDone} />
 */
export function ResearchScan({ lines, note, doneTitle, doneNote, settled: settledProp, done, onScanned }: ResearchScanProps) {
  // At rest from the start if we arrived here already researched.
  const [settled] = useState(settledProp || done);
  const rest = settled || done;
  const [phase, setPhase] = useState(0);
  const onScannedRef = useRef(onScanned);
  useEffect(() => {
    onScannedRef.current = onScanned;
  }, [onScanned]);

  const n = Math.max(1, lines.length);
  const k = useMemo(() => scanKeyframes(n), [n]);
  // Each next title lands as the page is edge-on mid-flip; the loop's end
  // hands over to the fields.
  useEffect(() => {
    if (settled) return;
    const ids = k.flips.map((t, i) => window.setTimeout(() => setPhase(i + 1), t));
    ids.push(window.setTimeout(() => onScannedRef.current?.(), k.total));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [settled, k]);

  const loop = (t: Track) => ({ duration: k.total / 1000, ease: "easeInOut" as const, times: t.times });
  const settle = { duration: 0.6, ease: EASE_OUT };
  // The bar's run, shared with its light on both sides of the page.
  const barY = useMotionValue(settled ? PAGE_H : 0);
  useEffect(() => {
    if (rest) return;
    const run = animate(barY, k.bar.values, { duration: k.total / 1000, ease: "easeInOut", times: k.bar.times });
    return () => run.stop();
  }, [rest, k, barY]);
  const glint = <AnimatePresence>{!rest && <Glint key="glint" y={barY} />}</AnimatePresence>;

  return (
    <div className={styles.scan}>
      <div className={styles.stage} aria-hidden>
        <motion.span
          className={styles.shadow}
          initial={rest ? false : { scaleX: 1, opacity: 1 }}
          animate={rest ? { scaleX: 1, opacity: 1 } : { scaleX: k.shadowW.values, opacity: k.shadowA.values }}
          transition={rest ? settle : { scaleX: loop(k.shadowW), opacity: loop(k.shadowA) }}
        />
        <motion.div
          className={styles.page}
          initial={rest ? false : { rotateY: 0, rotateX: TILT, y: 0, z: 0 }}
          animate={rest ? { rotateY: settled ? 0 : k.end, rotateX: 0, y: 0, z: 0 } : { rotateY: k.turn.values, rotateX: TILT, y: k.rise.values, z: k.toss.values }}
          transition={rest ? settle : { rotateY: loop(k.turn), y: loop(k.rise), z: loop(k.toss) }}
        >
          <Face glint={glint}>
            <AnimatePresence>
              {rest && (
                <motion.span
                  key="tick"
                  className={styles.tick}
                  initial={settled ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.25 }}
                >
                  <FilledCheck color="var(--color-brand-primary)" />
                </motion.span>
              )}
            </AnimatePresence>
          </Face>
          <Face back glint={glint} />
          {/* The page's edges: a little thickness, so edge-on mid-flip it
              still reads as a sheet. */}
          <span className={styles.edge} data-side="left" />
          <span className={styles.edge} data-side="right" />
          <span className={styles.edge} data-side="top" />
          <span className={styles.edge} data-side="bottom" />
          {/* The folded corner: a flap hinged on the crease, lifting in the
              air as the page flips. */}
          <span className={styles.fold}>
            <motion.span
              className={styles.hinge}
              initial={rest ? false : { rotateX: 0 }}
              animate={rest ? { rotateX: 0 } : { rotateX: k.fold.values }}
              transition={rest ? settle : loop(k.fold)}
            >
              <span className={styles.flap} />
            </motion.span>
          </span>
          {/* The bar: a slab through the page, so it shows on both sides and
              as a short block when the page is edge-on. */}
          <motion.span
            className={styles.bar}
            style={{ y: barY }}
            initial={{ opacity: rest ? 0 : 1 }}
            animate={{ opacity: rest ? 0 : 1 }}
            transition={{ duration: 0.3, ease: EASE_STD }}
          >
            <span className={styles.slab} data-side="front" />
            <span className={styles.slab} data-side="back" />
            <span className={styles.slab} data-side="left" />
            <span className={styles.slab} data-side="right" />
            <span className={styles.slab} data-side="top" />
            <span className={styles.slab} data-side="bottom" />
          </motion.span>
        </motion.div>
      </div>

      {/* One title out, the next in (the row holds its height), the note
          under them. */}
      <div className={styles.copy} aria-live="polite">
        <div className={styles.titleRow}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={rest ? "done" : phase}
              className={styles.title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE_STD }}
            >
              {rest ? doneTitle : lines[phase]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className={styles.note}>{rest ? doneNote : note}</p>
      </div>
    </div>
  );
}
