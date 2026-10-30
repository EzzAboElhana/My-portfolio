"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { profile, stats } from "@/data/portfolio";
import Counter from "./Counter";
import Magnetic from "./Magnetic";
import Scramble from "./Scramble";

const EASE = [0.22, 1, 0.36, 1] as const;

const letter: Variants = {
  hidden: { y: "115%", opacity: 0, filter: "blur(10px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const rise: Variants = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

/** Splits a word into per-letter spans that rise out of their own clip box. */
function Letters({ word, className }: { word: string; className?: string }) {
  return (
    <span className={className}>
      {word.split("").map((char, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span variants={letter} className="inline-block">
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Content drifts up and dims as the hero leaves, so the copy hands off to
  // the starfield instead of scrolling away as a solid block.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const opacity = useTransform(scrollYProgress, [0, 0.72], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(6px)"]);

  const [first, last] = profile.name.split(" ");

  return (
    <section
      ref={ref}
      id="top"
      className="text-scrim relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 pb-36 md:px-10"
    >
      <motion.div
        style={{ y, opacity, filter: blur }}
        className="mx-auto w-full max-w-7xl"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.045 } } }}
      >
        {/* Status pill */}
        <motion.div variants={rise} className="flex">
          <span className="glass inline-flex items-center gap-3 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.2em] text-mute uppercase">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inset-0 rounded-full bg-blue"
                style={{ animation: "pulse-ring 3.4s ease-out infinite" }}
              />
              <span className="relative h-2 w-2 rounded-full bg-blue" />
            </span>
            Open to work
            <span className="text-line">/</span>
            <span className="text-bone">{profile.location}</span>
          </span>
        </motion.div>

        {/* Name */}
        <h1 className="type-lift mt-8 text-[clamp(3.2rem,13vw,11rem)] leading-[0.82] font-bold tracking-[-0.05em]">
          <Letters word={first} className="glow-text block" />
          <Letters word={last} className="text-stroke block" />
        </h1>

        <motion.div
          variants={rise}
          className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3"
        >
          <span className="h-px w-14 bg-gradient-to-r from-blue to-transparent" />
          <Scramble
            text={profile.role.toUpperCase()}
            delay={0.9}
            className="font-mono text-xs tracking-[0.32em] text-blue md:text-sm"
          />
        </motion.div>

        <motion.p
          variants={rise}
          className="mt-6 max-w-md text-base leading-relaxed text-mute md:text-lg"
        >
          {profile.tagline}
        </motion.p>

        {/* Actions */}
        <motion.div variants={rise} className="mt-10 flex flex-wrap gap-3">
          <Magnetic>
            <a
              href="#work"
              data-cursor="Explore"
              className="glow inline-flex items-center gap-2 rounded-full bg-blue px-7 py-3.5 font-mono text-xs tracking-[0.18em] text-on-pop uppercase transition-transform hover:scale-[1.03]"
            >
              View work
              <span aria-hidden>→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={`mailto:${profile.email}`}
              className="glass inline-flex items-center rounded-full px-7 py-3.5 font-mono text-xs tracking-[0.18em] uppercase transition-colors hover:text-blue"
            >
              Get in touch
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor="PDF"
              className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-mono text-xs tracking-[0.18em] text-mute uppercase transition-colors hover:text-bone"
            >
              Résumé
              <span aria-hidden>↓</span>
            </a>
          </Magnetic>
        </motion.div>

        {/* Stats — read as a mission readout under the copy. */}
        <motion.dl
          variants={rise}
          className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="border-s border-line ps-4">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <Counter
                  value={s.value}
                  className="block text-3xl font-bold tracking-tight md:text-4xl"
                />
                <span className="mt-1.5 block font-mono text-[10px] leading-relaxed tracking-[0.12em] text-mute uppercase">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center"
      >
        <span className="flex flex-col items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] text-mute uppercase">
          Scroll to launch
          <span className="relative h-11 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-blue"
              animate={{ y: [-16, 44] }}
              transition={{
                duration: 1.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </span>
      </motion.div>
    </section>
  );
}
