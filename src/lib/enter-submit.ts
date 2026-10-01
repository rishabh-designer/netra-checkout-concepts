import type { KeyboardEvent } from "react";

// Controls that already answer Enter themselves: buttons and links press,
// dropdowns open or pick, textareas break a line, and a chat composer
// (inside its own <form>) sends.
const OWN_ENTER = "textarea, button, a, [role='combobox'], [role='listbox'], [role='option'], [contenteditable='true'], form";

/**
 * Enter anywhere in a form (a typed field, or the panel itself) presses its
 * primary button, as long as that button is enabled. Put it on the element
 * that wraps the fields.
 * Usage: <div onKeyDown={onEnterSubmit(save, valid)}>…fields…</div>
 */
export function onEnterSubmit(submit: () => void, enabled = true) {
  return (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Enter" || e.defaultPrevented || e.nativeEvent.isComposing) return;
    if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.target as HTMLElement).closest(OWN_ENTER)) return;
    e.preventDefault();
    if (enabled) submit();
  };
}
