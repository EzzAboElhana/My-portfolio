"use client";

import { useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { nav, profile } from "@/data/portfolio";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        style={{ scaleX: progress }}
        className="h-[2px] origin-left bg-gradient-to-r from-blue via-cyan to-bone"
      />

      <nav className="glass-strong border-x-0 border-t-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <ul className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="group relative font-mono text-xs uppercase tracking-widest text-mute transition-colors hover:text-bone"
                >
                  {item.label}
                  <span className="absolute -bottom-1 start-0 h-px w-0 bg-blue transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full border border-line px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:border-blue hover:text-blue"
            >
              Hire me
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            /* ml-auto: with the wordmark gone this is the only child on
               mobile, and justify-between would park it on the left. */
            className="ms-auto flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-6 bg-bone transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-bone transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>

        {open && (
          <ul className="flex flex-col gap-1 border-t border-line/60 px-6 py-4 md:hidden">
            <li className="pb-2">
            </li>
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-mono text-sm uppercase tracking-widest text-mute"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
