"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { marquee } from "@/data/portfolio";

/**
 * Tech strip that drifts on its own, but speeds up, reverses and skews with
 * scroll direction — the page feels physical rather than static.
 */
export default function Marquee() {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [-2000, 2000], [-4, 4], {
    clamp: false,
  });
  const skew = useTransform(smoothVelocity, [-2000, 2000], [-6, 6], {
    clamp: true,
  });

  // Rendered twice; -50% of the track equals one full copy.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = direction.current * -2 * (delta / 1000);

    // Scrolling down pushes the strip left, scrolling up drags it back right.
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;

    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const track = [...marquee, ...marquee, ...marquee, ...marquee];

  return (
    <motion.div
      style={{ skewX: skew }}
      className="glass overflow-hidden border-x-0 py-5"
    >
      <motion.div
        style={{ x }}
        className="flex w-max items-center gap-10 whitespace-nowrap"
      >
        {track.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-mono text-sm uppercase tracking-[0.2em] text-mute">
              {item}
            </span>
            <span className="text-blue">✳</span>
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
