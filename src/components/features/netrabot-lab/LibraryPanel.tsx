"use client";

import { useRef, useState } from "react";
import type { BotSvgHandle } from "@/components/ui/NetraBot";
import { PillGroup } from "@/components/ui/PillGroup";
import { ANIMATION_KIND_OPTIONS, CATEGORY_OPTIONS } from "@/lib/netrabot/controls";
import { KIND_LABELS, LAB_COPY, codeFor } from "@/lib/netrabot/labCopy";
import { stepExpression } from "@/lib/netrabot/playback";
import type { AnimationKind, BotDefinition, Expression, NetraAnimation } from "@/types/netrabot";
import { HoverPreview } from "./HoverPreview";
import { PresetCard } from "./PresetCard";
import type { NetraLabApi } from "./useNetraLab";
import styles from "./NetraLab.module.css";

type Mode = "faces" | "animations";
const ALL = "all";
const COPIED_MS = 1400;

/** The still face that best shows an animation: where an appear ends, where a disappear goes, otherwise its first real face. */
function cardFace(definition: BotDefinition, animation: NetraAnimation): Expression {
  const steps = animation.steps;
  if (animation.kind === "enter" || animation.kind === "exit") return stepExpression(definition, steps[steps.length - 1]);
  return stepExpression(definition, steps.find((s) => s.expression !== "neutral") ?? steps[0]);
}

const matches = (query: string, ...texts: string[]) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = texts.join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/**
 * LibraryPanel - every face and animation, ready to use: filter by category
 * or kind, search, hover a card to preview it, click to put it on the stage,
 * Edit to open it in its tab, Copy code for the line that uses it.
 * Usage: <LibraryPanel lab={lab} />
 */
export function LibraryPanel({ lab }: { lab: NetraLabApi }) {
  const { definition } = lab;
  const copy = LAB_COPY.library;
  const [mode, setMode] = useState<Mode>("faces");
  const [filter, setFilter] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const handles = useRef(new Map<string, BotSvgHandle>());
  const copyTimer = useRef<number | undefined>(undefined);

  const register = (id: string) => (handle: BotSvgHandle | null) => {
    if (handle) handles.current.set(id, handle);
    else handles.current.delete(id);
  };
  const hover = (id: string) => (on: boolean) => setHovered((current) => (on ? id : current === id ? null : current));
  const copyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(null), COPIED_MS);
    } catch {
      /* the browser blocked the clipboard: nothing to show */
    }
  };

  const faceKeys = definition.expressionOrder.filter((key) => {
    const named = definition.expressions[key];
    return named && (filter === ALL || named.category === filter) && matches(query, named.label, key, named.category);
  });
  const animationKeys = definition.animationOrder.filter((key) => {
    const animation = definition.animations[key];
    return (
      animation &&
      (filter === ALL || animation.kind === filter) &&
      matches(query, animation.label, key, animation.description, animation.group, KIND_LABELS[animation.kind])
    );
  });
  const presentCategories = CATEGORY_OPTIONS.filter((option) =>
    definition.expressionOrder.some((key) => definition.expressions[key]?.category === option.value)
  );
  const filters = mode === "faces" ? presentCategories : ANIMATION_KIND_OPTIONS.map((o) => ({ value: o.value, label: KIND_LABELS[o.value as AnimationKind] }));
  const empty = mode === "faces" ? faceKeys.length === 0 : animationKeys.length === 0;

  return (
    <div className={styles.panel}>
      <p className={styles.intro}>{copy.intro}</p>
      <PillGroup<Mode>
        label={copy.search}
        options={[
          { value: "faces", label: `${copy.faces} (${definition.expressionOrder.length})` },
          { value: "animations", label: `${copy.animations} (${definition.animationOrder.length})` },
        ]}
        value={mode}
        onChange={(next) => {
          setMode(next);
          setFilter(ALL);
        }}
      />
      <input
        className={styles.textInput}
        type="search"
        aria-label={copy.search}
        placeholder={copy.searchPlaceholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className={styles.chips}>
        {[{ value: ALL, label: copy.all }, ...filters].map((option) => (
          <li key={option.value}>
            <button type="button" className={styles.chip} data-selected={filter === option.value || undefined} onClick={() => setFilter(option.value)}>
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      {empty && <p className={styles.intro}>{copy.empty}</p>}
      <ul className={styles.presets}>
        {mode === "faces"
          ? faceKeys.map((key) => {
              const id = `face:${key}`;
              const named = definition.expressions[key];
              return (
                <PresetCard
                  key={id}
                  definition={definition}
                  face={named.values}
                  label={named.label}
                  selected={lab.tryFace === key}
                  previewing={hovered === id}
                  copied={copied === id}
                  onHover={hover(id)}
                  onHandle={register(id)}
                  onApply={() => {
                    lab.setTryFace(key);
                    lab.restart();
                  }}
                  onEdit={() => {
                    lab.setExpressionKey(key);
                    lab.setTab("expressions");
                  }}
                  onCopy={() => copyCode(id, codeFor("face", key))}
                />
              );
            })
          : animationKeys.map((key) => {
              const id = `anim:${key}`;
              const animation = definition.animations[key];
              return (
                <PresetCard
                  key={id}
                  definition={definition}
                  face={cardFace(definition, animation)}
                  label={animation.label}
                  meta={KIND_LABELS[animation.kind]}
                  hint={animation.description || undefined}
                  selected={!lab.tryFace && lab.animationKey === key}
                  previewing={hovered === id}
                  copied={copied === id}
                  onHover={hover(id)}
                  onHandle={register(id)}
                  onApply={() => {
                    lab.setTryFace(null);
                    lab.setAnimationKey(key);
                    lab.restart();
                  }}
                  onEdit={() => {
                    lab.setAnimationKey(key);
                    lab.setTab("animations");
                  }}
                  onCopy={() => copyCode(id, codeFor(animation.kind, key))}
                />
              );
            })}
      </ul>
      {hovered && (
        <HoverPreview key={hovered} definition={definition} item={hovered} getHandle={() => handles.current.get(hovered)} />
      )}
    </div>
  );
}
