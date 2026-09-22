import type { TestimonialContent } from "@/types/quotesPage";
import styles from "./TestimonialCard.module.css";

export interface TestimonialCardProps {
  content: TestimonialContent;
}

/**
 * TestimonialCard — the right half of the secondary stack (item 9): a customer
 * quote with an attribution row (name in brand purple, role muted) and a small
 * logo mark. Usage: <TestimonialCard content={testimonial} />
 */
export function TestimonialCard({ content }: TestimonialCardProps) {
  return (
    <figure className={styles.card}>
      <blockquote className={styles.quote}>{content.quote}</blockquote>
      <figcaption className={styles.foot}>
        <div className={styles.person}>
          <span className={styles.name}>{content.name}</span>
          <span className={styles.role}>{content.role}</span>
        </div>
        <span className={styles.logo} aria-hidden />
      </figcaption>
    </figure>
  );
}
