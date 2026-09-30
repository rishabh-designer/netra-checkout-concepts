"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { BreadcrumbItem } from "@/types/productPage";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { cn } from "@/lib/utils";
import styles from "./BreadcrumbTrail.module.css";

export interface BreadcrumbTrailProps {
  items?: BreadcrumbItem[];
  /** ikkat = grey diamond separators (landing); slash = "/" separators in
   *  muted purple with a purple current page (Quotes feed, Figma 564:32971). */
  variant?: "ikkat" | "slash";
  /** Makes the current page a toggle button (the Quotes page swaps its card
   *  view from LIVE QUOTES); `currentPressed` is its state. */
  onCurrentClick?: () => void;
  currentPressed?: boolean;
  /** The "…" button's accessible name and tooltip. */
  expandLabel?: string;
}

/** Which crumbs stay when the trail is folded: the first, then "…", then
 *  the last two (HOME / … / LIVE QUOTES / REQUEST QUOTE). */
function foldAt(n: number): { head: number; tail: number } | null {
  if (n <= 3) return null;
  return { head: 1, tail: 2 };
}

/**
 * BreadcrumbTrail — uppercase crumb list separated by grey ikkat diamonds (or
 * "/" in the slash variant); the last item is the current page. A trail too
 * long for one line folds its middle behind "…"; tapping it shows the whole
 * path (wrapping on phones).
 * Usage: <BreadcrumbTrail items={crumbs} variant="slash" />
 */
export function BreadcrumbTrail({
  items = [{ label: "HOME", href: "#" }, { label: "Current Page" }],
  variant = "ikkat",
  onCurrentClick,
  currentPressed,
  expandLabel = "Show Full Path",
}: BreadcrumbTrailProps) {
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const fold = foldAt(items.length);

  // Fold when the whole trail, laid out on one line (a hidden copy), is wider
  // than the room; re-checked as the room changes. Before paint, so no flash.
  useLayoutEffect(() => {
    const nav = navRef.current;
    const copy = measureRef.current;
    if (!nav || !copy || !fold) return;
    const check = () => setFits(copy.scrollWidth <= nav.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [fold, items]);

  const sep = variant === "slash" ? (
    <span className={styles.slashSep} aria-hidden>/</span>
  ) : (
    <IkkatMark color="var(--color-label-tertiary)" className={styles.sep} />
  );

  const crumb = (item: BreadcrumbItem, i: number) => {
    const isLast = i === items.length - 1;
    if (isLast && onCurrentClick) {
      return (
        <button type="button" className={cn(styles.current, styles.currentButton)} aria-current="page" aria-pressed={currentPressed} onClick={onCurrentClick}>
          {item.label}
        </button>
      );
    }
    if (isLast) {
      return (
        <span className={styles.current} aria-current="page">
          {item.label}
        </span>
      );
    }
    return (
      <a href={item.href} className={styles.crumb}>
        {item.label}
      </a>
    );
  };

  const entry = (key: string, first: boolean, body: ReactNode) => (
    <span key={key} className={styles.entry}>
      {!first && sep}
      {body}
    </span>
  );

  const folded = fold && !fits && !expanded;
  const shown: ReactNode[] = folded
    ? [
        ...items.slice(0, fold.head).map((item, i) => entry(item.label, i === 0, crumb(item, i))),
        entry(
          "…",
          false,
          <button type="button" className={styles.more} aria-label={expandLabel} data-tooltip={expandLabel} onClick={() => setExpanded(true)}>
            …
          </button>,
        ),
        ...items.slice(items.length - fold.tail).map((item, j) => {
          const i = items.length - fold.tail + j;
          return entry(item.label, false, crumb(item, i));
        }),
      ]
    : items.map((item, i) => entry(item.label, i === 0, crumb(item, i)));

  return (
    <nav ref={navRef} aria-label="Breadcrumb" className={cn(styles.trail, variant === "slash" && styles.slash)} data-folded={folded || undefined}>
      {shown}
      {/* The whole trail on one line, out of sight: what "fits" is measured on. */}
      {fold && (
        <span ref={measureRef} className={styles.measure} aria-hidden inert>
          {items.map((item, i) => entry(item.label, i === 0, crumb(item, i)))}
        </span>
      )}
    </nav>
  );
}
