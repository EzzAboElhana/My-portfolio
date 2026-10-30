"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { profile, stats } from "@/data/portfolio";
import Counter from "@/components/Counter";
import Magnetic from "@/components/Magnetic";

// WebGL loads after first paint; until then a CSS orb of the same size and
// shading holds the spot so nothing pops in.
const Orb = () => (
  <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_35%_28%,#6b6b72_0%,#1a1a1f_38%,#0b0b0e_62%,#0a7cff_100%)] opacity-90" />
);
const LiquidBlob = dynamic(() => import("./LiquidBlob"), {
  ssr: false,
  loading: Orb,
});

const EASE = [0.22, 1, 0.36, 1] as const;

const letter: Variants = {
  hidden: { y: "110%", rotate: 12 },
  show: (i: number) => ({
    y: "0%",
    rotate: 0,
    transition: { duration: 1, delay: 0.15 + i * 0.045, ease: EASE },
  }),
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: d, ease: EASE },
  }),
};

/** One word, each letter rising out of its own clip box. The box is padded
    on the right (and pulled back by the same amount) because the tight
    tracking lets round letters like D overhang it and get clipped. */
function Word({ word, offset }: { word: string; offset: number }) {
  return (
    <>
      {word.split("").map((ch, i) => (
        <span
          key={i}
          className="-me-[0.12em] inline-block overflow-hidden pe-[0.12em] pb-[0.04em] align-bottom"
        >
          <motion.span
            className="inline-block origin-bottom-left"
            initial="hidden"
            animate="show"
            custom={offset + i}
            variants={letter}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const [first, last] = profile.name.split(" ");
  const ref = useRef<HTMLElement>(null);

  // Scroll-out: the two halves of the name pull apart, the blob drifts up
  // and the copy below drifts up slower than the page.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const leftX = useTransform(p, [0, 1], ["0%", "-38%"]);
  const rightX = useTransform(p, [0, 1], ["0%", "30%"]);
  const nameOpacity = useTransform(p, [0, 0.8], [1, 0.1]);
  const blobY = useTransform(p, [0, 1], [0, -220]);
  // Gone before the split name can slide underneath it.
  const blobOpacity = useTransform(p, [0, 0.45], [1, 0]);
  const pitchY = useTransform(p, [0, 1], [0, -120]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative overflow-hidden px-4 pt-10 sm:px-6 md:px-10 md:pt-14"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Name. Sized off the viewport so it always spans the page. */}
        <div className="relative">
          <motion.h1
            aria-label={profile.name}
            style={{ opacity: nameOpacity }}
            className="relative z-10 mt-4 text-[clamp(4.2rem,21.5vw,21rem)] leading-[0.8] font-extrabold tracking-[-0.055em] uppercase md:mt-8 lg:text-[min(18vw,19rem)]"
          >
            <motion.span aria-hidden style={{ x: leftX }} className="block">
              <Word word={first} offset={0} />
            </motion.span>
            <motion.span aria-hidden style={{ x: rightX }} className="block">
              <Word word={last} offset={first.length} />
              <motion.span
                className="inline-block text-accent"
                initial={{ scale: 0, y: "-60%" }}
                animate={{ scale: 1, y: "0%" }}
                transition={{
                  delay: 0.15 + (first.length + last.length) * 0.045 + 0.4,
                  type: "spring",
                  stiffness: 400,
                  damping: 12,
                }}
              >
                .
              </motion.span>
            </motion.span>
          </motion.h1>

          {/* Liquid-metal blob beside the name; bleeds off the right edge. */}
          <motion.div
            style={{ y: blobY, opacity: blobOpacity }}
            className="pointer-events-none absolute top-[-10%] right-[-12vw] aspect-square w-[52vw] lg:top-[-10%] lg:right-[-4%] lg:w-[min(36vw,520px)]"
          >
            <motion.div
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.5, ease: EASE }}
            >
              <LiquidBlob className="h-full w-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Role + pitch */}
        <motion.div
          style={{ y: pitchY }}
          className="mt-8 grid gap-8 border-t border-line pt-8 md:mt-12 md:grid-cols-12 md:gap-10"
        >
          <motion.p
            initial="hidden"
            animate="show"
            custom={0.75}
            variants={rise}
            className="text-4xl leading-[1.05] tracking-tight md:col-span-6 md:text-6xl"
          >
            <span className="serif">Flutter developer</span>
            <br />
            <span className="text-mute">
              shipping apps to <span className="text-bone">Play</span> &amp;{" "}
              <span className="text-bone">App Store.</span>
            </span>
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            custom={0.9}
            variants={rise}
            className="flex flex-col justify-between gap-8 md:col-span-5 md:col-start-8"
          >
            <p className="text-lg leading-relaxed text-mute md:text-xl">
              {profile.tagline} Clean Architecture, BLoC, maps, payments — from
              first commit to store release. And with AI in my workflow, I ship
              the backend and web side too.
            </p>
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <a
                  href="#work"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent px-6 py-3.5 font-medium text-on-pop"
                >
                  {/* Ink wipes up from below on hover. */}
                  <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
                  <span className="relative transition-colors duration-500 group-hover:text-ink">
                    See my work
                  </span>
                  <span className="relative transition-[color,transform] duration-500 group-hover:translate-x-1 group-hover:text-ink">
                    →
                  </span>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center rounded-full border border-bone/30 px-6 py-3.5 font-medium transition-colors hover:border-bone hover:bg-bone hover:text-ink"
                >
                  Get in touch
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 border-t border-line md:mt-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 + i * 0.1, ease: EASE }}
              className="border-b border-r border-line px-3 py-6 last:border-r-0 md:px-5 md:py-8"
            >
              <Counter
                value={s.value}
                className="block text-5xl font-extrabold tracking-tighter md:text-7xl"
              />
              <p className="mt-2 max-w-[14rem] text-sm text-mute">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
