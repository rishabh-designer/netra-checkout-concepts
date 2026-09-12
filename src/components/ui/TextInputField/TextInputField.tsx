import styles from "./TextInputField.module.css";

export interface TextInputFieldProps {
  placeholder?: string;
  name?: string;
  ariaLabel?: string;
  /** Controlled value + change handler (omit for an uncontrolled input). */
  value?: string;
  onValueChange?: (value: string) => void;
}

/**
 * TextInputField — the lead-form input with clear ×, help ⓘ, a hairline
 * divider and a validation ✓ in the suffix stack (all visual, per design).
 * Usage: <TextInputField placeholder="Enter your Legal Company Name" />
 */
export function TextInputField({
  placeholder = "Type here",
  name = "field",
  ariaLabel,
  value,
  onValueChange,
}: TextInputFieldProps) {
  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        name={name}
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
      />
      <div className={styles.suffix}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/icon-clear.svg" alt="" className={styles.icon12} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/icon-help.svg" alt="" className={styles.icon12} />
        <span className={styles.divider} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/figma/icon-valid-check.svg" alt="" className={styles.icon14} />
      </div>
    </div>
  );
}
