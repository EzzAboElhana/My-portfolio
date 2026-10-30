"use client";

import { Children, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

type Tag = "div" | "ul" | "ol" | "dl";
type ItemTag = "div" | "li";

type Props = {
  children: ReactNode;
  className?: string;
  /** Wrapper element — "ul" keeps list semantics intact. */
  as?: Tag;
  /** Element wrapped around each child. Use "li" inside a "ul". */
  itemAs?: ItemTag;
  /** Seconds between each child. */
  stagger?: number;
  delay?: number;
};

/**
 * Reveals its children one after another when the block scrolls into view.
 *
 * Stagger owns the per-child element (hence `itemAs`) rather than animating
 * whatever it is handed — callers pass bare content and get valid markup, with
 * no `<li>` nested inside another `<li>`.
 *
 * The intersection observer stays on the wrapper, never the children: a child
 * translated down and blurred is still laid out, but keeping the trigger on
 * the parent means one observer instead of N.
 */
export default function Stagger({
  children,
  className,
  as = "div",
  itemAs = "div",
  stagger = 0.055,
  delay = 0,
}: Props) {
  const Wrapper = motion[as];
  const Item = motion[itemAs];

  return (
    <Wrapper
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {Children.map(children, (child, i) => (
        <Item key={i} variants={item}>
          {child}
        </Item>
      ))}
    </Wrapper>
  );
}
