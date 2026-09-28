import { Fragment } from "react";
import styles from "./Highlight.module.css";

export interface HighlightProps {
  /** Copy with the highlighted parts in square brackets:
   *  "Get [₹10 Crore] Cover at [₹10,000/Year]." */
  text: string;
}

/** Plain text with each "\n" as a line break. */
function lines(text: string, key: number) {
  return text.split("\n").map((line, j) => (
    <Fragment key={`${key}-${j}`}>
      {j > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/**
 * Highlight — renders copy with its [bracketed] parts in brand purple; the
 * rest keeps the surrounding colour. The brackets themselves aren't shown,
 * and a "\n" in the copy is a line break.
 * Usage: <Highlight text="Get [₹10 Crore] Cover at [₹10,000/Year]." />
 */
export function Highlight({ text }: HighlightProps) {
  return (
    <>
      {text.split(/\[([^\]]*)\]/).map((part, i) =>
        i % 2 ? (
          <span key={i} className={styles.mark}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{lines(part, i)}</Fragment>
        ),
      )}
    </>
  );
}
