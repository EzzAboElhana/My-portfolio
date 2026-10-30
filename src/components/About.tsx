import {
  education,
  languages,
  profile,
  strengths,
} from "@/data/portfolio";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import WordReveal from "./WordReveal";
import Stagger from "./Stagger";

export default function About() {
  return (
    <section
      id="about"
      className="text-scrim relative px-6 py-28 md:px-10 md:py-40"
    >
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading index="01 / About" title="Who's behind the code" />

        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <WordReveal
              text={profile.summary}
              className="text-xl leading-relaxed md:text-2xl md:leading-relaxed"
            />

            <Stagger
              as="ul"
              itemAs="li"
              className="mt-12 grid gap-3 sm:grid-cols-2"
            >
              {strengths.map((s) => (
                <span key={s} className="flex items-start gap-3 text-sm text-mute">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue" />
                  {s}
                </span>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.15} className="space-y-8">
            <div className="glass rounded-2xl p-7">
              <p className="font-mono text-xs tracking-[0.25em] text-cyan uppercase">
                Education
              </p>
              <p className="mt-4 text-lg leading-snug font-semibold">
                {education.degree}
              </p>
              <p className="mt-2 text-sm text-mute">{education.school}</p>
              <p className="mt-1 font-mono text-xs text-mute">
                {education.period} · {education.location}
              </p>
            </div>

            <div className="glass rounded-2xl p-7">
              <p className="font-mono text-xs tracking-[0.25em] text-cyan uppercase">
                Languages
              </p>
              <ul className="mt-4 space-y-3">
                {languages.map((l) => (
                  <li
                    key={l.name}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="text-base">{l.name}</span>
                    <span className="font-mono text-xs text-mute">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
