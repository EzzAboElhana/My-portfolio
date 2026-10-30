"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let instance: Lenis | null = null;

/** Pause/resume page scrolling, e.g. while a modal is open. */
export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/**
 * Inertial scrolling for the whole page. Lenis still drives the native scroll
 * position, so motion's useScroll and sticky positioning keep working.
 * Reduced-motion users get plain 1:1 scrolling (Lenis's default).
 */
export default function SmoothScroll() {
  useEffect(() => {
    instance = new Lenis({
      lerp: 0.09,
      autoRaf: true,
      anchors: true,
    });
    // Lenis takes over smoothing; the CSS version would fight it.
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      instance?.destroy();
      instance = null;
    };
  }, []);

  return null;
}
