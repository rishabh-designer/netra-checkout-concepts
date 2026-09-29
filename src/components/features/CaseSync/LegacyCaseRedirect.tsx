"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuoteFlow } from "@/lib/quote-flow";
import { withCase } from "@/lib/case-route";

/**
 * LegacyCaseRedirect — an old link without a case (/…/quotes) moves to the
 * saved flow's case (Case C when there's none), keeping the rest of the path.
 * Usage: rendered by the old quotes / checkout routes.
 */
export function LegacyCaseRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { result, hydrated } = useQuoteFlow();
  useEffect(() => {
    if (hydrated) router.replace(withCase(pathname, result?.caseId ?? "C"));
  }, [hydrated, pathname, result, router]);
  return null;
}
