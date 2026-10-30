"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Starfield from "./Starfield";
import Nebula from "./Nebula";
import SiriOrb from "./SiriOrb";
import { useTheme } from "@/components/theme/ThemeProvider";
import { startScrollTracking } from "@/lib/scroll";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * One fixed canvas behind the entire document.
 *
 * Every 3D element on the site lives in here — a canvas per section would mean
 * a WebGL context per section, and browsers cap those at around sixteen before
 * they start silently killing the oldest. It also lets the planet keep flying
 * as the visitor scrolls past the hero rather than unmounting mid-motion.
 */
export default function SpaceCanvas() {
  const { scene } = useTheme();
  const pointer = useRef({ x: 0, y: 0 });

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse)");

  useEffect(() => startScrollTracking(), []);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      // The canvas is decoration; it must never intercept a click or a scroll.
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, coarse ? 1.3 : 1.6]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        // Reduced motion still gets the scene, just frozen — a static
        // starfield is nicer than a black rectangle.
        frameloop={reduced ? "demand" : "always"}
      >
        <Nebula
          colorA={scene.nebulaA}
          colorB={scene.nebulaB}
          still={reduced}
        />
        <Starfield colorA={scene.star} colorB={scene.body} still={reduced} />
        <SiriOrb colors={scene.orb} pointer={pointer} still={reduced} />

        {/* No postprocessing pass here on purpose: the scene is entirely
            additive geometry on a transparent clear colour, and running it
            through EffectComposer flattened it to near-black. The halo/core
            falloff is baked into the point shaders instead, which costs
            nothing extra and survives on low-end GPUs. */}
      </Canvas>
    </div>
  );
}
