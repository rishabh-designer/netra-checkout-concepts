"use client";

import { useRef, useState } from "react";

/** Edits with the same key this close together are one undo step (a slider drag). */
const COALESCE_MS = 700;
const HISTORY_LIMIT = 150;

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export type Update<T> = T | ((previous: T) => T);

/**
 * useUndoable - a value with undo and redo. `set(next, key)` records a step;
 * repeated edits with the same `key` inside a moment merge into one step, so a
 * whole slider drag undoes at once.
 * Usage: const doc = useUndoable(() => start); doc.set(next, "pose:yaw"); doc.undo();
 */
export function useUndoable<T>(initial: () => T) {
  const [history, setHistory] = useState<History<T>>(() => ({ past: [], present: initial(), future: [] }));
  const lastEdit = useRef<{ key: string; at: number } | null>(null);

  const set = (next: Update<T>, key?: string) => {
    // Decide merging outside the updater, so it stays pure (StrictMode runs updaters twice).
    const now = Date.now();
    const previous = lastEdit.current;
    const merge = !!key && previous?.key === key && now - previous.at < COALESCE_MS;
    lastEdit.current = key ? { key, at: now } : null;
    setHistory((h) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(h.present) : next;
      if (Object.is(value, h.present)) return h;
      if (merge) return { ...h, present: value, future: [] };
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: value, future: [] };
    });
  };

  const undo = () => {
    lastEdit.current = null;
    setHistory((h) =>
      h.past.length === 0 ? h : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
    );
  };

  const redo = () => {
    lastEdit.current = null;
    setHistory((h) =>
      h.future.length === 0 ? h : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
    );
  };

  return {
    value: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
