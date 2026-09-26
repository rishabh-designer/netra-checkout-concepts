"use client";

import { useCallback, useEffect, useState } from "react";

/** What the research panel needs to know about the current step's timeline. */
export interface ResearchView {
  /** The probe is over: the findings may type out. */
  fetched: boolean;
  /** Revisit / reduced motion / no research: everything shows at rest. */
  instant: boolean;
  /** Every field has resolved (the verdict can land). */
  done: boolean;
  /** The findings have finished typing (the evidence wave starts). */
  onStreamDone: () => void;
  /** Agent Progress verb while probing. */
  progressLabel: string;
  /** The closing readout, filled in, or null for no research. */
  verdict: string | null;
}

interface Options {
  /** Changes whenever a new step's research should start. */
  runKey: string;
  active: boolean;
  instant: boolean;
  /** The step's fields that wait for research (everything but the name). */
  fieldKeys: string[];
  /** How long Agent Progress runs alone before the findings type out. */
  probeMs: number;
  /** Safety net if the findings never report done (panel collapsed). */
  fallbackMs?: number;
}

interface State {
  key: string;
  fetched: boolean;
  evidence: boolean;
  resolved: ReadonlySet<string>;
}

/**
 * useResearchTimeline — the one clock behind a researched step, so every
 * beat lands in order: probe (Agent Progress + sources) → findings type out
 * (`fetched`) → evidence wave (`evidence`, fields resolve one by one via
 * `resolve`) → `done`. Instant steps start at rest. State is keyed by
 * `runKey`, so a new step never flashes the previous step's results.
 * Usage: const tl = useResearchTimeline({ runKey, active: open, instant, fieldKeys, probeMs: 1500 });
 */
export function useResearchTimeline({ runKey, active, instant, fieldKeys, probeMs, fallbackMs = 6000 }: Options) {
  const sig = fieldKeys.join("|");
  const fresh = useCallback(
    (key: string): State => ({ key, fetched: instant, evidence: instant, resolved: new Set(instant ? fieldKeys : []) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instant, sig],
  );
  const [raw, setRaw] = useState<State>(() => fresh(runKey));
  const state = raw.key === runKey ? raw : fresh(runKey);

  const patch = useCallback(
    (p: Partial<State> | ((s: State) => Partial<State>)) =>
      setRaw((prev) => {
        const base = prev.key === runKey ? prev : fresh(runKey);
        return { ...base, ...(typeof p === "function" ? p(base) : p) };
      }),
    [runKey, fresh],
  );

  useEffect(() => {
    if (!active) return;
    if (instant) {
      patch({ fetched: true, evidence: true, resolved: new Set(fieldKeys) });
      return;
    }
    const probe = window.setTimeout(() => patch({ fetched: true }), probeMs);
    const stuck = window.setTimeout(() => patch({ evidence: true }), probeMs + fallbackMs);
    const bail = window.setTimeout(() => patch({ resolved: new Set(fieldKeys) }), probeMs + fallbackMs + 3000);
    return () => {
      window.clearTimeout(probe);
      window.clearTimeout(stuck);
      window.clearTimeout(bail);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, active, instant, sig, probeMs, fallbackMs, patch]);

  const onStreamDone = useCallback(() => patch({ evidence: true }), [patch]);
  const resolve = useCallback(
    (key: string) => patch((s) => (s.resolved.has(key) ? {} : { resolved: new Set([...s.resolved, key]) })),
    [patch],
  );

  return {
    fetched: state.fetched,
    evidence: state.evidence,
    resolved: state.resolved,
    done: fieldKeys.every((k) => state.resolved.has(k)),
    onStreamDone,
    resolve,
  };
}
