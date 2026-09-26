"use client";

import { Fragment } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CompanySearchContent } from "@/types/productPage";
import { FilledCheck } from "@/components/ui/InteractiveInput/icons";
import styles from "./CompanySuggest.module.css";

export interface CompanyOption {
  name: string;
  /** "best" sits above the divider; "record" rows are MCA registry names. */
  kind: "best" | "record";
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** The suggestions for a typed name: the first known company any of whose
 *  names contain it, as its best match then its MCA records. Empty below
 *  `minChars` or with no match (a company with no records gets no list). */
export function findCompanyOptions(query: string, search: CompanySearchContent): CompanyOption[] {
  const q = normalize(query);
  if (q.length < search.minChars) return [];
  const hit = search.companies.find((c) => [c.best, ...c.records].some((n) => normalize(n).includes(q)));
  if (!hit) return [];
  return [{ name: hit.best, kind: "best" }, ...hit.records.map((name) => ({ name, kind: "record" as const }))];
}

export interface CompanySuggestProps {
  id: string;
  open: boolean;
  options: CompanyOption[];
  /** The highlighted row (Enter picks it); its tick turns green. */
  active: number;
  recordsLabel: string;
  onPick: (name: string) => void;
  onHover: (index: number) => void;
}

/**
 * CompanySuggest — the type-ahead under the landing's company-name field, so
 * the customer picks their legal entity before continuing instead of us
 * guessing. The best match leads; a divider labelled "MCA Records" heads the
 * registry names. Rows mirror the DSL SelectMenu (label left, round tick
 * right, green on the highlighted row). The host input owns the keyboard.
 * Usage: <CompanySuggest id={id} open={o} options={opts} active={i} recordsLabel="MCA Records" onPick={pick} onHover={setI} />
 */
export function CompanySuggest({ id, open, options, active, recordsLabel, onPick, onHover }: CompanySuggestProps) {
  const reduced = useReducedMotion();
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
          {options.map((opt, i) => (
            <Fragment key={`${opt.kind}-${opt.name}`}>
              {opt.kind === "record" && options[i - 1]?.kind !== "record" && (
                <li role="presentation" className={styles.divider}>
                  <span className={styles.dividerLabel}>{recordsLabel}</span>
                  <span className={styles.dividerLine} />
                </li>
              )}
              <li
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                className={styles.option}
                data-active={i === active || undefined}
                onPointerEnter={() => onHover(i)}
                onPointerDown={(e) => e.preventDefault()} // keep focus in the input
                onClick={() => onPick(opt.name)}
              >
                <span className={styles.label}>{opt.name}</span>
                <FilledCheck color={i === active ? "var(--color-success)" : "var(--color-input-stroke)"} />
              </li>
            </Fragment>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
