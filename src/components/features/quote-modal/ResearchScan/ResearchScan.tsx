"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { FilledCheck } from "@/components/ui/InteractiveInput/icons";
import { EASE_OUT, EASE_STD } from "@/lib/motion";
import { BEND_MAX, BEND_PER, FLIP_SPRING, PAGE_H, PAGE_W, PAPER_SPRING, SEGS, scanKeyframes } from "./scanKeyframes";
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
/** Each strip's width: SEGS of them either side of the middle. */
const SEG_W = PAGE_W / (2 * SEGS);
/** The page's text, as grey bars: a heading, two paragraphs. */
const LINES = [72, 92, 100, 64, 0, 100, 86, 48];

/** The bar's light on the paper: a wash, and dither thinning away from
 *  the bar (it crawls, so it flickers). */
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
    </motion.span>
  );
}

/** The whole sheet (text and light), set `left` along so a strip's window
 *  shows its own slice of it. */
function Sheet({ left, glint }: { left: number; glint: ReactNode }) {
  return (
    <div className={styles.sheet} style={{ left }}>
      {LINES.map((w, i) => (w ? <span key={i} className={styles.line} data-head={i === 0 || undefined} style={{ width: `${w}%` }} /> : <span key={i} className={styles.gap} />))}
      {glint}
    </div>
  );
}

/**
 * Strip — one hinged slice of the page, out from the middle (j = 0) to the
 * edge, the next strip hung off its outer side. Every hinge past the middle
 * folds by `bend`, so the page curves as it turns. Each strip carries its
 * slice of both sides, its top and bottom edge and its piece of the bar;
 * the outermost also the page's side edge and the bar's end.
 */
function Strip({ side, j, bend, bar, glint }: { side: "left" | "right"; j: number; bend: MotionValue<number>; bar: { y: MotionValue<number>; opacity: MotionValue<number> }; glint: ReactNode }) {
  const outer = j === SEGS - 1;
  // Where the strip starts along the page (from its left), front side; the
  // back reads mirrored, so its slice starts that far from the other end.
  const x0 = side === "right" ? PAGE_W / 2 + j * SEG_W : PAGE_W / 2 - (j + 1) * SEG_W;
  return (
    <motion.div className={styles.strip} data-side={side} data-outer={outer || undefined} style={j > 0 ? { rotateY: bend } : undefined}>
      <div className={styles.slice}>
        <Sheet left={-x0} glint={glint} />
      </div>
      <div className={styles.slice} data-back>
        <Sheet left={-(PAGE_W - x0 - SEG_W)} glint={glint} />
      </div>
      <span className={styles.edge} data-side="top" />
      <span className={styles.edge} data-side="bottom" />
      {outer && <span className={styles.edge} data-side="end" />}
      <motion.span className={styles.bar} style={bar}>
        <span className={styles.slab} data-side="front" />
        <span className={styles.slab} data-side="back" />
        <span className={styles.slab} data-side="top" />
        <span className={styles.slab} data-side="bottom" />
        {outer && <span className={styles.slab} data-side="end" />}
      </motion.span>
      {!outer && <Strip side={side} j={j + 1} bend={bend} bar={bar} glint={glint} />}
    </motion.div>
  );
}

/**
 * ResearchScan — the template stand-in for a researched step's findings
 * (after a "Scanning your document" reference): a page under a purple bar,
 * a slab through the page, whose light dithers on the paper
 * as it sweeps down it. Between sweeps the page flips over like real paper:
 * a spring turns it (FLIP_SPRING), and the faster it turns the more its
 * edges trail, so it bends as it goes and springs flat as it settles. A
 * title per sweep, each landing as the page passes edge-on. Once the loop
 * has played out it tells the timeline (`onScanned`) so the fields fill in;
 * when they have (`done`), the bar fades and the page settles face-on with
 * a tick. The same every time: no company data.
 * Usage: <ResearchScan lines={task.scanLines} note={scan.note} doneTitle={…} doneNote={…} settled={false} done={false} onScanned={tl.onStreamDone} />
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

  // The page's turn and tilt; the bend follows how fast it turns, through
  // the paper's own spring; the floor shadow is its true width.
  const turn = useMotionValue(0);
  const tilt = useMotionValue(settled ? 0 : TILT);
  const spin = useVelocity(turn);
  const drag = useTransform(spin, (v) => Math.max(-BEND_MAX, Math.min(BEND_MAX, -v * BEND_PER)));
  const bend = useSpring(drag, PAPER_SPRING);
  const shadow = useTransform(turn, (r) => Math.max(0.1, Math.abs(Math.cos((r * Math.PI) / 180))));
  // Each next title lands as the page passes edge-on.
  useMotionValueEvent(turn, "change", (r) => setPhase(Math.min(n - 1, Math.max(0, Math.floor((r + 90) / 180)))));

  // The bar's run (shared with its light on both sides of every strip), a
  // flip between sweeps, and the hand-over to the fields at the end.
  const barY = useMotionValue(settled ? PAGE_H : 0);
  const barA = useMotionValue(settled ? 0 : 1);
  const bar = useMemo(() => ({ y: barY, opacity: barA }), [barY, barA]);
  useEffect(() => {
    if (rest) return;
    const runs = [animate(barY, k.bar.values, { duration: k.total / 1000, ease: "easeInOut", times: k.bar.times })];
    const ids = k.flips.map((t, i) => window.setTimeout(() => runs.push(animate(turn, (i + 1) * 180, FLIP_SPRING)), t));
    ids.push(window.setTimeout(() => onScannedRef.current?.(), k.total));
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      runs.forEach((r) => r.stop());
    };
  }, [rest, k, barY, turn]);
  // Done: the bar fades, and the page turns square to us and stands up.
  useEffect(() => {
    if (!done || settled) return;
    const runs = [
      animate(barA, 0, { duration: 0.3, ease: EASE_STD }),
      animate(turn, k.end, FLIP_SPRING),
      animate(tilt, 0, { duration: 0.6, ease: EASE_OUT }),
    ];
    return () => runs.forEach((r) => r.stop());
  }, [done, settled, k, barA, turn, tilt]);

  const glint = <AnimatePresence>{!rest && <Glint key="glint" y={barY} />}</AnimatePresence>;

  return (
    <div className={styles.scan}>
      <div className={styles.stage} aria-hidden>
        <motion.span className={styles.shadow} style={{ scaleX: shadow }} />
        <motion.div className={styles.page} style={{ rotateY: turn, rotateX: tilt }}>
          <Strip side="left" j={0} bend={bend} bar={bar} glint={glint} />
          <Strip side="right" j={0} bend={bend} bar={bar} glint={glint} />
          {/* Done: a purple tick on the page's corner, just off the front. */}
          <span className={styles.tickPin}>
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
          </span>
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
