/**
 * Scroll state shared between React and the WebGL frame loop.
 *
 * The 3D scene needs scroll position and velocity every frame, but routing
 * that through React state would re-render the tree ~60 times a second. So a
 * single listener writes into this module-level object and `useFrame` reads
 * it — no renders, no prop drilling, one source of truth.
 */
export const scroll = {
  /** Pixels from the top. */
  y: 0,
  /** 0 → 1 across the whole document. */
  progress: 0,
  /** Smoothed pixels-per-frame, signed. Drives the warp effect. */
  velocity: 0,
};

let started = false;

/** Idempotent — mounting several space components must not stack listeners. */
export function startScrollTracking() {
  if (started || typeof window === "undefined") return () => {};
  started = true;

  let raf = 0;
  let previous = window.scrollY;

  const tick = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    scroll.y = y;
    scroll.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    // Ease toward the raw delta so a flung scroll ramps up and coasts down
    // instead of snapping the starfield between still and streaking.
    const delta = y - previous;
    scroll.velocity += (delta - scroll.velocity) * 0.12;
    previous = y;

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    started = false;
  };
}
