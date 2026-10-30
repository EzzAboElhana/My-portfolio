"use client";

import { motion } from "motion/react";

type Props = {
  index: string;
  label: string;
  /** Each entry is one headline line; lines rise out of a mask in turn. */
  lines: React.ReactNode[];
  aside?: React.ReactNode;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** "(02) — Work" label over an oversized, line-by-line revealed title. */
export default function SectionHead({ index, label, lines, aside }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15% 0px" }}
      className="mb-12 grid gap-x-6 gap-y-5 md:mb-20 md:grid-cols-12"
    >
      {/* Rule draws across before the words arrive. */}
      <motion.span
        aria-hidden
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.1, ease: EASE } },
        }}
        className="col-span-full block h-px origin-left bg-bone"
      />
      <motion.p
        variants={{
          hidden: { opacity: 0, x: -20 },
          show: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, delay: 0.2, ease: EASE },
          },
        }}
        className="eyebrow md:col-span-3"
      >
        ({index}) — {label}
      </motion.p>
      <div className="md:col-span-9">
        <h2 className="text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.92] font-extrabold tracking-[-0.045em]">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block origin-bottom-left"
                variants={{
                  hidden: { y: "110%", rotate: 4 },
                  show: {
                    y: "0%",
                    rotate: 0,
                    transition: {
                      duration: 1,
                      delay: 0.15 + i * 0.12,
                      ease: EASE,
                    },
                  },
                }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
        {aside && (
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  delay: 0.3 + lines.length * 0.12,
                  ease: EASE,
                },
              },
            }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-mute"
          >
            {aside}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
