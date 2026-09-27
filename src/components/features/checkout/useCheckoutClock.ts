"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "bimanetra.checkoutClock";

interface Clock {
  start: number;
  /** Set once the final CTA is pressed: the timer freezes there. */
  stop?: number;
}

function read(): Clock | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Clock) : null;
  } catch {
    return null;
  }
}

function write(clock: Clock) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(clock));
  } catch {
    /* storage unavailable: the clock just lives in memory */
  }
}

/** Start the next checkout's timer from zero (called when a quote is chosen). */
export function resetCheckoutClock() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing stored */
  }
}

/**
 * useCheckoutClock — the "Preparing Checkout" timer. It starts on the first
 * checkout step and keeps counting across every step (and reloads, via
 * sessionStorage) until `stop()` is called by the final CTA.
 * Usage: const clock = useCheckoutClock(); <AgentProgress elapsedSeconds={clock.seconds} running={clock.running} />
 */
export function useCheckoutClock() {
  // Checkout renders only on the client (after the flow hydrates), so the
  // saved clock can be read up front.
  const [clock, setClock] = useState<Clock>(() => read() ?? { start: Date.now() });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!read()) write(clock);
  }, [clock]);

  const running = clock.stop === undefined;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [running]);

  const stop = useCallback(() => {
    setClock((c) => {
      if (c.stop !== undefined) return c;
      const next = { ...c, stop: Date.now() };
      write(next);
      return next;
    });
  }, []);

  const end = clock.stop ?? now;
  return { seconds: Math.max(0, (end - clock.start) / 1000), running, stop };
}
