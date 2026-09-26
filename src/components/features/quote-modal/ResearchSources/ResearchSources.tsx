"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { QuoteResearchSource } from "@/types/productPage";
import { RingSweep } from "@/components/ui/RingSweep";
import styles from "./ResearchSources.module.css";

export interface ResearchSourcesProps {
  sources: QuoteResearchSource[];
  /** The engine is still probing: run the query sequence. */
  scanning: boolean;
  /** Show every source already returned (revisit / reduced motion). */
  settled: boolean;
  /** How long the probe runs; the last source answers just inside it. */
  probeMs?: number;
}

type ChipState = "pending" | "querying" | "returned";

const FIRST_RETURN_MS = 350; // the first source answers here…
const LAST_RETURN_MS = 1400; // …the last by here (inside the 1.5s probe)
const QUERY_MS = 300; // each source is "querying" this long before it answers

/** When source i answers, spread evenly between the first and last return
 *  (both scaled down for a shorter probe, e.g. Case C's quick "no records"). */
const returnAt = (i: number, n: number, last: number) => {
  const first = Math.min(FIRST_RETURN_MS, last / 4);
  return first + (n > 1 ? (i * (last - first)) / (n - 1) : 0);
};

/** Result glyphs: ✓ hit, ◐ partial, – no match (12px, token colours). */
function Glyph({ result }: { result: QuoteResearchSource["result"] }) {
  if (result === "hit")
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
        <path d="m3 6.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (result === "partial")
    return (
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 2a4 4 0 0 1 0 8Z" fill="currentColor" />
      </svg>
    );
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
      <path d="M3.5 6h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * ResearchSources — the sources the engine checks, lit in turn while it
 * scans: each chip goes pending (faint) → querying (a tiny sweeping ring) →
 * returned (✓ hit, ◐ partial, – no match), the last answering just inside
 * the probe. Afterwards the row stays as a compact record of what was
 * checked.
 * Usage: <ResearchSources sources={search.sources} scanning={!fetched} settled={instant} />
 */
export function ResearchSources({ sources, scanning, settled, probeMs = 1500 }: ResearchSourcesProps) {
  const last = Math.min(LAST_RETURN_MS, probeMs - 100);
  const [elapsed, setElapsed] = useState(settled || !scanning ? Infinity : 0);

  useEffect(() => {
    if (settled || !scanning) return setElapsed(Infinity);
    const started = performance.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      const t = performance.now() - started;
      setElapsed(t);
      if (t > last) window.clearInterval(id);
    }, 50);
    return () => window.clearInterval(id);
  }, [scanning, settled, last]);

  const stateOf = (i: number): ChipState => {
    const at = returnAt(i, sources.length, last);
    return elapsed >= at ? "returned" : elapsed >= at - Math.min(QUERY_MS, last / 3) ? "querying" : "pending";
  };

  return (
    <ul className={styles.sources}>
      {sources.map((s, i) => {
        const state = stateOf(i);
        return (
          <motion.li
            key={s.label}
            className={styles.chip}
            data-state={state}
            data-result={state === "returned" ? s.result : undefined}
            animate={state === "returned" && !settled ? { scale: [0.92, 1.04, 1] } : undefined}
            transition={{ type: "tween", duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
          >
            <span className={styles.icon}>
              {state === "querying" ? <RingSweep size={10} /> : state === "returned" ? <Glyph result={s.result} /> : <span className={styles.dot} />}
            </span>
            {s.label}
          </motion.li>
        );
      })}
    </ul>
  );
}
