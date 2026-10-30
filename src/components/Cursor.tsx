"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Blend-mode cursor ring. Pointer-fine devices only — touch never sees it.
 * Grows and labels itself over anything carrying data-cursor.
 */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.4 });

  const enabled = useMediaQuery(
    "(pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button",
      );
      setActive(Boolean(hit));
      setLabel(hit?.dataset.cursor ?? null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed top-0 left-0 z-[70] mix-blend-difference"
    >
      <motion.div
        animate={{
          width: label ? 84 : active ? 46 : 22,
          height: label ? 84 : active ? 46 : 22,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bone"
      >
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
