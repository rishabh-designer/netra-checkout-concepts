"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { DemoNoticeContent, DemoNoticeKey } from "@/types/demoNotice";
import { Toast } from "@/components/ui/Toast";

const DemoNoticeContext = createContext<((key: DemoNoticeKey) => void) | null>(null);

/**
 * DemoNoticeProvider — one top-right alert for clicks the prototype doesn't
 * take anywhere yet (Ask BimaNetra, Find a Quote…), so nothing is a dead
 * click. `useDemoNotice()` returns `notify(key)`; any `<a href="#">` (nav,
 * breadcrumbs) shows the generic "link" notice instead of jumping to the top.
 * Mounted once in the root layout.
 * Usage: const notify = useDemoNotice(); <button onClick={() => notify("findQuote")} />
 */
export function DemoNoticeProvider({ content, children }: { content: DemoNoticeContent; children: ReactNode }) {
  const [key, setKey] = useState<DemoNoticeKey | null>(null);
  const [open, setOpen] = useState(false);
  const notify = useCallback((k: DemoNoticeKey) => {
    setOpen(false);
    setKey(k);
    requestAnimationFrame(() => setOpen(true));
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href="#"]');
      if (!a) return;
      e.preventDefault();
      notify("link");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [notify]);

  const notice = key ? content[key] : null;
  return (
    <DemoNoticeContext.Provider value={notify}>
      {children}
      <Toast open={open && !!notice} title={notice?.title ?? ""} description={notice?.description} tone={notice?.tone} onClose={close} />
    </DemoNoticeContext.Provider>
  );
}

/** `notify(key)`: show the alert for a not-yet-built click. */
export function useDemoNotice() {
  const ctx = useContext(DemoNoticeContext);
  if (!ctx) throw new Error("useDemoNotice must be used within a DemoNoticeProvider");
  return ctx;
}
