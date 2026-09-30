"use client";

import { useEffect, useRef } from "react";

export interface LabShortcuts {
  togglePause: () => void;
  restart: () => void;
  appear: () => void;
  disappear: () => void;
  undo: () => void;
  redo: () => void;
}

/** Typing in these never triggers a shortcut. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * useLabShortcuts - the studio's keys: Space pauses, R restarts, A appears,
 * D disappears, Cmd/Ctrl+Z undoes and Shift+Cmd/Ctrl+Z (or Ctrl+Y) redoes.
 * Nothing fires while typing in a field.
 * Usage: useLabShortcuts({ togglePause, restart, appear, disappear, undo, redo });
 */
export function useLabShortcuts(actions: LabShortcuts) {
  const latest = useRef(actions);
  useEffect(() => {
    latest.current = actions;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return;
      const run = latest.current;
      const command = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (command && key === "z") {
        event.preventDefault();
        if (event.shiftKey) run.redo();
        else run.undo();
        return;
      }
      if (command && key === "y") {
        event.preventDefault();
        run.redo();
        return;
      }
      if (command || event.altKey) return;
      // Space on a focused button presses it; only take it when nothing else will.
      if (key === " " && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        run.togglePause();
      } else if (key === "r") run.restart();
      else if (key === "a") run.appear();
      else if (key === "d") run.disappear();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
