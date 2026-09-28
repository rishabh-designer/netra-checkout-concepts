"use client";

import { cn } from "@/lib/utils";
import type { Variants } from "motion/react";
import { LazyMotion, domMin, m, useAnimation, useReducedMotion } from "motion/react";
import { type HTMLAttributes, type Ref, useCallback, useImperativeHandle, useRef } from "react";

export interface BadgeCheckIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BadgeCheckIconProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "color" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  color?: string;
}

/**
 * BadgeCheckIcon — Lucide's badge-check, animated after @animateicons (the
 * house icon pattern, vendored like EyeIcon): on hover the seal gives a small
 * turn-and-settle and the tick redraws. Drive it from a parent with the ref
 * (startAnimation / stopAnimation); still under reduced motion.
 * Usage: <BadgeCheckIcon size={12} color="var(--color-brand-secondary)" />
 */
function BadgeCheckIcon({
  ref,
  onMouseEnter,
  onMouseLeave,
  className,
  size = 24,
  duration = 1,
  isAnimated = true,
  color,
  ...props
}: BadgeCheckIconProps & { ref?: Ref<BadgeCheckIconHandle> }) {
  const sealControls = useAnimation();
  const tickControls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  const play = useCallback(() => {
    if (reduced) return;
    sealControls.start("animate");
    tickControls.start("animate");
  }, [reduced, sealControls, tickControls]);
  const rest = useCallback(() => {
    sealControls.start("normal");
    tickControls.start("normal");
  }, [sealControls, tickControls]);

  useImperativeHandle(ref, () => {
    isControlled.current = true;
    return { startAnimation: play, stopAnimation: rest };
  });

  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnimated || reduced) return;
      if (!isControlled.current) play();
      else onMouseEnter?.(e);
    },
    [isAnimated, reduced, play, onMouseEnter],
  );
  const handleLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isControlled.current) rest();
      else onMouseLeave?.(e);
    },
    [rest, onMouseLeave],
  );

  const sealVariants: Variants = {
    normal: { rotate: 0, scale: 1 },
    animate: {
      rotate: [0, -12, 8, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.6 * duration, ease: "easeInOut" },
    },
  };
  const tickVariants: Variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.45 * duration, delay: 0.15 * duration, ease: "easeOut" },
    },
  };

  return (
    <LazyMotion features={domMin} strict>
      <m.div
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...props}
        style={{ color, ...props.style }}
      >
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={sealControls}
          initial="normal"
          variants={sealVariants}
          style={{ transformOrigin: "50% 50%" }}
        >
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <m.path d="m9 12 2 2 4-4" animate={tickControls} initial="normal" variants={tickVariants} />
        </m.svg>
      </m.div>
    </LazyMotion>
  );
}

BadgeCheckIcon.displayName = "BadgeCheckIcon";
export { BadgeCheckIcon };
