"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*·";

type Props = {
  text: string;
  className?: string;
  /** Seconds to wait before the decode starts. */
  delay?: number;
  /** Frames each character stays scrambled before it locks in. */
  hold?: number;
};

/**
 * Decodes text character by character, like a signal locking on.
 *
 * Renders the final string on the server and during the first client render —
 * scrambled markup would mismatch on hydration, and a visitor with JS disabled
 * or reduced motion on should simply read the text.
 */
export default function Scramble({
  text,
  className,
  delay = 0,
  hold = 2,
}: Props) {
  // null means "show the real text" — the state holds only the transient
  // scrambled frames, so the server render and the settled render are both
  // just `text` with no extra state to keep in sync.
  const [scrambled, setScrambled] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timer = 0;
    let frame = 0;

    const tick = () => {
      const settled = Math.floor(frame / hold);

      if (settled >= text.length) {
        setScrambled(null);
        return;
      }

      let next = "";
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (i < settled || char === " ") next += char;
        else next += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setScrambled(next);

      frame += 1;
      raf = requestAnimationFrame(tick);
    };

    // Blank first, so the text decodes in rather than appearing and then
    // glitching. Deferred by a frame because a synchronous setState inside an
    // effect triggers a cascading render — one frame of real text is invisible.
    raf = requestAnimationFrame(() => {
      setScrambled(" ".repeat(text.length));
      timer = window.setTimeout(() => {
        raf = requestAnimationFrame(tick);
      }, delay * 1000);
    });

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, hold]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{scrambled ?? text}</span>
    </span>
  );
}
