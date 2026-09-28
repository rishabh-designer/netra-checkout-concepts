"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CompareRow, CompareViewContent, FeatureTab, QuoteCardData } from "@/types/quotesPage";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { BackButton } from "@/components/ui/BackButton";
import { SquareCheckbox } from "@/components/ui/SquareCheckbox";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { QuoteCardLabels } from "../QuoteCard";
import styles from "./CompareView.module.css";

export interface CompareViewProps {
  open: boolean;
  content: CompareViewContent;
  /** The picked quotes, in the order they were added. */
  quotes: QuoteCardData[];
  /** Columns in the table: the compare bar's max, open ones invite another pick. */
  columns: number;
  labels: QuoteCardLabels;
  onClose: () => void;
  onRemove: (quote: QuoteCardData) => void;
  /** A column's price / Get Quote button (same action as its card). */
  onSelect: (quote: QuoteCardData) => (() => void) | undefined;
}

const keyOf = (q: QuoteCardData) => (q.gold ? "gold" : q.insurer);

/** Section mark: blue tick, red cross or purple dot (as the policy modal). */
function Mark({ tone }: { tone: FeatureTab["tone"] }) {
  if (tone === "covered") return <SquareCheckbox tone="info" state="checked" size={16} />;
  if (tone === "excluded") {
    return (
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
        <rect width="16" height="16" rx="4" fill="var(--color-error)" />
        <path d="m5.3 5.3 5.4 5.4m0-5.4-5.4 5.4" stroke="var(--color-label-inverse)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return <span className={styles.dot} aria-hidden />;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden className={styles.chevron} data-open={open || undefined}>
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * CompareView — Compare Now's full view: the picked quotes side by side, one
 * column each, over the page below the header. A sticky head (back, title,
 * a tile per quote with its logo, name and price button;
 * open columns go back to pick another) over two tabs, What's Covered and
 * What's Not Covered. Each tab stacks collapsible sections of rows; a row's
 * title expands its explainer, and Show Differences Only hides rows where
 * every quote reads the same. Same rows for every quote, no ranking (IRDAI).
 * Usage: <CompareView open={o} content={c} quotes={qs} columns={3} labels={l} … />
 */
export function CompareView({ open, content, quotes, columns, labels, onClose, onRemove, onSelect }: CompareViewProps) {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState(content.tabs[0].key);
  const [diffOnly, setDiffOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [top, setTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  // Sits under the page header, which stays in view.
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => setTop(Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0));
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open]);

  // Each opening starts at the top of the first tab, focus on Back; Esc closes.
  useEffect(() => {
    if (!open) return;
    setTab(content.tabs[0].key); // eslint-disable-line react-hooks/set-state-in-effect -- each opening starts on the first tab
    scrollRef.current?.scrollTo({ top: 0 });
    const id = window.setTimeout(() => backRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, content.tabs, onClose]);

  const valueOf = (q: QuoteCardData, row: CompareRow): string => {
    switch (row.source) {
      case "premium":
        return q.price ?? content.onRequestLabel;
      case "sumInsured":
        return q.sumInsured;
      case "territory":
        return q.territory && labels.territory ? labels.territory[q.territory] : content.notIncludedLabel;
      case "top":
        return (q.coverages ?? q.policy?.top ?? []).join("|");
      default:
        return q.policy?.compare?.[row.key] ?? content.notIncludedLabel;
    }
  };

  const cell = (q: QuoteCardData, row: CompareRow): ReactNode => {
    if (row.source === "top") {
      const list = q.coverages ?? q.policy?.top ?? [];
      return list.length ? (
        <ul className={styles.topList}>
          {list.map((c) => (
            <li key={c}>
              <SquareCheckbox tone="info" state="checked" size={12} />
              {c}
            </li>
          ))}
        </ul>
      ) : (
        <span className={styles.muted}>{content.notIncludedLabel}</span>
      );
    }
    const v = valueOf(q, row);
    if (row.source === "territory" && q.territory) {
      return <span className={styles.territory}>{v}</span>;
    }
    const muted = v === content.notIncludedLabel || v === content.onRequestLabel;
    return <span className={muted ? styles.muted : row.source === "premium" ? styles.price : undefined}>{v}</span>;
  };

  const sections = content.sections
    .filter((s) => s.tab === tab)
    .map((s) => ({
      ...s,
      rows: diffOnly && quotes.length > 1 ? s.rows.filter((r) => new Set(quotes.map((q) => valueOf(q, r))).size > 1) : s.rows,
    }))
    .filter((s) => s.rows.length > 0);

  const toggle = (list: string[], key: string) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  const slots = Array.from({ length: columns }, (_, i) => quotes[i]);
  const grid = { "--cols": columns, top } as CSSProperties;

  const view = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="compare-view"
          ref={scrollRef}
          className={styles.layer}
          style={grid}
          role="dialog"
          aria-modal="true"
          aria-label={content.title}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.inner}>
            {/* Sticky head: back + title, a tile per column, then the tabs. */}
            <div className={styles.head}>
              <div className={styles.row}>
                <div className={styles.intro}>
                  <BackButton ref={backRef} onClick={onClose} className={styles.back}>
                    {content.backLabel}
                  </BackButton>
                  <h2 className={styles.title}>{content.title}</h2>
                  <p className={styles.subtitle}>{content.subtitle.replace("{count}", String(quotes.length))}</p>
                </div>
                {slots.map((q, i) =>
                  q ? (
                    <article key={keyOf(q)} className={styles.tile} data-tone={q.gold ? "gold" : undefined}>
                      <div className={styles.tags}>
                        {q.gold && (
                          <span className={styles.tag} data-tone="gold">
                            <EyeIcon size={10} color="var(--color-brand-secondary)" />
                            {labels.poweredBy}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        aria-label={content.removeLabel.replace("{insurer}", q.insurer)}
                        onClick={() => onRemove(q)}
                      >
                        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden>
                          <path d="m3.5 3.5 5 5m0-5-5 5" stroke="var(--color-label-hint)" strokeWidth="1" strokeLinecap="round" />
                        </svg>
                      </button>
                      {q.logoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={q.logoSrc} alt="" aria-hidden className={styles.logo} />
                      ) : (
                        <span className={styles.logoSlot} aria-hidden />
                      )}
                      <p className={styles.insurer}>{q.insurer}</p>
                      <button
                        type="button"
                        className={q.price || q.gold ? styles.buttonFilled : styles.buttonOutline}
                        onClick={onSelect(q)}
                      >
                        {q.price ?? labels.getQuote}
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                          <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </article>
                  ) : (
                    <button key={`open-${i}`} type="button" className={styles.add} onClick={onClose}>
                      <span className={styles.addIcon} aria-hidden>
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                          <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </span>
                      {content.addLabel}
                    </button>
                  ),
                )}
              </div>

              <div className={styles.bar}>
                <div className={styles.tabs} role="tablist" aria-label={content.title}>
                  {content.tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={t.key === tab}
                      className={styles.tab}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <ToggleSwitch checked={diffOnly} onChange={setDiffOnly} label={content.differencesLabel} size="sm" />
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                className={styles.sections}
                role="table"
                aria-label={content.title}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {sections.map((s) => {
                  const shut = collapsed.includes(s.key);
                  return (
                    <section key={s.key} className={styles.section} role="rowgroup">
                      <button
                        type="button"
                        className={styles.sectionHead}
                        aria-expanded={!shut}
                        onClick={() => setCollapsed((c) => toggle(c, s.key))}
                      >
                        <span className={styles.sectionMark}>
                          <Mark tone={s.tone} />
                        </span>
                        <span className={styles.sectionTitle}>{s.title}</span>
                        <Chevron open={!shut} />
                      </button>
                      {!shut &&
                        s.rows.map((r) => {
                          const id = `${s.key}.${r.key}`;
                          const more = expanded.includes(id);
                          return (
                            <div key={r.key} className={styles.row} data-line role="row">
                              <div className={styles.rowHead} role="rowheader">
                                {r.body ? (
                                  <button
                                    type="button"
                                    className={styles.rowTitle}
                                    aria-expanded={more}
                                    aria-label={`${r.title}, ${more ? content.collapseLabel : content.expandLabel}`}
                                    onClick={() => setExpanded((e) => toggle(e, id))}
                                  >
                                    {r.title}
                                    <Chevron open={more} />
                                  </button>
                                ) : (
                                  <span className={styles.rowTitle}>{r.title}</span>
                                )}
                                {more && <p className={styles.rowBody}>{r.body}</p>}
                              </div>
                              {slots.map((q, i) => (
                                <Fragment key={q ? keyOf(q) : `open-${i}`}>
                                  <div className={styles.cell} role="cell">
                                    {q ? cell(q, r) : null}
                                  </div>
                                </Fragment>
                              ))}
                            </div>
                          );
                        })}
                    </section>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document === "undefined" ? null : createPortal(view, document.body);
}
