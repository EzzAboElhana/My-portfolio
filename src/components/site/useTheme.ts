"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** Watches `data-theme` on <html>, which the inline script in layout sets. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const read = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export default function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);

  const toggle = useCallback(() => {
    const next: Theme = read() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode: the choice just won't persist.
    }
  }, []);

  return { theme, toggle };
}
