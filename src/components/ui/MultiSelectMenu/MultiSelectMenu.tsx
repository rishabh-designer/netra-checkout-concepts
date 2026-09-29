"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./MultiSelectMenu.module.css";

export interface MultiSelectMenuProps {
  /** The applied picks (empty = nothing narrowed). */
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  /** Trigger text (e.g. "Filtering: 2 Insurers"). */
  triggerLabel: string;
  resetLabel: string;
  applyLabel: string;
  ariaLabel?: string;
  /** Rendered inside the trigger after its text (chevron, glyphs). */
  adornment?: ReactNode;
  triggerClassName?: string;
}

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * MultiSelectMenu — the DSL multiselect (Figma 3316:83749): a trigger that
 * reads like the field's value, and a floating list of rows with square
 * checkboxes (picked rows tinted lavender), then Reset All and Apply Changes.
 * Picks are a draft until applied; Apply stays disabled until they change.
 * Keyboard: ↑/↓ move, Space ticks, Enter applies, Esc/Tab close.
 * Usage: <MultiSelectMenu value={v} options={opts} onChange={setV} triggerLabel="…" resetLabel="Reset All" applyLabel="Apply Changes" />
 */
export function MultiSelectMenu({ value, options, onChange, triggerLabel, resetLabel, applyLabel, ariaLabel, adornment, triggerClassName }: MultiSelectMenuProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpenState] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);
  const [active, setActive] = useState(-1);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (next) {
      setDraft(value);
      setActive(0);
    }
  };

  // Outside press closes without applying.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const host = rootRef.current?.parentElement;
      if (host && !host.contains(e.target as Node)) setOpenState(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const toggle = (opt: string) => setDraft((d) => (d.includes(opt) ? d.filter((x) => x !== opt) : [...d, opt]));
  const changed = !same(draft, value);
  const apply = () => {
    onChange(options.filter((o) => draft.includes(o)));
    setOpenState(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      setOpenState(false);
    } else if (e.key === "Tab") {
      if (open) setOpenState(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === " ") {
      e.preventDefault();
      if (open && active >= 0) toggle(options[active]);
      else setOpen(true);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open) {
        if (changed) apply();
      } else setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        type="button"
        role="combobox"
        className={cn(styles.trigger, triggerClassName)}
        aria-label={ariaLabel ?? triggerLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
      >
        <span className={styles.text} data-tooltip-overflow>{triggerLabel}</span>
        {adornment}
      </button>

      {open && (
        <div className={styles.panel}>
          <ul id={listId} role="listbox" aria-multiselectable className={styles.list}>
            {options.map((opt, i) => {
              const picked = draft.includes(opt);
              return (
                <li
                  key={opt}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={picked}
                  className={styles.option}
                  data-picked={picked || undefined}
                  data-active={i === active || undefined}
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => toggle(opt)}
                >
                  <span className={styles.label} data-tooltip-overflow>{opt}</span>
                  {picked ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/media/checkbox-checked.svg" alt="" aria-hidden className={styles.checked} />
                  ) : (
                    <span className={styles.box} aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
          <div className={styles.foot}>
            <button type="button" className={styles.reset} onPointerDown={(e) => e.preventDefault()} onClick={() => setDraft([])} disabled={draft.length === 0}>
              {resetLabel}
            </button>
            <button type="button" className={styles.apply} onPointerDown={(e) => e.preventDefault()} onClick={apply} disabled={!changed}>
              {applyLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
