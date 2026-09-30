"use client";

import type { BotSvgHandle } from "@/components/ui/NetraBot";
import { LAB_COPY } from "@/lib/netrabot/labCopy";
import type { BotDefinition, Expression } from "@/types/netrabot";
import { BotThumb } from "./BotThumb";
import styles from "./NetraLab.module.css";

export interface PresetCardProps {
  definition: BotDefinition;
  /** The still face on the card. */
  face: Expression;
  label: string;
  meta?: string;
  hint?: string;
  selected: boolean;
  /** A player is animating this card right now. */
  previewing: boolean;
  copied: boolean;
  onHover: (on: boolean) => void;
  onHandle: (handle: BotSvgHandle | null) => void;
  onApply: () => void;
  onEdit: () => void;
  onCopy: () => void;
}

/** Card thumbnail size, px. */
const THUMB = 64;

/**
 * PresetCard - one face or animation in the library: a thumbnail that plays
 * on hover or focus, its name, and Edit and Copy code. Clicking it puts it on
 * the stage.
 * Usage: <PresetCard definition={def} face={values} label="Joyful" … />
 */
export function PresetCard({
  definition,
  face,
  label,
  meta,
  hint,
  selected,
  previewing,
  copied,
  onHover,
  onHandle,
  onApply,
  onEdit,
  onCopy,
}: PresetCardProps) {
  const copy = LAB_COPY.library;
  return (
    <li className={styles.preset} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <button
        type="button"
        className={styles.presetButton}
        data-selected={selected || undefined}
        data-tooltip={hint}
        onClick={onApply}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
      >
        <BotThumb definition={definition} expression={face} size={THUMB} still={!previewing} onHandle={onHandle} />
        <span className={styles.presetLabel}>{label}</span>
        {meta && <span className={styles.presetMeta}>{meta}</span>}
      </button>
      <span className={styles.presetActions}>
        <button type="button" className={styles.presetLink} onClick={onEdit}>
          {copy.edit}
        </button>
        <button type="button" className={styles.presetLink} onClick={onCopy}>
          {copied ? copy.copied : copy.copyCode}
        </button>
      </span>
    </li>
  );
}
