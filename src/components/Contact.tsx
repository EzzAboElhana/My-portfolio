import { profile } from "@/data/portfolio";
import Reveal from "./Reveal";


const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "Phone", value: profile.phone, href: profile.phoneHref },
  { label: "GitHub", value: "@EzzAboElhana", href: profile.github },
  { label: "LinkedIn", value: "Ezzat Ahmed", href: profile.linkedin },
  { label: "Résumé", value: "Download PDF", href: profile.resumeUrl },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="text-scrim-wide relative overflow-hidden px-6 pt-28 pb-16 md:px-10 md:pt-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.3em] text-blue uppercase">
            05 / Contact
          </p>
          <h2 className="type-lift mt-6 text-[clamp(2.8rem,10vw,8rem)] font-bold leading-[0.9] tracking-[-0.04em]">
            Let&apos;s build
            <br />
            <span className="text-stroke">something.</span>
          </h2>
          <a
            href={`mailto:${profile.email}`}
            className="mt-10 inline-block border-b border-line pb-1 text-lg text-mute transition-colors hover:border-blue hover:text-bone md:text-2xl"
          >
            {profile.email}
          </a>
        </Reveal>

        <Reveal delay={0.15}>
          {/* Separate tiles rather than one bordered grid: the column count
              changes twice across breakpoints, and per-cell border rules that
              stay correct at 1, 2 and 5 columns are not worth the nth-child
              gymnastics. Gaps also let the starfield through between them. */}
          <dl className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {links.map((l) => {
              // mailto: and tel: stay in place; web links and the PDF open in a new tab.
              const external =
                l.href.startsWith("http") || l.href.endsWith(".pdf");
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer noopener" : undefined}
                  className="group glass rounded-2xl p-7 transition-all duration-300 hover:border-blue/50 hover:shadow-[0_0_34px_-12px_var(--c-glow)]"
                >
                  <dt className="font-mono text-[11px] tracking-[0.2em] text-mute uppercase">
                    {l.label}
                  </dt>
                  <dd className="mt-3 text-base transition-colors group-hover:text-blue">
                    {l.value}
                  </dd>
                </a>
              );
            })}
          </dl>
        </Reveal>

        <footer className="mt-24 flex flex-col gap-3 border-t border-line pt-8 font-mono text-[11px] uppercase tracking-widest text-mute sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>{profile.location}</span>
        </footer>
      </div>
    </section>
  );
}
