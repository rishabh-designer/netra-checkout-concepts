"use client";

import type { ProductTag, TrustStat } from "@/types/productPage";
import { ProductTagPills } from "../ProductTagPills";
import { ProofRow } from "../ProofRow";
import { CoverageChips } from "../CoverageChips";
import { Highlight } from "@/components/ui/Highlight";
import styles from "./ProductHeroLeft.module.css";

export interface ProductHeroLeftProps {
  /** Product name over the title (the focus hero's PLP-name style). */
  eyebrow: string;
  /** Tag pills beside the product name. */
  tags?: ProductTag[];
  title: string;
  subtitle: string;
  stats: TrustStat[];
  /** Under the subtitle: every coverage line as a chip. */
  coverage?: { items: string[]; iconSrc: string };
}

/**
 * ProductHeroLeft — the product name in small caps with the tag pills beside
 * it, the serif page title and subtitle, the coverage chips, then a divider
 * over the proof row (packed from the left).
 * Usage: <ProductHeroLeft eyebrow={name} title={title} subtitle={sub} stats={stats} />
 */
export function ProductHeroLeft({ eyebrow, tags, title, subtitle, stats, coverage }: ProductHeroLeftProps) {
  return (
    <div className={styles.column}>
      <div className={styles.heading}>
        <div className={styles.eyebrowRow}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          {tags && <ProductTagPills tags={tags} />}
        </div>
        <h1 className={styles.title}>
          <Highlight text={title} />
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {coverage && <CoverageChips items={coverage.items} iconSrc={coverage.iconSrc} />}
      </div>
      <section className={styles.trustSignals} aria-label="Trust signals">
        <div className={styles.dividerLine} />
        <ProofRow stats={stats} align="start" markColor="var(--color-brand-primary)" />
      </section>
    </div>
  );
}
