"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { QuoteModalProps } from "./QuoteModal";

const load = () => import("./QuoteModal").then((m) => m.QuoteModal);
const Modal = dynamic(load, { ssr: false });

/** Fetch the modal's chunk ahead of the click (e.g. when the form is focused). */
export function preloadQuoteModal() {
  void load();
}

/**
 * LazyQuoteModal — the quote modal, kept out of the first page load. Its
 * chunk (the whole Intelligence Engine) is fetched once the browser is idle
 * or on `preloadQuoteModal()`, and it mounts on first open, then stays
 * mounted so later closes still animate out.
 * Usage: <QuoteModal open={open} … /> (the barrel exports this as QuoteModal)
 */
export function LazyQuoteModal(props: QuoteModalProps) {
  const [armed, setArmed] = useState(props.open);
  if (props.open && !armed) setArmed(true);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(preloadQuoteModal);
    return () => cancel(id);
  }, []);

  return armed ? <Modal {...props} /> : null;
}
