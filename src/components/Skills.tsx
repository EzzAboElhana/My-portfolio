"use client";

import { skills } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";
import Stagger from "./Stagger";

/**
 * The toolkit, laid out as a readout panel floating over the starfield.
 *
 * This used to be the one inverted light block on the page. Against a
 * full-page star background an opaque panel reads as a hole punched through
 * the sky, so it is glass now — the aurora wash gives it enough separation
 * from the void without blocking it out.
 */
export default function Skills() {
  return (
    <section
      id="skills"
      className="text-scrim-wide relative px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          index="02 / Skills"
          title="The toolkit"
          kicker="Everything below has shipped in a production app, not just a tutorial."
        />

        <div className="glass aurora-wash relative overflow-hidden rounded-3xl p-7 md:p-12">
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group, i) => (
              <div key={group.title}>
                <p className="border-b border-line pb-3 font-mono text-xs tracking-[0.2em] text-cyan uppercase">
                  {group.title}
                </p>
                <Stagger
                  as="ul"
                  itemAs="li"
                  className="mt-5 space-y-2.5"
                  delay={(i % 4) * 0.06}
                  stagger={0.045}
                >
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="group flex items-baseline gap-2.5 text-lg leading-snug text-bone"
                    >
                      <span className="text-[10px] text-blue/50 transition-colors group-hover:text-blue">
                        ◆
                      </span>
                      {item}
                    </span>
                  ))}
                </Stagger>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
