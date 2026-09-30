"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { GazeTarget } from "@/lib/netrabot/gaze";
import { clamp } from "@/lib/netrabot/math";

export type PointerScope = "off" | "element" | "page";

export interface PointerTargetOptions {
  /** off: never; element: only while the pointer is over `elementRef`; page: anywhere on the page. */
  scope: PointerScope;
  /** The element the bot sits in (null until it mounts). The target is measured from its centre. */
  element: Element | null;
}

/**
 * usePointerTarget - where the pointer is, relative to the bot, as a
 * normalised GazeTarget (-1 to 1 on each axis), or null when there is no
 * pointer to follow. It updates a ref, not state, so moving the mouse never
 * re-renders anything. Honours prefers-reduced-motion by never following.
 * Keep the element in state (a callback ref) so this re-attaches when it mounts.
 * Usage: const target = usePointerTarget({ scope: "element", element: stageEl });
 */
export function usePointerTarget({ scope, element }: PointerTargetOptions): RefObject<GazeTarget | null> {
  const target = useRef<GazeTarget | null>(null);

  useEffect(() => {
    target.current = null;
    if (scope === "off" || !element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const aim = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const halfWidth = scope === "page" ? window.innerWidth / 2 : box.width / 2;
      const halfHeight = scope === "page" ? window.innerHeight / 2 : box.height / 2;
      target.current = {
        x: clamp((event.clientX - (box.left + box.width / 2)) / halfWidth, -1, 1),
        y: clamp((event.clientY - (box.top + box.height / 2)) / halfHeight, -1, 1),
      };
    };
    const release = () => {
      target.current = null;
    };

    const listener = scope === "page" ? window : element;
    listener.addEventListener("pointermove", aim as EventListener);
    element.addEventListener("pointerleave", release);
    document.addEventListener("mouseleave", release);
    return () => {
      listener.removeEventListener("pointermove", aim as EventListener);
      element.removeEventListener("pointerleave", release);
      document.removeEventListener("mouseleave", release);
      target.current = null;
    };
  }, [scope, element]);

  return target;
}
