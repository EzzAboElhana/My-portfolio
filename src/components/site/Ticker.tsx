"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { marquee } from "@/data/portfolio";

/**
 * A marquee that idles on its own and is thrown by the scroll: scrolling
 * faster speeds it up, scrolling back up reverses it, and the band skews in
 * the direction of travel.
 */
function Band({
  base,
  className,
}: {
  /** Idle speed in % of one copy per second; the sign sets direction. */
  base: number;
  className: string;
}) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), {
    damping: 50,
    stiffness: 400,
  });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-6, 0, 6], {
    clamp: false,
  });
  const skew = useTransform(velocity, [-2500, 2500], [8, -8]);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    const b = boost.get();
    if (b < 0) dir.current = -1;
    else if (b > 0) dir.current = 1;
    const move = dir.current * base * (delta / 1000) * (1 + Math.abs(b));
    // Two copies side by side; wrapping at -50% lands exactly on the seam.
    x.set(wrap(-50, 0, x.get() + move));
  });

  const translate = useTransform(x, (v) => `${v}%`);
  const items = [...marquee, ...marquee];

  return (
    <div className={`overflow-hidden py-4 md:py-5 ${className}`}>
      <motion.div style={{ x: translate, skewX: skew }} className="flex w-max">
        {items.map((t, i) => (
          <span
            key={i}
            aria-hidden={i >= marquee.length}
            className="flex items-center gap-8 pe-8 text-3xl font-bold tracking-tight whitespace-nowrap md:text-5xl"
          >
            {t}
            <span className="serif text-[0.9em] opacity-70">✺</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Ticker() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // The tapes cross harder as they pass through the viewport.
  const rotA = useTransform(scrollYProgress, [0, 1], [-6, 2]);
  const rotB = useTransform(scrollYProgress, [0, 1], [6, -1]);

  return (
    <section
      ref={ref}
      aria-label="Tools I work with"
      className="relative my-20 overflow-hidden py-16 md:my-28"
    >
      <motion.div style={{ rotate: rotA }} className="relative z-10 -mx-[5%]">
        <Band base={-2.2} className="bg-accent text-on-pop" />
      </motion.div>
      <motion.div
        style={{ rotate: rotB }}
        className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2"
      >
        <Band base={2.2} className="bg-bone text-ink" />
      </motion.div>
    </section>
  );
}
