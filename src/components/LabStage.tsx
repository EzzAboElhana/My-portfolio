"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import ParticleMorph from "./three/variants/ParticleMorph";
import WireTerrain from "./three/variants/WireTerrain";
import ShaderField from "./three/variants/ShaderField";
import GlassPanels from "./three/variants/GlassPanels";
import { profile } from "@/data/portfolio";

export type VariantKey = "particles" | "terrain" | "field" | "panels";

const COPY: Record<
  VariantKey,
  { n: string; title: string; note: string; bloom: boolean }
> = {
  particles: {
    n: "1",
    title: "سحابة جزيئات بتتحول",
    note: "كرة ← عقدة ← موبايل. في الموقع الحقيقي التحول هيمشي مع السكرول بدل المؤقت.",
    bloom: true,
  },
  terrain: {
    n: "3",
    title: "أرضية شبكية متموجة",
    note: "موجات بتعدي في الشبكة ناحية الأفق، وبتزيد لما تحرك الماوس.",
    bloom: true,
  },
  field: {
    n: "5",
    title: "خلفية شادر سائلة",
    note: "مفيش مجسم — الألوان بتسيح وبتتسحب ناحية المؤشر.",
    bloom: false,
  },
  panels: {
    n: "4",
    title: "لوحات زجاجية طايرة",
    note: "لوح لكل مشروع، بيلفوا في حلقة وبيتبعوا الماوس.",
    bloom: true,
  },
};

/** One full-height stage per variant, with the real hero copy laid over it. */
export default function LabStage({ variant }: { variant: VariantKey }) {
  const pointer = useRef({ x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);
  const meta = COPY[variant];

  useEffect(() => {
    // Pointer is measured within this stage, so each one reacts independently.
    const el = box.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      ref={box}
      className="relative h-[86svh] min-h-[560px] overflow-hidden border-b border-line"
    >
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          {variant === "particles" && <ParticleMorph pointer={pointer} />}
          {variant === "terrain" && <WireTerrain pointer={pointer} />}
          {variant === "field" && <ShaderField pointer={pointer} />}
          {variant === "panels" && <GlassPanels pointer={pointer} />}
          {meta.bloom && (
            <EffectComposer>
              <Bloom
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.5}
                mipmapBlur
              />
            </EffectComposer>
          )}
        </Canvas>
      </div>

      {/* The actual hero copy, so each option is judged in context. */}
      <div className="pointer-events-none relative flex h-full flex-col justify-between p-6 md:p-12">
        <div>
          <span className="rounded-full border border-line bg-ink/70 px-4 py-1.5 font-mono text-xs tracking-widest text-acid backdrop-blur">
            OPTION {meta.n}
          </span>
          <h2
            dir="rtl"
            className="mt-5 text-3xl font-bold tracking-tight md:text-5xl"
          >
            {meta.title}
          </h2>
          <p
            dir="rtl"
            className="mt-3 max-w-xl text-sm leading-relaxed text-mute md:text-base"
          >
            {meta.note}
          </p>
        </div>

        <div>
          <h3 className="text-[clamp(2.5rem,9vw,7rem)] font-bold leading-[0.85] tracking-[-0.04em]">
            <span className="block">{profile.name.split(" ")[0]}</span>
            <span className="block text-stroke">
              {profile.name.split(" ")[1]}
            </span>
          </h3>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-cyan">
            {profile.role}
          </p>
        </div>
      </div>
    </section>
  );
}
