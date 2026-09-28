"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FieldTips } from "@/types/fieldTips";

const FieldTipsContext = createContext<FieldTips>({});

/**
 * FieldTipsProvider — the shared info-icon line for each form field, so a
 * field (phone, PAN…) explains itself the same way wherever it appears.
 * Mounted once in the root layout.
 * Usage: const tip = useFieldTip(field.key);
 */
export function FieldTipsProvider({ tips, children }: { tips: FieldTips; children: ReactNode }) {
  return <FieldTipsContext.Provider value={tips}>{children}</FieldTipsContext.Provider>;
}

/** The info tooltip for a field key, if there is one. */
export function useFieldTip(key: string) {
  return useContext(FieldTipsContext)[key];
}
