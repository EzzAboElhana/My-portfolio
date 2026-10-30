"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * A full-width wave of light between sections. As you scroll, a soft wave
 * draws itself left to right with a glowing comet riding its tip; a fainter
 * wave follows a beat behind for depth. The next section's label surfaces
 * from a blur in the middle once the comet has passed.
 */

const W = 1440;
const H = 220;
// Three swells across the width, offset so they braid around each other.
const WAVE = `M0 110 C 180 20, 360 20, 540 110 S 900 200, 1080 110 S 1320 30, ${W} 90`;
const WAVE_2 = `M0 130 C 200 210, 380 210, 560 120 S 920 30, 1100 116 S 1330 190, ${W} 130`;
const WAVE_3 = `M0 90 C 220 40, 420 160, 620 100 S 980 40, 1160 120 S 1350 70, ${W} 70`;

export default function SectionDivider({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const comet = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 40%"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  const draw = useTransform(p, [0, 0.8], [0, 1]);
  const draw2 = useTransform(p, [0.08, 0.9], [0, 1]);
  const draw3 = useTransform(p, [0.16, 1], [0, 1]);
  const cometOpacity = useTransform(p, [0, 0.05, 0.75, 0.85], [0, 1, 1, 0]);
  const pillOpacity = useTransform(p, [0.45, 0.8], [0, 1]);
  const pillY = useTransform(p, [0.45, 0.8], [24, 0]);
  const pillBlur = useTransform(p, [0.45, 0.8], [10, 0]);
  const filter = useMotionTemplate`blur(${pillBlur}px)`;

  // Park the comet on the wave tip. It lives outside the SVG (which is
  // stretched to the screen width) so it stays round; the angle is taken in
  // screen space for the same reason.
  useMotionValueEvent(draw, "change", (v) => {
    const el = path.current;
    const c = comet.current;
    const box = svg.current?.getBoundingClientRect();
    if (!el || !c || !box) return;
    const sx = box.width / W;
    const sy = box.height / H;
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(len * v);
    const ahead = el.getPointAtLength(Math.min(len, len * v + 2));
    const angle =
      (Math.atan2((ahead.y - pt.y) * sy, (ahead.x - pt.x) * sx) * 180) /
      Math.PI;
    c.style.transform = `translate(${pt.x * sx}px, ${pt.y * sy}px) rotate(${angle}deg)`;
  });

  return (
    <div ref={ref} aria-hidden className="relative py-6 md:py-10">
      <div className="relative">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block h-[160px] w-full overflow-visible md:h-[220px]"
        >
          <defs>
            <linearGradient id={`wave-${index}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="0.3" stopColor="var(--c-accent)" />
              <stop offset="0.7" stopColor="#22d3ee" />
              <stop offset="1" stopColor="var(--c-accent)" />
            </linearGradient>
          </defs>

          {/* Neon glow: a thick, blurred copy of the main wave underneath. */}
          <g style={{ filter: "blur(10px)" }}>
            <motion.path
              d={WAVE}
              fill="none"
              stroke="var(--c-accent)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeOpacity="0.7"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: draw }}
            />
          </g>
          <motion.path
            d={WAVE_3}
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: draw3 }}
          />
          <motion.path
            d={WAVE_2}
            fill="none"
            stroke="var(--c-accent)"
            strokeOpacity="0.75"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: draw2 }}
          />
          <motion.path
            ref={path}
            d={WAVE}
            fill="none"
            stroke={`url(#wave-${index})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: draw }}
          />
        </svg>

        {/* Comet: bright head, wide halo and a long tail along the wave. */}
        <motion.div
          ref={comet}
          style={{ opacity: cometOpacity }}
          className="pointer-events-none absolute top-0 left-0 h-0 w-0"
        >
          <span className="absolute top-[-2px] right-0 h-[4px] w-48 rounded-full bg-gradient-to-l from-white via-[#22d3ee] to-transparent" />
          <span className="absolute -top-9 -left-9 h-[72px] w-[72px] rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.9)_0%,rgb(34_211_238/0.6)_25%,transparent_70%)]" />
          <span className="absolute -top-[5px] -left-[5px] h-[10px] w-[10px] rounded-full bg-white shadow-[0_0_20px_6px_rgb(34_211_238/0.9),0_0_60px_16px_var(--c-accent)]" />
        </motion.div>
      </div>

      {/* The next section's name surfaces from a blur once the comet passes. */}
      <motion.div
        style={{ opacity: pillOpacity, y: pillY, filter }}
        className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center"
      >
        <span className="font-mono text-xs tracking-[0.3em] text-accent-ink uppercase">
          {index}
        </span>
        <span className="serif mt-1 text-5xl text-bone [text-shadow:0_0_30px_var(--c-accent)] md:text-7xl">
          {label}
        </span>
      </motion.div>
    </div>
  );
}
