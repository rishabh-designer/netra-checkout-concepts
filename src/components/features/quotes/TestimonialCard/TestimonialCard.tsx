import type { TestimonialContent } from "@/types/quotesPage";
import styles from "./TestimonialCard.module.css";

export interface TestimonialCardProps {
  content: TestimonialContent;
}

/**
 * TestimonialCard — the customer quote in the Help Desk stack (Figma 584:44135):
 * the quote, a faint rule, then name (brand purple) over "role • company" with
 * an amber dot, and two overlapping roundels (person over company logo).
 * Usage: <TestimonialCard content={testimonial} />
 */
export function TestimonialCard({ content }: TestimonialCardProps) {
  return (
    <figure className={styles.card}>
      <blockquote className={styles.quote}>{content.quote}</blockquote>
      <figcaption className={styles.foot}>
        <div className={styles.person}>
          <span className={styles.name}>{content.name}</span>
          <span className={styles.role}>
            {content.role}
            <span className={styles.dot} aria-hidden />
            {content.company}
          </span>
        </div>
        <span className={styles.marks} aria-hidden>
          <span className={styles.logoMark}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.logoSrc} alt="" />
          </span>
          <span className={styles.photoMark}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.photoSrc} alt="" />
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
