"use client";

import { motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const word: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

type Props = {
  text: string;
  className?: string;
  /** Seconds between each word. */
  stagger?: number;
};

/**
 * Reveals a paragraph word by word as it scrolls in — each word rises out of
 * its own clipped line box, so the block reads like it is being typeset.
 *
 * The viewport observer lives on the paragraph, never on the words: a word
 * translated 110% down is fully clipped by its overflow-hidden wrapper, and a
 * clipped element never reports as intersecting, so it would never animate in.
 */
export default function WordReveal({
  text,
  className,
  stagger = 0.022,
}: Props) {
  const words = text.split(" ");

  return (
    <motion.p
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span variants={word} className="inline-block">
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.p>
  );
}
