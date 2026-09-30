"use client";

import type { ReactNode } from "react";
import { getPath } from "@/lib/netrabot/edit";
import type { Control, ControlSection } from "@/lib/netrabot/controls";
import { ControlField } from "./ControlField";
import type { EyeSide } from "./useNetraLab";
import styles from "./NetraLab.module.css";

export interface ControlSectionsProps {
  sections: ControlSection[];
  /** The object the paths read from (an expression, an animation, the definition). */
  target: unknown;
  onChange: (path: string, value: unknown) => void;
  /** Where each value's Reset goes back to: an object with the same paths. Omit for no Reset. */
  reference?: unknown;
  /** Fallback colours by control path, for optional colours that are unset. */
  fallbackColors?: Record<string, string>;
  /** Show the controls (and sections) marked advanced. */
  advanced?: boolean;
  /** Which eye "eye." paths edit. Both edits the left and mirrors it. */
  eyeSide?: EyeSide;
  /** Extra content at the top of a section, e.g. the Both / Left / Right switch for the eyes. */
  sectionHead?: (section: ControlSection) => ReactNode;
}

const resolvePath = (control: Control, eyeSide: EyeSide) =>
  control.path.startsWith("eye.") ? `${eyeSide === "right" ? "right" : "left"}.${control.path.slice(4)}` : control.path;

/**
 * ControlSections - a stack of collapsible groups, each a list of ControlFields
 * built from the control spec. Advanced controls hide unless `advanced` is on.
 * Usage: <ControlSections sections={EXPRESSION_SECTIONS} target={expr} reference={neutral} onChange={set} />
 */
export function ControlSections({
  sections,
  target,
  onChange,
  reference,
  fallbackColors,
  advanced = false,
  eyeSide = "both",
  sectionHead,
}: ControlSectionsProps) {
  return (
    <div className={styles.sections}>
      {sections
        .filter((section) => advanced || !section.advanced)
        .map((section) => (
          <details key={section.id} className={styles.section} open={!section.collapsed || undefined}>
            <summary className={styles.sectionTitle}>{section.title}</summary>
            <div className={styles.controls}>
              {sectionHead?.(section)}
              {section.controls
                .filter((control) => advanced || !control.advanced)
                .map((control) => {
                  const path = resolvePath(control, eyeSide);
                  return (
                    <ControlField
                      key={control.id}
                      control={control}
                      value={getPath(target, path)}
                      reference={reference === undefined ? undefined : getPath(reference, path)}
                      fallbackColor={fallbackColors?.[control.path]}
                      onChange={(value) => onChange(path, value)}
                    />
                  );
                })}
            </div>
          </details>
        ))}
    </div>
  );
}
