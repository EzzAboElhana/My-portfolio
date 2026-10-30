"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeName = "deep" | "nebula" | "mars" | "aurora";

/**
 * Each theme carries its CSS palette name plus the colours the WebGL scene
 * needs. Three.js can't read CSS custom properties, so the scene colours live
 * here as hex and reach the canvas through context — one list to edit when a
 * palette changes, rather than two that quietly drift apart.
 *
 * Every theme is dark on purpose: the starfield renders behind the entire
 * page, and a light palette would wash it out completely.
 */
export const THEMES: {
  name: ThemeName;
  label: string;
  seed: string;
  brightness: "dark" | "light";
  scene: {
    star: string;
    nebulaA: string;
    nebulaB: string;
    body: string;
    /**
     * Hero orb hues, ordered [base, base, base, accent].
     *
     * The first three are the cool/primary family and cover the surface; the
     * fourth is the loud one and is applied sparsely in the shader. Order
     * matters — swapping the accent into a base slot turns the orb into a
     * single saturated blob.
     *
     * Deliberately *not* derived from the nebula colours: those sit in one
     * family per theme, and an orb mixed from them comes out monochrome.
     */
    orb: [string, string, string, string];
  };
}[] = [
  {
    name: "deep",
    label: "Deep Space",
    seed: "0xFF6AE4FF",
    brightness: "dark",
    scene: {
      star: "#dce6ff",
      nebulaA: "#2f6df6",
      nebulaB: "#7b3ff2",
      body: "#6ae4ff",
      orb: ["#22d3ee", "#38bdf8", "#3b82f6", "#ff4d9d"],
    },
  },
  {
    name: "nebula",
    label: "Nebula",
    seed: "0xFFE879F9",
    brightness: "dark",
    scene: {
      star: "#f6e6ff",
      nebulaA: "#a021c9",
      nebulaB: "#4a1fb8",
      body: "#e879f9",
      orb: ["#38bdf8", "#818cf8", "#a78bfa", "#e879f9"],
    },
  },
  {
    name: "mars",
    label: "Mars",
    seed: "0xFFFF7849",
    brightness: "dark",
    scene: {
      star: "#ffe8d8",
      nebulaA: "#d4451c",
      nebulaB: "#8a2a10",
      body: "#ff7849",
      orb: ["#ffb020", "#ff8b3d", "#ff6b2c", "#ff2d6f"],
    },
  },
  {
    name: "aurora",
    label: "Aurora",
    seed: "0xFF2EE6A8",
    brightness: "dark",
    scene: {
      star: "#dbfff2",
      nebulaA: "#12a37a",
      nebulaB: "#1667a8",
      body: "#2ee6a8",
      orb: ["#2ee6a8", "#5eead4", "#38bdf8", "#a3e635"],
    },
  },
];

type Ctx = {
  theme: ThemeName;
  index: number;
  reloading: boolean;
  scene: (typeof THEMES)[number]["scene"];
  hotReload: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [reloading, setReloading] = useState(false);

  const hotReload = useCallback(() => {
    setIndex((i) => {
      const next = (i + 1) % THEMES.length;
      // Drive the attribute directly: every colour token reads from it, so one
      // write repaints the entire page.
      document.documentElement.dataset.theme = THEMES[next].name;
      return next;
    });
    setReloading(true);
    window.setTimeout(() => setReloading(false), 700);
  }, []);

  const value = useMemo(
    () => ({
      theme: THEMES[index].name,
      index,
      reloading,
      scene: THEMES[index].scene,
      hotReload,
    }),
    [index, reloading, hotReload],
  );

  return (
    <ThemeCtx.Provider value={value}>
      {children}
      {reloading && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80] bg-blue"
          style={{ animation: "reload-flash 0.7s ease-out both" }}
        />
      )}
    </ThemeCtx.Provider>
  );
}
