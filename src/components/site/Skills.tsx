"use client";

import { motion } from "motion/react";
import { skills } from "@/data/portfolio";
import SectionHead from "./SectionHead";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Skills() {
  return (
    <section id="skills" className="px-4 py-24 sm:px-6 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead
          index="04"
          label="Toolkit"
          lines={[
            <span key="a">
              The <span className="serif text-accent">stack</span> behind it.
            </span>,
          ]}
        />

        <div className="grid border-t border-line [perspective:1200px] sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, rotateX: -70, y: 40 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 1, delay: (i % 4) * 0.1, ease: EASE }}
              className="group relative h-full origin-top overflow-hidden border-b border-line p-6 sm:odd:border-r md:p-8 lg:border-r lg:[&:nth-child(4n)]:border-r-0"
            >
              {/* Accent sweep from the bottom on hover. */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
              />
              <div className="relative flex items-baseline justify-between">
                <h3 className="text-xl font-bold tracking-tight transition-colors duration-500 group-hover:text-on-pop">
                  {g.title}
                </h3>
                <span className="font-mono text-xs text-mute transition-colors duration-500 group-hover:text-on-pop">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <ul className="relative mt-6 space-y-1.5">
                {g.items.map((s, k) => (
                  <li
                    key={s}
                    style={{ transitionDelay: `${k * 30}ms` }}
                    className="text-mute transition-[color,transform] duration-500 group-hover:translate-x-1.5 group-hover:text-on-pop"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
