"use client";

import { useRef } from "react";
import {
  motion,
  type MotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { education, languages, profile, strengths } from "@/data/portfolio";
import SectionHead from "./SectionHead";

const EASE = [0.22, 1, 0.36, 1] as const;

// Words that get the accent once they light up.
const KEY = new Set([
  "3+",
  "Google",
  "Play",
  "Apple",
  "App",
  "Store,",
  "Clean",
  "Architecture,",
  "BLoC,",
  "leading",
]);

function ScrubWord({
  word,
  range,
  progress,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`inline-block ${KEY.has(word) ? "text-accent-ink" : ""}`}
    >
      {word}&nbsp;
    </motion.span>
  );
}

/** Paragraph that is "read in" word by word as it scrolls through view. */
function ScrubText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  });
  const words = text.split(" ");
  return (
    <p
      ref={ref}
      className="text-2xl leading-snug tracking-tight md:text-[2.4rem] md:leading-[1.2]"
    >
      {words.map((w, i) => (
        <ScrubWord
          key={i}
          word={w}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
        />
      ))}
    </p>
  );
}

const cell = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.12, ease: EASE },
  }),
};

export default function About() {
  return (
    <section id="about" className="px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead
          index="02"
          label="About"
          lines={[
            <span key="a">
              Apps people <span className="serif text-accent">actually</span>
            </span>,
            "open every day.",
          ]}
        />

        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-4">
            <ScrubText text={profile.summary} />
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="mt-16 grid divide-y divide-line border-y border-line md:mt-24 md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          <motion.div
            custom={0}
            variants={cell}
            className="h-full py-8 md:pe-8"
          >
            <p className="eyebrow">Education</p>
            <p className="mt-4 text-xl font-semibold tracking-tight">
              {education.degree}
            </p>
            <p className="mt-2 text-mute">
              {education.school} · {education.period}
            </p>
          </motion.div>

          <motion.div
            custom={1}
            variants={cell}
            className="h-full py-8 md:px-8"
          >
            <p className="eyebrow">Languages</p>
            <ul className="mt-4 space-y-2">
              {languages.map((l) => (
                <li
                  key={l.name}
                  className="flex items-baseline justify-between border-b border-line pb-2 text-xl font-semibold tracking-tight"
                >
                  {l.name}
                  <span className="serif text-lg text-mute">{l.level}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            custom={2}
            variants={cell}
            className="h-full py-8 md:ps-8"
          >
            <p className="eyebrow">What I bring</p>
            <ul className="mt-4 space-y-2">
              {strengths.map((s, i) => (
                <motion.li
                  key={s}
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { delay: 0.4 + i * 0.07, ease: EASE },
                    },
                  }}
                  className="flex gap-3 text-[15px]"
                >
                  <motion.span
                    className="text-accent"
                    aria-hidden
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ✺
                  </motion.span>
                  {s}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
