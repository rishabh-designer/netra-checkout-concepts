"use client";

import { useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CheckoutSuccessContent } from "@/types/checkout";
import { useDemoNotice } from "@/lib/demo-notice";
import { ShoppingBagIcon } from "@/components/icons/ShoppingBagIcon";
import { DitherWash } from "@/components/ui/DitherWash";
import { NetraBot, type NetraBotHandle } from "@/components/ui/NetraBot";
import styles from "./SuccessMore.module.css";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { EASE_OUT as EASE } from "@/lib/motion";


const riseFrom = (reduced: boolean | null, delay: number) => (i: number) =>
  reduced
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: delay + i * 0.08, ease: EASE } };

export interface RmCardProps {
  rm: CheckoutSuccessContent["rm"];
  /** Seconds before the card rises in. */
  delay?: number;
}

/**
 * RmCard — Meet your Relationship Manager (Figma 692:58458), under the
 * purchase summary: peach wash and ring, the eyebrow over the serif name,
 * a ringed photo, a warm line about them, and their phone. Hovering (or
 * focusing inside) rakes the Upgraded banner's dithered light across it.
 * Usage: <RmCard rm={s.rm} delay={0.9} />
 */
export function RmCard({ rm, delay = 0 }: RmCardProps) {
  const rise = riseFrom(useReducedMotion(), delay);
  // The light rakes across the card on a loop; hovering (or focusing the
  // phone) holds it still while the card lifts.
  const [held, setHeld] = useState(false);
  return (
    <motion.aside
      className={styles.rm}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      {...rise(0)}
    >
      {!held && <DitherWash delay={delay + 0.6} duration={1.6} loopGap={1.2} />}
      <div className={styles.rmTop}>
        <div className={styles.rmText}>
          <p className={styles.eyebrow}>{rm.eyebrow}</p>
          <p className={styles.rmName}>{rm.name}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rm.photoSrc} alt={rm.name} className={styles.photo} />
      </div>
      <p className={styles.rmBody}>{rm.body}</p>
      <a href={rm.phoneHref} className={styles.phone}>
        {rm.phone}
        {/* The call glyph as a mask, so it takes the link's purple. */}
        <span className={styles.phoneIcon} style={{ "--icon": `url(${rm.phoneIconSrc})` } as CSSProperties} aria-hidden />
      </a>
    </motion.aside>
  );
}

export interface SuggestionsProps {
  suggestions: CheckoutSuccessContent["suggestions"];
  /** Seconds before the cards rise in. */
  delay?: number;
  /** Lets the page make the bot react to things outside the section too. */
  botRef?: RefObject<NetraBotHandle | null>;
}

/**
 * Suggestions — BimaNetra Suggests (Figma 673:54531), in the journey column
 * under the timeline: the title, then a row of product cards (name, line, cropped product
 * mark, Immediate Purchase tag and Find a Quote), rising in one by one.
 * Usage: <Suggestions suggestions={s.suggestions} delay={1.35} />
 */
export function Suggestions({ suggestions, delay = 0, botRef }: SuggestionsProps) {
  const rise = riseFrom(useReducedMotion(), delay);
  const notify = useDemoNotice();
  // Hovering a card cheers it on: each one has its own reaction (nod, hop, laugh).
  const own = useRef<NetraBotHandle>(null);
  const bot = botRef ?? own;
  return (
    <section className={styles.suggest}>
      {/* NetraBot over the heading: it's BimaNetra doing the suggesting. */}
      <motion.div className={styles.suggestHead} {...rise(0)}>
        <h2 className={styles.suggestTitle}>{suggestions.title}</h2>
        <NetraBot ref={bot} state="idle" follow="page" size={44} />
      </motion.div>
      <ul className={styles.grid}>
        {suggestions.items.map((item, i) => (
          // The whole card is the hover and click target; Find a Quote is its
          // keyboard-reachable action.
          <motion.li
            key={item.name}
            className={styles.card}
            onClick={() => notify("findQuote")}
            onMouseEnter={() => item.botReaction && bot.current?.react(item.botReaction)}
            {...rise(1 + i)}
          >
            <div className={styles.cardHead}>
              <div className={styles.cardText}>
                <p className={styles.cardName}>{item.name}</p>
                <p className={styles.cardBody}>{item.body}</p>
                {item.immediate && (
                  <span className={styles.tag} data-tooltip={suggestions.immediateTip}>
                    <ShoppingBagIcon size={10} color="var(--color-success)" />
                    {suggestions.immediateLabel}
                  </span>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.iconSrc} alt="" aria-hidden className={styles.mark} />
            </div>
            <div className={styles.cardFoot}>
              <button
                type="button"
                className={styles.find}
                onClick={(e) => {
                  e.stopPropagation();
                  notify("findQuote");
                }}
              >
                {suggestions.ctaLabel}
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
