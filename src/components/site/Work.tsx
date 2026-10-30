"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { projects, type Project } from "@/data/portfolio";
import Image from "next/image";
import DevicePreview from "@/components/work/DevicePreview";
import SectionHead from "./SectionHead";
import { lockScroll } from "./SmoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

// Shown in the order they're listed in data/portfolio.ts.
const ordered = projects;

const isWeb = (p: Project) => p.preview === "web" || p.preview === "api";

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "mobile", label: "Mobile", test: (p: Project) => !isWeb(p) },
  { key: "web", label: "Web & Backend", test: isWeb },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-mute">
      {children}
    </span>
  );
}

/* ── Card ──────────────────────────────────────────────────────────────── */

function Card({
  p,
  n,
  i,
  onOpen,
}: {
  p: Project;
  n: number;
  i: number;
  onOpen: () => void;
}) {
  // 3D tilt toward the pointer.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 180, damping: 16 });
  const rotateX = useSpring(my, { stiffness: 180, damping: 16 });

  return (
    // Outer layer reflows on filter changes; inner one runs the entrance.
    <motion.div
      layout
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 0.8, delay: (i % 5) * 0.07, ease: EASE }}
      >
        <motion.button
          type="button"
          onClick={onOpen}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width - 0.5) * 12);
            my.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          style={{ rotateX, rotateY, transformPerspective: 800 }}
          className="group block w-full text-start"
        >
          {/* Always dark so every screen sits on the same stage. Only the top
              of the device shows; the card crops the rest. */}
          <motion.div
            layoutId={`stage-${p.name}`}
            data-theme="dark"
            className="relative flex aspect-square justify-center overflow-hidden rounded-2xl bg-ink-soft"
          >
            <span
              aria-hidden
              className="absolute bottom-[-40%] left-1/2 h-[80%] w-[100%] -translate-x-1/2 rounded-full bg-accent/20 blur-[50px] transition-all duration-700 group-hover:bottom-[-25%] group-hover:bg-accent/45"
            />
            {/* Every project here is live in production. */}
            <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] tracking-widest text-on-pop uppercase">
              <span className="h-1 w-1 animate-pulse rounded-full bg-on-pop" />
              Live
            </span>
            {p.cover ? (
              // Designed cover art fills the whole stage.
              <Image
                src={p.cover.src}
                alt={p.cover.alt}
                fill
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
            ) : (
              <div
                className={`relative shrink-0 origin-top scale-[0.55] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:scale-[0.62] xl:scale-[0.68] ${
                  isWeb(p)
                    ? "mt-[30%] group-hover:-translate-y-2"
                    : "mt-[14%] group-hover:-translate-y-6 group-hover:-rotate-2"
                }`}
              >
                <DevicePreview kind={p.preview} image={p.image} />
              </div>
            )}
          </motion.div>

          <div className="flex items-start justify-between gap-2 pt-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold tracking-tight transition-colors group-hover:text-accent md:text-lg">
                {p.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-mute">
                {String(n).padStart(2, "0")} · {p.category}
              </p>
            </div>
            <span
              aria-hidden
              className="mt-0.5 text-lg transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
            >
              ↗
            </span>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ── Detail overlay ────────────────────────────────────────────────────── */

function Detail({
  p,
  index,
  total,
  onClose,
  onStep,
}: {
  p: Project;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
}) {
  // Only the project that was clicked morphs out of (and back into) its card;
  // stepping to others just swaps the content in place.
  const [origin] = useState(p.name);
  const shared = p.name === origin;

  useEffect(() => {
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
    };
  }, [onClose, onStep]);

  // Portalled to <body>: the section around it is transformed by its scroll
  // reveal, and a transformed ancestor would trap position:fixed.
  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        data-lenis-prevent
        className="relative grid max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-t-[2rem] border border-line bg-ink md:grid-cols-2 md:overflow-hidden md:rounded-[2rem]"
      >
        <motion.div
          layoutId={shared ? `stage-${p.name}` : undefined}
          data-theme="dark"
          className="relative flex min-h-[380px] items-center justify-center overflow-hidden bg-ink-soft md:min-h-[640px]"
        >
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-[90px]"
          />
          {p.cover ? (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src={p.cover.src}
                alt={p.cover.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 60, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: shared ? 0.2 : 0,
                ease: EASE,
              }}
              className="relative md:scale-125"
            >
              <DevicePreview kind={p.preview} image={p.image} />
            </motion.div>
          )}
        </motion.div>

        <div
          className="flex flex-col p-7 md:overflow-y-auto md:p-10"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-mute">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-lg transition-all hover:rotate-90 hover:border-bone"
            >
              ✕
            </button>
          </div>

          <motion.div
            key={p.name}
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: { staggerChildren: 0.06, delayChildren: 0.15 },
              },
            }}
            className="mt-8 flex flex-1 flex-col"
          >
            {[
              <p key="c" className="eyebrow">
                {p.category}
              </p>,
              <h3
                key="n"
                className="mt-2 text-5xl leading-none font-extrabold tracking-tight md:text-6xl"
              >
                {p.name}
              </h3>,
              <p key="d" className="mt-5 text-lg leading-relaxed text-mute">
                {p.description}
              </p>,
              <ul key="f" className="mt-6 grid gap-2 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="text-accent" aria-hidden>
                      →
                    </span>
                    {f}
                  </li>
                ))}
              </ul>,
              <div key="s" className="mt-6 flex flex-wrap gap-1.5">
                {p.stack.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>,
              p.links && (
                <div key="l" className="mt-7 flex flex-wrap gap-3">
                  {p.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-medium text-on-pop transition-transform hover:-translate-y-0.5"
                    >
                      {l.label === "Website"
                        ? "Visit website"
                        : `View on ${l.label}`}{" "}
                      ↗
                    </a>
                  ))}
                </div>
              ),
            ]
              .filter(Boolean)
              .map((el, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: EASE },
                    },
                  }}
                >
                  {el}
                </motion.div>
              ))}
          </motion.div>

          <div className="mt-10 flex gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={() => onStep(-1)}
              className="flex-1 rounded-full border border-line py-3 text-sm font-medium transition-colors hover:border-bone"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              className="flex-1 rounded-full bg-bone py-3 text-sm font-medium text-ink transition-colors hover:bg-accent hover:text-on-pop"
            >
              Next →
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

export default function Work() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [open, setOpen] = useState<number | null>(null);

  const test = FILTERS.find((f) => f.key === filter)!.test;
  const shown = ordered.filter(test);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: 1 | -1) =>
      setOpen((i) =>
        i === null ? i : (i + d + ordered.length) % ordered.length,
      ),
    [],
  );

  return (
    <section id="work" className="px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead
          index="01"
          label="Selected work"
          lines={[
            "Shipped, live,",
            <span key="b" className="serif text-accent">
              in real hands.
            </span>,
          ]}
          aside="Ride-hailing, roadside assistance, food delivery, e-commerce — and the backend one of them runs on."
        />

        {/* Filters */}
        <div className="mb-10 flex flex-wrap gap-2 md:mb-14">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            const count = projects.filter(f.test).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-bone text-ink"
                    : "border-line text-mute hover:text-bone"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-bone"
                  />
                )}
                <span className="relative">
                  {f.label}{" "}
                  <span className="font-mono text-[11px] opacity-60">
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <LayoutGroup>
          <motion.div
            layout
            className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-5"
          >
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <Card
                  key={p.name}
                  p={p}
                  n={ordered.indexOf(p) + 1}
                  i={i}
                  onOpen={() => setOpen(ordered.indexOf(p))}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {open !== null && (
              <Detail
                key="detail"
                p={ordered[open]}
                index={open}
                total={ordered.length}
                onClose={close}
                onStep={step}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
