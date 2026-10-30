import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { VariantKey } from "@/components/LabStage";

const LabStage = dynamic(() => import("@/components/LabStage"));

export const metadata: Metadata = {
  title: "Hero options — preview",
  robots: { index: false, follow: false },
};

const VARIANTS: VariantKey[] = ["particles", "terrain", "field", "panels"];

/** Throwaway compare page: every hero candidate, live, under the real copy. */
export default function Lab() {
  return (
    <main className="flex-1">
      <header className="border-b border-line px-6 py-8 md:px-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
          Preview
        </p>
        <h1 dir="rtl" className="mt-3 text-2xl font-bold md:text-3xl">
          اختار شكل الهيرو
        </h1>
        <p dir="rtl" className="mt-2 max-w-2xl text-sm text-mute">
          كل واحد شغال بجد — حرّك الماوس جوه كل قسم عشان تشوف رد فعله. قولّي
          الرقم اللي عاجبك وأنا أنفذه في الصفحة الرئيسية.
        </p>
      </header>

      {VARIANTS.map((v) => (
        <LabStage key={v} variant={v} />
      ))}
    </main>
  );
}
