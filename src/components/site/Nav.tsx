"use client";

import { useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { nav, profile } from "@/data/portfolio";
import useTheme from "./useTheme";

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-bone"
    >
      {/* Half-filled disc: the filled side flips with the theme. */}
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
        <circle
          cx="10"
          cy="10"
          r="7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d={
            dark ? "M10 2.5a7.5 7.5 0 0 1 0 15z" : "M10 2.5a7.5 7.5 0 0 0 0 15z"
          }
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-line/70 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3.5 sm:px-6 md:px-10">
          <a
            href="#top"
            className="flex items-center gap-2 text-[15px] font-bold tracking-tight"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
            {profile.name}
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="link-draw text-sm text-mute transition-colors hover:text-bone"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden rounded-full bg-bone px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-on-pop sm:inline-block"
            >
              Résumé ↓
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-full border border-line md:hidden"
            >
              <span
                className={`h-px w-4 bg-bone transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-4 bg-bone transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
        <motion.div
          style={{ scaleX: progress }}
          className="h-[2px] origin-left bg-accent"
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-line bg-ink px-4 py-4 md:hidden"
          >
            {nav.map((item, i) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-line/60 py-3 text-3xl font-bold tracking-tight"
                >
                  {item.label}
                  <span className="font-mono text-xs text-mute">0{i + 1}</span>
                </a>
              </li>
            ))}
            <li className="pt-4">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-full bg-accent py-3 text-center font-medium text-on-pop"
              >
                Download résumé ↓
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
