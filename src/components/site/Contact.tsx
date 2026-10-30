"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { profile } from "@/data/portfolio";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

const links = [
  { label: "LinkedIn", href: profile.linkedin },
  { label: "GitHub", href: profile.github },
  { label: "Résumé (PDF)", href: profile.resumeUrl },
  { label: profile.phone, href: profile.phoneHref },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // The accent floods up out of a circle as the section scrolls in, and the
  // two headline lines slide in from opposite sides.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 15%"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26 });
  const radius = useTransform(p, [0, 1], [6, 150]);
  const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 100%)`);
  const lineA = useTransform(p, [0.3, 1], ["-30%", "0%"]);
  const lineB = useTransform(p, [0.3, 1], ["30%", "0%"]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <motion.section
      ref={ref}
      id="contact"
      style={{ clipPath }}
      className="relative mt-12 overflow-hidden bg-accent px-4 pt-24 pb-10 text-on-pop sm:px-6 md:px-10 md:pt-36"
    >
      <div className="mx-auto max-w-[1440px]">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.18em] uppercase opacity-70">
            (05) — Contact
          </p>
          <h2 className="mt-8 text-[clamp(3.2rem,12vw,12rem)] leading-[0.85] font-extrabold tracking-[-0.055em]">
            <motion.span style={{ x: lineA }} className="block">
              Let&apos;s build
            </motion.span>
            <motion.span
              style={{ x: lineB }}
              className="serif block font-normal tracking-[-0.02em]"
            >
              your next app.
            </motion.span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-col gap-4 border-t border-on-pop/25 pt-8 md:mt-20 md:flex-row md:items-center md:justify-between">
            <a
              href={`mailto:${profile.email}`}
              className="link-draw text-2xl font-bold tracking-tight break-all sm:text-4xl md:text-5xl"
            >
              {profile.email}
            </a>
            <Magnetic className="self-start md:self-auto" strength={18}>
              <button
                type="button"
                onClick={copy}
                className="rounded-full bg-on-pop px-7 py-4 font-medium text-accent transition-transform hover:scale-105"
              >
                {copied ? "Copied ✓" : "Copy email"}
              </button>
            </Magnetic>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-lg">
            {links.map((l) => {
              const external =
                l.href.startsWith("http") || l.href.endsWith(".pdf");
              return (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer noopener" : undefined}
                    className="link-draw font-medium"
                  >
                    {l.label} ↗
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <footer className="mt-24 flex flex-col gap-2 border-t border-on-pop/25 pt-6 font-mono text-xs uppercase tracking-wider opacity-75 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Built with Next.js · {profile.location}</span>
        </footer>
      </div>
    </motion.section>
  );
}
