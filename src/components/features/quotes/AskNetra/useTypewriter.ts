"use client";

import { useEffect, useState } from "react";

/** Per letter typed (plus up to TYPE_JITTER, so it reads as a hand), per
 *  letter erased, the hold on a whole line and the beat on an empty field. */
const TYPE_MS = 65;
const TYPE_JITTER = 30;
const ERASE_MS = 32;
const HOLD_MS = 1600;
const GAP_MS = 320;
const START_MS = 600;

/** A shuffled copy (Fisher-Yates). */
function shuffle(lines: string[]): string[] {
  const out = [...lines];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * useTypewriter — types the lines out one after another in random order, as
 * if someone were asking them: letter by letter, a hold on the whole line,
 * a quicker erase, then the next. A full round goes by before any line comes
 * back, and never the same one twice running. Starts empty (so the server
 * render matches) and does nothing while `run` is false.
 * Usage: const { text, typing } = useTypewriter(questions, !reduced);
 */
export function useTypewriter(lines: string[], run: boolean): { text: string; typing: boolean } {
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  // Keyed on the words, so a fresh array of the same lines doesn't restart it.
  const key = lines.join("\n");

  useEffect(() => {
    const all = key ? key.split("\n") : [];
    if (!run || !all.length) return;
    let timer = 0;
    let queue: string[] = [];
    let last = "";
    const next = () => {
      if (!queue.length) {
        queue = shuffle(all);
        if (queue.length > 1 && queue[0] === last) queue.push(queue.shift()!);
      }
      last = queue.shift()!;
      return last;
    };
    const type = (line: string, n: number) => {
      setText(line.slice(0, n));
      setTyping(n < line.length);
      timer = n < line.length
        ? window.setTimeout(() => type(line, n + 1), TYPE_MS + Math.random() * TYPE_JITTER)
        : window.setTimeout(() => erase(line, n - 1), HOLD_MS);
    };
    const erase = (line: string, n: number) => {
      setText(line.slice(0, n));
      setTyping(n > 0);
      timer = n > 0
        ? window.setTimeout(() => erase(line, n - 1), ERASE_MS)
        : window.setTimeout(() => type(next(), 1), GAP_MS);
    };
    timer = window.setTimeout(() => type(next(), 1), START_MS);
    return () => window.clearTimeout(timer);
  }, [key, run]);

  return { text, typing };
}
