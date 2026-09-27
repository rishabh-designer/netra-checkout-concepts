"use client";

import { Fragment, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CompanySearchContent } from "@/types/productPage";
import { ErrorMark, FilledCheck } from "@/components/ui/InteractiveInput/icons";
import styles from "./CompanySuggest.module.css";

/**
 * One row of the type-ahead:
 * - "new": the disabled lead row ("No Result for …"), whose link switches to
 *   an MCA search request for the typed name;
 * - "record": a matched MCA entry (its known name, and what it's registered as);
 * - "request": the typed name itself, sent as a new-company search request.
 */
export type CompanyOption =
  | { kind: "new" }
  | { kind: "record"; name: string; registered: string; legalName: string }
  | { kind: "request"; name: string };

/** "search" lists the registry; "request" echoes what's typed as a new company. */
export type CompanySuggestMode = "search" | "request";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** The rows for a typed name. Search: the "No Result" row, then every MCA
 *  record whose names contain the query. Request: the typed name alone.
 *  Empty below `minChars`. */
export function findCompanyOptions(query: string, search: CompanySearchContent, mode: CompanySuggestMode): CompanyOption[] {
  const q = normalize(query);
  if (q.length < search.minChars) return [];
  if (mode === "request") return [{ kind: "request", name: query.trim() }];
  const records = search.companies
    .filter((c) => [c.name, c.registered, c.legalName].some((n) => normalize(n).includes(q)))
    .map((c) => ({ kind: "record" as const, ...c }));
  return [{ kind: "new" }, ...records];
}

/** The row Enter picks by default: the first match, else the lead row. */
export function defaultCompanyOption(options: CompanyOption[]): number {
  return Math.max(0, options.findIndex((o) => o.kind !== "new"));
}

export interface CompanySuggestProps {
  id: string;
  open: boolean;
  /** What's been typed (echoed in the "No Result" row). */
  query: string;
  options: CompanyOption[];
  /** The highlighted row (Enter picks it); its tick turns green. */
  active: number;
  content: CompanySearchContent;
  onPick: (option: CompanyOption) => void;
  onHover: (index: number) => void;
}

/**
 * CompanySuggest — the type-ahead under the landing's company-name field, so
 * the customer picks their registered entity instead of us guessing. It
 * leads with a disabled "No Result for “…”. Enter New Company?" row, then
 * "MCA Records": each match with its registered name. "Enter New Company?"
 * turns the list into an "MCA Search Request" that echoes the name as it's
 * typed. The host input owns the keyboard.
 * Usage: <CompanySuggest id={id} open={o} query={q} options={opts} active={i} content={search} onPick={pick} onHover={setI} />
 */
export function CompanySuggest({ id, open, query, options, active, content, onPick, onHover }: CompanySuggestProps) {
  const reduced = useReducedMotion();
  const keepFocus = (e: PointerEvent) => e.preventDefault(); // the input keeps focus

  return (
    <AnimatePresence>
      {open && options.length > 0 && (
        <motion.ul
          id={id}
          role="listbox"
          className={styles.list}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {options.map((opt, i) => {
            const on = i === active;
            const heading =
              opt.kind === "record" && options[i - 1]?.kind !== "record"
                ? content.recordsLabel
                : opt.kind === "request"
                  ? content.requestLabel
                  : null;
            return (
              <Fragment key={opt.kind === "new" ? "new" : `${opt.kind}-${opt.name}`}>
                {heading && (
                  <li role="presentation" className={styles.divider}>
                    <span className={styles.dividerLabel}>{heading}</span>
                    <span className={styles.dividerLine} />
                  </li>
                )}
                {opt.kind === "new" ? (
                  <li
                    id={`${id}-${i}`}
                    role="option"
                    aria-selected={on}
                    aria-disabled
                    className={styles.option}
                    data-kind="new"
                    onPointerEnter={() => onHover(i)}
                    onPointerDown={keepFocus}
                  >
                    <span className={styles.label}>
                      {content.noResultLabel.replace("{query}", query.trim())}{" "}
                      <button type="button" className={styles.newLink} onClick={() => onPick(opt)}>
                        {content.newCompanyLabel}
                      </button>
                    </span>
                    <ErrorMark color="var(--color-input-stroke)" />
                  </li>
                ) : (
                  <li
                    id={`${id}-${i}`}
                    role="option"
                    aria-selected={on}
                    className={styles.option}
                    data-kind={opt.kind}
                    data-active={on || undefined}
                    onPointerEnter={() => onHover(i)}
                    onPointerDown={keepFocus}
                    onClick={() => onPick(opt)}
                  >
                    <span className={styles.stack}>
                      <span className={styles.label}>{opt.name}</span>
                      {opt.kind === "record" && (
                        <span className={styles.registered}>
                          <span className={styles.registeredLabel}>{content.registeredLabel}</span> {opt.registered}
                        </span>
                      )}
                    </span>
                    <FilledCheck color={on ? "var(--color-success)" : "var(--color-input-stroke)"} />
                  </li>
                )}
              </Fragment>
            );
          })}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
