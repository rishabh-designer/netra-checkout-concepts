"use client";

import { useRef } from "react";
import type { ProductTag, TrustStat } from "@/types/productPage";
import { TagPill } from "@/components/ui/TagPill";
import { StatSignal } from "@/components/ui/StatSignal";
import { IkkatMark } from "@/components/ui/IkkatMark";
import { EyeIcon, type EyeIconHandle } from "@/components/icons/EyeIcon";
import {
  ShoppingBagIcon,
  type ShoppingBagIconHandle,
} from "@/components/icons/ShoppingBagIcon";
import styles from "./ProductHeroLeft.module.css";

export interface ProductHeroLeftProps {
  tags: ProductTag[];
  title: string;
  subtitle: string;
  stats: TrustStat[];
}

/**
 * ProductHeroLeft — tag pills (each animated icon plays on hover of its own
 * pill: shopping bag on "Immediate Purchase", eye on "Powered by BimaNetra"),
 * the serif page title, subtitle, and the trust-signal stat band.
 * Usage: <ProductHeroLeft tags={tags} title={title} subtitle={sub} stats={stats} />
 */
export function ProductHeroLeft({ tags, title, subtitle, stats }: ProductHeroLeftProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<EyeIconHandle>(null);

  return (
    <div className={styles.column}>
      <div className={styles.heading}>
        <div className={styles.pillStack}>
          {tags.map((tag) => {
            const iconRef =
              tag.icon === "shoppingBag"
                ? bagRef
                : tag.icon === "eye"
                  ? eyeRef
                  : null;

            return (
              <TagPill
                key={tag.label}
                label={tag.label}
                variant={tag.variant}
                icon={
                  tag.icon === "shoppingBag" ? (
                    <ShoppingBagIcon
                      ref={bagRef}
                      size={12}
                      color="var(--color-success)"
                    />
                  ) : tag.icon === "eye" ? (
                    <EyeIcon
                      ref={eyeRef}
                      size={12}
                      color="var(--color-special)"
                    />
                  ) : undefined
                }
                onMouseEnter={
                  iconRef ? () => iconRef.current?.startAnimation() : undefined
                }
                onMouseLeave={
                  iconRef ? () => iconRef.current?.stopAnimation() : undefined
                }
              />
            );
          })}
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <section className={styles.trustSignals} aria-label="Trust signals">
        <div className={styles.dividerLine} />
        <div className={styles.signalStack}>
          {stats.map((stat, i) => (
            <span key={stat.label} className={styles.signalEntry}>
              {i > 0 && (
                <IkkatMark
                  pattern={1}
                  width={20}
                  color="var(--color-brand-secondary)"
                  className={styles.signalSep}
                />
              )}
              <StatSignal value={stat.value} label={stat.label} />
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
