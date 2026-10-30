"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "./Reveal";

type Props = {
  index: string;
  title: string;
  kicker?: string;
  /** "light" is used inside the inverted pale-blue block. */
  tone?: "dark" | "light";
};

export default function SectionHeading({
  index,
  title,
  kicker,
  tone = "dark",
}: Props) {
  const light = tone === "light";
  const ref = useRef<HTMLDivElement>(null);

  // Heading slides sideways slightly as the section passes through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Subtle: more than ~20px and it reads as broken alignment against the kicker.
  const x = useTransform(scrollYProgress, [0, 1], [-18, 18]);
  const lineScale = useTransform(scrollYProgress, [0.05, 0.45], [0, 1]);

  const words = title.split(" ");

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      <div className="flex items-baseline gap-4">
        <span
          className={`font-mono text-xs ${light ? "text-invert-fg" : "text-blue"}`}
        >
          {index}
        </span>
        <motion.span
          style={{ scaleX: lineScale }}
          className={`h-px flex-1 origin-left ${light ? "bg-invert-fg/25" : "bg-line"}`}
        />
        <span className={`text-lg ${light ? "text-invert-fg" : "text-blue"}`}>✳</span>
      </div>

      {/* Observer sits on the h2, never on the words: a word translated out of
          its clipping wrapper never reports as intersecting. */}
      <motion.h2
        style={{ x }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-70px" }}
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className={`mt-5 text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight ${
          light ? "text-invert-fg" : "type-lift"
        }`}
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                show: {
                  y: "0%",
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.h2>

      {kicker && (
        <Reveal delay={0.2}>
          <p
            className={`mt-4 max-w-xl text-base leading-relaxed ${
              light ? "text-invert-fg/70" : "text-mute"
            }`}
          >
            {kicker}
          </p>
        </Reveal>
      )}
    </div>
  );
}
