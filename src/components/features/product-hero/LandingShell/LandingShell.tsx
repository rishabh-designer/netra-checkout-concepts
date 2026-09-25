"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ProductPageContent } from "@/types/productPage";
import type { QuotesPreview } from "@/types/quotesPage";
import { Navbar } from "@/components/layout/Navbar";
import { FocusHero } from "../FocusHero";

export interface LandingShellProps {
  content: ProductPageContent;
  /** The current (classic) hero body, server-rendered by the page. */
  classic: ReactNode;
  /** Classic-only decoration (the ring flourish) — hidden in Focus. */
  flourish: ReactNode;
  /** Bottom marquee, shared by both layouts. */
  ticker: ReactNode;
  foregroundClassName: string;
  /** Quotes page skeleton data, drawn behind the quote modal. */
  quotesPreview?: QuotesPreview;
}

/**
 * LandingShell — prototype switch between the "Focus" landing hero (default)
 * and the original classic hero. Clicking Login toggles the two (crossfade);
 * Focus also shows the "Talk to an Expert" button. Usage (in the page):
 * <LandingShell content={c} classic={<main…/>} flourish={<HeroFlourish/>} ticker={…} foregroundClassName={…} />
 */
export function LandingShell({ content, classic, flourish, ticker, foregroundClassName, quotesPreview }: LandingShellProps) {
  const [variant, setVariant] = useState<"classic" | "focus">("focus");
  const focus = variant === "focus";

  return (
    <>
      {!focus && flourish}
      <div className={foregroundClassName}>
        <Navbar
          content={content.nav}
          onLogin={() => setVariant(focus ? "classic" : "focus")}
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={variant}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {focus ? <FocusHero content={content} focus={content.focusHero} quotesPreview={quotesPreview} /> : classic}
          </motion.div>
        </AnimatePresence>
        {ticker}
      </div>
    </>
  );
}
