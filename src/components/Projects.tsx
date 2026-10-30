"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { projects, type Project } from "@/data/portfolio";
import useMediaQuery from "@/hooks/useMediaQuery";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import DevicePreview from "./work/DevicePreview";

const EASE = [0.22, 1, 0.36, 1] as const;

function Card({ p, n }: { p: Project; n: number }) {
  const [open, setOpen] = useState(false);

  // Hover is the natural gesture on a mouse and does not exist on a phone, so
  // the same panel is opened by tap there. Binding both to one flag keeps a
  // single code path for the animation.
  const fine = useMediaQuery("(pointer: fine)");

  return (
    <Reveal className="h-full">
      <article
        className="group glass card-edge relative flex h-full flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-[0_0_64px_-16px_var(--c-glow)]"
        onPointerEnter={fine ? () => setOpen(true) : undefined}
        onPointerLeave={fine ? () => setOpen(false) : undefined}
      >
        {/* Stage: the device stands on a lit floor and is cropped by the card's
            own edge, so it reads as sitting in the card rather than floating
            inside a second box. */}
        <div className="relative flex h-[290px] shrink-0 justify-center overflow-hidden">
          <div className="aurora-wash absolute inset-0" />
          <span
            aria-hidden
            className="card-index pointer-events-none absolute -top-5 -left-2 text-[5.5rem] leading-none font-bold tracking-tighter select-none"
          >
            {String(n).padStart(2, "0")}
          </span>
          {/* Phones are tall and deliberately bleed off the bottom edge; the
              browser and console are wide and short, so they get less headroom
              and sit fully inside the stage instead of being cropped. */}
          <motion.div
            className={`relative flex justify-center ${
              p.preview === "web" || p.preview === "api" ? "mt-10" : "mt-9"
            }`}
            animate={{ y: open ? -10 : 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <DevicePreview kind={p.preview} image={p.image} />
          </motion.div>
          {/* Fades the cropped device into the card instead of guillotining it. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-soft to-transparent"
          />
        </div>

        <div className="relative flex flex-1 flex-col border-t border-line p-6">
          <p className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">
            <span aria-hidden className="h-px w-4 shrink-0 bg-cyan/60" />
            {p.category}
          </p>
          <h3 className="mt-2.5 text-xl leading-tight font-bold tracking-tight">
            {p.name}
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-mute">
            {p.description}
          </p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {p.stack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-line px-2 py-[3px] font-mono text-[10px] text-mute"
              >
                {t}
              </span>
            ))}
            {p.stack.length > 4 && (
              <span className="rounded-full border border-line px-2 py-[3px] font-mono text-[10px] text-mute">
                +{p.stack.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Detail panel. It covers the card rather than expanding it, so a row
            of cards never reflows and shoves its neighbours around. */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ duration: 0.32, ease: EASE }}
              // Opaque on purpose. A translucent panel let the card's own title and
              // copy read straight through the detail text underneath it.
              className="absolute inset-0 z-10 flex flex-col overflow-y-auto rounded-3xl border border-bone/12 bg-ink-soft p-6"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-cyan uppercase">
                {p.category}
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{p.name}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-mute">
                {p.description}
              </p>

              <ul className="mt-5 space-y-1.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[12.5px] leading-snug text-bone/90"
                  >
                    <span
                      aria-hidden
                      className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-blue"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-5">
                <div className="flex flex-wrap gap-1.5 border-t border-line pt-4">
                  {p.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-line px-2 py-[3px] font-mono text-[10px] text-mute"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {p.links && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="Open"
                        className="relative z-30 inline-flex items-center gap-2 rounded-full border border-blue/40 px-3.5 py-1.5 font-mono text-[10px] tracking-widest text-blue uppercase transition-colors hover:border-blue hover:bg-blue/10"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Touch has no hover, so the panel needs something to press. Sits
            under the panel's own links so those stay tappable. */}
        {!fine && (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="absolute inset-0 z-20"
          >
            <span className="sr-only">
              {open ? `Hide details for ${p.name}` : `Details for ${p.name}`}
            </span>
          </button>
        )}
      </article>
    </Reveal>
  );
}

export default function Projects() {
  return (
    <section
      id="work"
      className="text-scrim-wide relative px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="04 / Work"
          title="Selected work"
          kicker="Delivery, ride-hailing, roadside assistance, e-commerce — and the API one of them runs on. Apps real users depend on daily."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Card key={p.name} p={p} n={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
