"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { experience } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

/**
 * Opening a role should bring that role to the top of the reading area, so
 * the newly revealed detail is what you are looking at.
 *
 * A plain scrollIntoView cannot do it: the panel above is still collapsing
 * and this one is still expanding, so the row's final resting place does not
 * exist yet at click time and the browser scrolls to a stale number. Instead
 * this drives the row's *viewport* position — measured fresh every frame, so
 * the ongoing layout shift is absorbed rather than fought — from wherever it
 * was to just under the fixed nav.
 */
const revealRow = (row: HTMLElement) => {
  const nav = document.querySelector("header")?.offsetHeight ?? 72;
  const target = nav + 24;
  const from = row.getBoundingClientRect().top;
  if (Math.abs(from - target) < 2) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduced ? 0 : 620; // outlasts the 0.4s height tween
  const t0 = performance.now();

  // Hand the page straight back the moment the visitor scrolls themselves —
  // driving the scroll against someone's own wheel is worse than not moving.
  let live = true;
  const release = () => {
    live = false;
    window.removeEventListener("wheel", release);
    window.removeEventListener("touchmove", release);
    window.removeEventListener("keydown", release);
  };
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchmove", release, { passive: true });
  window.addEventListener("keydown", release);

  // Ending purely on a timer is not enough: on a slow frame the collapse
  // above can still be running when the glide is over, and it then drags the
  // row back off screen. So once the glide lands, keep holding the target
  // until the row has actually stopped moving.
  let settled = 0;
  const step = (now: number) => {
    if (!live) return;
    const elapsed = now - t0;
    const t = duration ? Math.min(elapsed / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - t, 3);
    const want = from + (target - from) * eased;
    const drift = row.getBoundingClientRect().top - want;
    // `scroll-behavior: smooth` on <html> would animate every one of these
    // corrections into a fight with the tween, so each has to land instantly.
    if (Math.abs(drift) > 0.5) {
      window.scrollTo({ top: window.scrollY + drift, behavior: "instant" });
      settled = 0;
    } else if (t >= 1) {
      settled += 1;
    }
    if (t < 1 || (settled < 4 && elapsed < 2000)) requestAnimationFrame(step);
    else release();
  };
  requestAnimationFrame(step);
};

export default function Experience() {
  // First role expanded by default; the rest open on click.
  const [open, setOpen] = useState<number | null>(0);
  const list = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number, row: HTMLElement | null) => {
    const opening = open !== i;
    setOpen(opening ? i : null);
    // Closing a role leaves you reading whatever is now in front of you; only
    // opening one is a request to go look at something.
    if (opening && row) revealRow(row);
  };

  // The timeline rail fills as the section passes the middle of the viewport,
  // so the flight path draws itself while you read down it.
  const { scrollYProgress } = useScroll({
    target: list,
    offset: ["start 75%", "end 60%"],
  });
  const rail = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <section
      id="experience"
      className="text-scrim-wide relative px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="03 / Experience"
          title="Where I've built"
          kicker="Five teams, three years, and a lot of driver apps."
        />

        <div ref={list} className="relative ps-8 md:ps-12">
          {/* Rail: a dim track with a bright head that follows the scroll. */}
          <div
            aria-hidden
            // left-[3px] is not arbitrary: it centres the 1px rail under the
            // 7px nodes below, whose centres sit at 3.5px. Move one, move both.
            className="absolute top-0 bottom-0 start-[3px] w-px bg-line"
          />
          <motion.div
            aria-hidden
            style={{ scaleY: rail }}
            className="absolute top-0 bottom-0 start-[3px] w-px origin-top bg-gradient-to-b from-blue via-cyan to-transparent"
          />

          {experience.map((job, i) => {
            const isOpen = open === i;
            return (
              <div
                key={`${job.company}-${job.period}`}
                ref={(el) => {
                  rows.current[i] = el;
                }}
                className="relative border-b border-line last:border-b-0"
              >
                {/* Node on the rail, lit while its entry is open. */}
                <span
                  aria-hidden
                  className={`absolute top-[38px] -start-8 h-[7px] w-[7px] rounded-full transition-all duration-500 md:-start-12 ${
                    isOpen
                      ? "scale-125 bg-blue shadow-[0_0_14px_3px_var(--c-glow)]"
                      : "bg-line"
                  }`}
                />

                <button
                  onClick={() => toggle(i, rows.current[i])}
                  aria-expanded={isOpen}
                  className="group flex w-full items-start gap-6 py-8 text-left"
                >
                  <span className="mt-1 font-mono text-xs text-mute">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-blue md:text-3xl">
                        {job.company}
                      </span>
                      <span className="font-mono text-xs tracking-widest text-mute uppercase">
                        {job.type}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm text-cyan">
                      {job.role}
                    </span>
                  </span>

                  <span className="hidden shrink-0 pt-2 font-mono text-xs text-mute sm:block">
                    {job.period}
                  </span>

                  <span
                    className={`mt-1 shrink-0 text-xl leading-none transition-all duration-300 ${
                      isOpen ? "rotate-45 text-blue" : "text-mute"
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 sm:ps-12">
                        <p className="font-mono text-xs text-mute sm:hidden">
                          {job.period} · {job.location}
                        </p>
                        <p className="hidden font-mono text-xs text-mute sm:block">
                          {job.location}
                        </p>

                        <ul className="mt-5 max-w-3xl space-y-3">
                          {job.points.map((p, pi) => (
                            <motion.li
                              key={p}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.12 + pi * 0.045,
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="flex gap-3 text-sm leading-relaxed text-mute"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                              {p}
                            </motion.li>
                          ))}
                        </ul>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {job.stack.map((t) => (
                            <span
                              key={t}
                              className="glass rounded-full px-3 py-1 font-mono text-[11px] text-mute"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
