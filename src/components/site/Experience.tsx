"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useSpring,
} from "motion/react";
import { experience, type Job } from "@/data/portfolio";
import SectionHead from "./SectionHead";

const PREVIEW = 3;
const EASE = [0.22, 1, 0.36, 1] as const;

const fromLeft = {
  hidden: { opacity: 0, x: -50 },
  show: (d: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, delay: d, ease: EASE },
  }),
};

function JobRow({ job, current }: { job: Job; current: boolean }) {
  const [more, setMore] = useState(false);
  const extra = job.points.slice(PREVIEW);

  const ref = useRef<HTMLElement>(null);
  // The rail's node lights up once the row reaches the middle of the screen.
  const passed = useInView(ref, { margin: "0px 0px -50% 0px" });

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12%" }}
      className="relative grid gap-6 border-b border-line py-10 md:grid-cols-12 md:gap-8 md:py-14"
    >
      <span
        aria-hidden
        className={`absolute top-12 -left-[calc(3rem+5px)] hidden h-[11px] w-[11px] rounded-full border-2 transition-all duration-500 md:block ${
          passed ? "scale-125 border-accent bg-accent" : "border-line bg-ink"
        }`}
      />
      <motion.div custom={0} variants={fromLeft} className="md:col-span-3">
        <p className="font-mono text-sm text-mute">{job.period}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-mute">
          {job.type} · {job.location}
        </p>
        {current && (
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 font-mono text-[10px] tracking-widest text-on-pop uppercase">
            Current
          </span>
        )}
      </motion.div>

      <motion.div custom={0.1} variants={fromLeft} className="md:col-span-4">
        <h3 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          {job.company}
        </h3>
        <p className="serif mt-2 text-2xl text-accent-ink">{job.role}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {job.stack.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-mute"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="md:col-span-5">
        <ul className="space-y-3">
          {job.points.slice(0, PREVIEW).map((pt, i) => (
            <motion.li
              key={pt}
              custom={0.25 + i * 0.1}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: (d: number) => ({
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, delay: d, ease: EASE },
                }),
              }}
              className="flex gap-3 leading-relaxed"
            >
              <span className="mt-[0.1em] text-accent" aria-hidden>
                →
              </span>
              {pt}
            </motion.li>
          ))}
        </ul>
        <AnimatePresence initial={false}>
          {more && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-3 overflow-hidden"
            >
              {extra.map((pt, i) => (
                <li
                  key={pt}
                  className={`flex gap-3 leading-relaxed ${i === 0 ? "pt-3" : ""}`}
                >
                  <span className="mt-[0.1em] text-accent" aria-hidden>
                    →
                  </span>
                  {pt}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        {extra.length > 0 && (
          <button
            type="button"
            onClick={() => setMore((v) => !v)}
            aria-expanded={more}
            className="link-draw mt-4 font-mono text-xs tracking-wider text-mute uppercase hover:text-bone"
          >
            {more ? "Show less" : `+ ${extra.length} more`}
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 50%", "end 50%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead
          index="03"
          label="Experience"
          lines={[
            "Five teams.",
            <span key="b" className="serif text-accent">
              One of them led.
            </span>,
          ]}
        />
        <div ref={listRef} className="relative md:ms-12">
          {/* Timeline rail, filled by scroll. */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 -left-12 hidden w-px bg-line md:block"
          >
            <motion.span
              style={{ scaleY: fill }}
              className="absolute inset-0 origin-top bg-accent"
            />
          </span>
          <div className="border-t border-line">
            {experience.map((job, i) => (
              <JobRow
                key={job.company + job.period}
                job={job}
                current={i === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
