"use client";

import { getPath } from "@/lib/netrabot/edit";
import type { ControlSection } from "@/lib/netrabot/controls";
import { ControlField } from "./ControlField";
import styles from "./NetraLab.module.css";

export interface ControlSectionsProps {
  sections: ControlSection[];
  /** The object the paths read from (an expression, an animation, the definition). */
  target: unknown;
  onChange: (path: string, value: unknown) => void;
  /** Fallback colours by control path, for optional colours that are unset. */
  fallbackColors?: Record<string, string>;
  /** Sections that start collapsed. */
  collapsed?: string[];
}

/**
 * ControlSections - a stack of collapsible groups, each a list of ControlFields
 * built from the control spec.
 * Usage: <ControlSections sections={EXPRESSION_SECTIONS} target={expr} onChange={set} />
 */
export function ControlSections({ sections, target, onChange, fallbackColors, collapsed = [] }: ControlSectionsProps) {
  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <details key={section.id} className={styles.section} open={!collapsed.includes(section.id) || undefined}>
          <summary className={styles.sectionTitle}>{section.title}</summary>
          <div className={styles.controls}>
            {section.controls.map((control) => (
              <ControlField
                key={control.id}
                control={control}
                value={getPath(target, control.path)}
                fallbackColor={fallbackColors?.[control.path]}
                onChange={(value) => onChange(control.path, value)}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
