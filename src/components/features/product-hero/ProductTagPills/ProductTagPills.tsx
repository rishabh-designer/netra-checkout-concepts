"use client";

import { useRef } from "react";
import type { ProductTag } from "@/types/productPage";
import { TagPill } from "@/components/ui/TagPill";
import { BadgeCheckIcon, type BadgeCheckIconHandle } from "@/components/icons/BadgeCheckIcon";
import { ShoppingBagIcon, type ShoppingBagIconHandle } from "@/components/icons/ShoppingBagIcon";
import { cn } from "@/lib/utils";
import styles from "./ProductTagPills.module.css";

export interface ProductTagPillsProps {
  tags: ProductTag[];
  className?: string;
}

/**
 * ProductTagPills — the product's tag pills in a row (Immediate Purchase,
 * Secured with BimaNetra); each pill's animated icon plays while it's hovered.
 * Usage: <ProductTagPills tags={content.tags} />
 */
export function ProductTagPills({ tags, className }: ProductTagPillsProps) {
  const bagRef = useRef<ShoppingBagIconHandle>(null);
  const eyeRef = useRef<BadgeCheckIconHandle>(null);
  return (
    <div className={cn(styles.pills, className)}>
      {tags.map((tag) => {
        const iconRef = tag.icon === "shoppingBag" ? bagRef : tag.icon === "badgeCheck" ? eyeRef : null;
        return (
          <TagPill
            key={tag.label}
            label={tag.label}
            variant={tag.variant}
            icon={
              tag.icon === "shoppingBag" ? (
                <ShoppingBagIcon ref={bagRef} size={12} color="var(--color-success)" />
              ) : tag.icon === "badgeCheck" ? (
                <BadgeCheckIcon ref={eyeRef} size={12} color="var(--color-brand-secondary)" />
              ) : undefined
            }
            onMouseEnter={iconRef ? () => iconRef.current?.startAnimation() : undefined}
            onMouseLeave={iconRef ? () => iconRef.current?.stopAnimation() : undefined}
          />
        );
      })}
    </div>
  );
}
