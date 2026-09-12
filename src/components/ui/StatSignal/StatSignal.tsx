import styles from "./StatSignal.module.css";

export interface StatSignalProps {
  value?: string;
  label?: string;
}

/**
 * StatSignal — a trust statistic: big serif number over a muted label.
 * Usage: <StatSignal value="4,500" label="Companies Covered" />
 */
export function StatSignal({ value = "0", label = "Stat" }: StatSignalProps) {
  return (
    <div className={styles.signal}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
