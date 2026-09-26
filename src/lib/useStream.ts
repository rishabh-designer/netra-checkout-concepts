"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Characters revealed per second (beui.dev "Streaming Response"). */
export const STREAM_CPS = 110;

export interface Stream {
  /** The visible slice of piece `i`. */
  reveal: (i: number) => string;
  /** Piece `i` has begun — mount its structure (paragraph, mark, list item…). */
  started: (i: number) => boolean;
  /** Piece `i` is fully revealed. */
  finished: (i: number) => boolean;
  /** Everything has arrived. */
  done: boolean;
}

/**
 * useStream — structure-preserving text streaming, after beui.dev's
 * Streaming Response: one character cursor advances through an ordered list
 * of pieces at ~110 chars/s (rAF-timed, so it's frame-rate independent). Each
 * piece renders its visible slice and its element only mounts once the cursor
 * reaches it, so links, highlights and list items never reflow mid-stream.
 * Starts when `active` turns true; reduced motion shows everything at once.
 * Usage: const s = useStream([intro, highlight, outro], fetched);
 *        {s.reveal(0)}{s.started(1) && <mark>{s.reveal(1)}</mark>}{s.reveal(2)}
 */
export function useStream(pieces: string[], active = true, cps = STREAM_CPS): Stream {
  const reduced = useReducedMotion() ?? false;
  const key = pieces.join("\u0000");
  const { starts, total } = useMemo(() => {
    const s: number[] = [];
    let t = 0;
    for (const p of pieces) {
      s.push(t);
      t += p.length;
    }
    return { starts: s, total: t };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [cursor, setCursor] = useState(reduced ? total : 0);

  useEffect(() => {
    if (!active) {
      setCursor(0);
      return;
    }
    if (reduced) {
      setCursor(total);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(total, Math.floor(((now - startedAt) / 1000) * cps));
      setCursor(next);
      if (next < total) frame = requestAnimationFrame(tick);
    };
    setCursor(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, total, cps, key]);

  return {
    reveal: (i) => pieces[i]?.slice(0, Math.max(0, cursor - starts[i])) ?? "",
    started: (i) => cursor > starts[i],
    finished: (i) => cursor >= starts[i] + (pieces[i]?.length ?? 0),
    done: cursor >= total,
  };
}
