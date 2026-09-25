"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FilledCheck } from "@/components/ui/InteractiveInput/icons";
import styles from "./SelectMenu.module.css";

export interface SelectMenuProps {
  id?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  /** Reports open/close so the host field can theme itself (chevron flip). */
  onOpenChange?: (open: boolean) => void;
}

/**
 * SelectMenu — the DSL dropdown: a trigger that reads like the field's value
 * text, and a floating option list under the field. Every row carries a round
 * tick on the right — muted grey, green on the selected option. Keyboard:
 * ↑/↓ move, Enter/Space pick, Esc/Tab close (Esc never reaches the modal).
 * Rendered by InteractiveInput for control="select"; the list anchors to the
 * nearest positioned ancestor (the field wrapper).
 * Usage: <SelectMenu value={v} options={opts} onChange={setV} placeholder="Select…" />
 */
export function SelectMenu({
  id,
  value,
  options,
  placeholder = "Select…",
  onChange,
  disabled = false,
  ariaLabel,
  onOpenChange,
}: SelectMenuProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpenState] = useState(false);
  const [active, setActive] = useState(-1);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
    if (next) setActive(Math.max(0, options.indexOf(value)));
  };

  // Outside press closes; the list is brought into view inside the form's
  // scroll area when it opens near the bottom.
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const onDown = (e: PointerEvent) => {
      const host = rootRef.current?.parentElement;
      if (host && !host.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (opt: string) => {
    onChange?.(opt);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "Escape" && open) {
      e.stopPropagation(); // close the list only, not the modal
      setOpen(false);
    } else if (e.key === "Tab") {
      if (open) setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && active >= 0) pick(options[active]);
      else setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        id={id}
        type="button"
        role="combobox"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        data-empty={value ? undefined : true}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
      >
        {value || placeholder}
      </button>

      {open && (
        <ul ref={listRef} id={listId} role="listbox" className={styles.list}>
          {options.map((opt, i) => {
            const selected = opt === value;
            return (
              <li
                key={opt}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                className={styles.option}
                data-active={i === active || undefined}
                onPointerEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()} // keep focus on the trigger
                onClick={() => pick(opt)}
              >
                <span className={styles.label}>{opt}</span>
                <FilledCheck color={selected ? "var(--color-success)" : "var(--color-input-stroke)"} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
