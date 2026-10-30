"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { profile, stats } from "@/data/portfolio";
import { THEMES, useTheme } from "./theme/ThemeProvider";
import Counter from "./Counter";
import Magnetic from "./Magnetic";
import useMediaQuery from "@/hooks/useMediaQuery";

/** Keys tie a source line to the piece of UI it builds. */
type Key =
  | "theme"
  | "badge"
  | "first"
  | "last"
  | "role"
  | "bio"
  | "actions"
  | "stats";

type Line = { code: string; reveal?: Key };

const CHARS_PER_SECOND = 150;

function source(seed: string): Line[] {
  return [
    { code: "import 'package:flutter/material.dart';" },
    { code: "" },
    { code: "void main() => runApp(const Portfolio());" },
    { code: "" },
    { code: "class Portfolio extends StatelessWidget {" },
    { code: "  @override" },
    { code: "  Widget build(BuildContext context) {" },
    { code: "    return Hero(" },
    { code: `      theme: ThemeData(seed: Color(${seed})),`, reveal: "theme" },
    {
      code: "      status: Badge('Open to work · Cairo, Egypt'),",
      reveal: "badge",
    },
    { code: "      title: Text('Ezzat'),", reveal: "first" },
    { code: "      shadow: Outlined('Ahmed'),", reveal: "last" },
    { code: "      role: Text('Flutter Developer'),", reveal: "role" },
    {
      code: "      bio: Text('I build production mobile apps'),",
      reveal: "bio",
    },
    {
      code: "      actions: [ViewWork(), Contact(), Resume()],",
      reveal: "actions",
    },
    {
      code: "      stats: Stats(years: 3, apps: 8, stores: 2),",
      reveal: "stats",
    },
    { code: "    );" },
    { code: "  }" },
    { code: "}" },
  ];
}

type Token = { text: string; cls: string };

const KEYWORDS = new Set([
  "import",
  "void",
  "main",
  "return",
  "class",
  "extends",
  "const",
  "final",
]);

/** Tiny Dart tokenizer — enough for one snippet, no dependency needed. */
function tokenize(line: string): Token[] {
  const out: Token[] = [];
  const re =
    /('[^']*'|\/\/.*$|@\w+|\b0x[0-9A-Fa-f]+\b|\b\d+\b|\b[A-Z]\w*\b|\b\w+(?=\s*:)|\b\w+\b|\s+|.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const text = m[0];
    let cls = "text-bone/70";
    if (text.startsWith("'")) cls = "text-code-str";
    else if (text.startsWith("//")) cls = "text-mute/60 italic";
    else if (text.startsWith("@")) cls = "text-mute";
    else if (/^0x|^\d+$/.test(text)) cls = "text-cyan";
    else if (KEYWORDS.has(text)) cls = "text-blue font-semibold";
    else if (/^[A-Z]/.test(text)) cls = "text-cyan";
    else if (/^\w+$/.test(text) && line[re.lastIndex] === ":")
      cls = "text-mute";
    out.push({ text, cls });
  }
  return out;
}

export default function CodeHero() {
  const { index, reloading } = useTheme();
  const seed = THEMES[index].seed;
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const lines = useMemo(() => source(seed), [seed]);

  // Character offset at the end of each line, over the whole snippet.
  const { ends, total } = useMemo(() => {
    const ends: number[] = [];
    let n = 0;
    for (const l of lines) {
      n += l.code.length + 1;
      ends.push(n);
    }
    return { ends, total: n };
  }, [lines]);

  const [rawTyped, setTyped] = useState(0);
  const [rawDone, setDone] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Reduced motion skips the performance entirely — derived, not stored, so no
  // state write is needed just to reflect a media query.
  const typed = reduced ? total : rawTyped;
  const done = reduced || rawDone;

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const n = Math.floor(((now - start) / 1000) * CHARS_PER_SECOND);
      if (n >= total) {
        setTyped(total);
        setDone(true);
        return;
      }
      setTyped(n);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, reduced]);

  // Keep the caret in view while the snippet grows.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed]);

  const skip = () => {
    setTyped(total);
    setDone(true);
  };

  const has = (key: Key) => {
    const i = lines.findIndex((l) => l.reveal === key);
    return i >= 0 && typed >= ends[i];
  };

  return (
    <section
      id="top"
      className="relative border-b border-line px-6 pt-28 pb-14 md:px-10"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-stretch">
        {/* ── Editor ─────────────────────────────────────────────── */}
        <div className="flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft lg:min-h-[520px]">
          <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="h-2.5 w-2.5 rounded-full bg-line" />
            </span>
            <span className="font-mono text-xs text-mute">hero.dart</span>
            {!done && (
              <button
                onClick={skip}
                className="ml-auto font-mono text-[11px] uppercase tracking-widest text-mute transition-colors hover:text-bone"
              >
                skip ⏭
              </button>
            )}
            {done && (
              <span className="ml-auto font-mono text-[11px] uppercase tracking-widest text-acid">
                ✓ built
              </span>
            )}
          </div>

          <div
            ref={scroller}
            className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-[1.75] md:text-[13px]"
          >
            {lines.map((line, i) => {
              const startOffset = i === 0 ? 0 : ends[i - 1];
              const visible = Math.max(
                0,
                Math.min(line.code.length, typed - startOffset),
              );
              if (visible === 0 && typed < startOffset) return null;

              const isCaretLine = typed >= startOffset && typed < ends[i];
              const highlight = line.reveal === "theme" && reloading;

              let used = 0;
              return (
                <div
                  key={i}
                  className={`flex gap-4 rounded px-1 transition-colors ${
                    highlight ? "bg-acid/15" : ""
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-mute/40 select-none">
                    {i + 1}
                  </span>
                  <span className="whitespace-pre">
                    {tokenize(line.code).map((tok, ti) => {
                      const from = used;
                      used += tok.text.length;
                      if (from >= visible) return null;
                      const text = tok.text.slice(0, visible - from);
                      return (
                        <span key={ti} className={tok.cls}>
                          {text}
                        </span>
                      );
                    })}
                    {isCaretLine && (
                      <span className="caret ml-px inline-block h-[1em] w-[7px] translate-y-[2px] bg-acid" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Live preview ───────────────────────────────────────── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-xs text-mute">
              preview · {THEMES[index].label}
            </span>
            {!has("badge") && (
              <span className="font-mono text-[11px] tracking-widest text-mute/70 uppercase">
                building widget tree…
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between gap-8 p-6 md:p-8">
            <div>
              {has("badge") && (
                <p className="widget-pop flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-mute">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
                  </span>
                  Open to work · {profile.location}
                </p>
              )}

              <h1 className="mt-6 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.86] font-bold tracking-[-0.04em]">
                {has("first") && (
                  <span className="widget-pop block">
                    {profile.name.split(" ")[0]}
                  </span>
                )}
                {has("last") && (
                  <span className="widget-pop block text-stroke">
                    {profile.name.split(" ")[1]}
                  </span>
                )}
              </h1>

              {has("role") && (
                <p className="widget-pop mt-5 font-mono text-xs uppercase tracking-[0.25em] text-blue">
                  {profile.role}
                </p>
              )}

              {has("bio") && (
                <p className="widget-pop mt-4 max-w-md leading-relaxed text-mute">
                  {profile.tagline}
                </p>
              )}
            </div>

            <div>
              {has("actions") && (
                <div className="widget-pop flex flex-wrap gap-3">
                  <Magnetic>
                    <a
                      href="#work"
                      data-cursor="See"
                      className="block rounded-full bg-acid px-6 py-3 font-mono text-xs font-semibold tracking-widest text-on-pop uppercase"
                    >
                      View work
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href={`mailto:${profile.email}`}
                      data-cursor="Mail"
                      className="block rounded-full border border-line px-6 py-3 font-mono text-xs tracking-widest uppercase transition-colors hover:border-bone"
                    >
                      Get in touch
                    </a>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block rounded-full border border-line px-6 py-3 font-mono text-xs tracking-widest text-mute uppercase transition-colors hover:border-blue hover:text-blue"
                    >
                      Résumé ↓
                    </a>
                  </Magnetic>
                </div>
              )}

              {has("stats") && (
                <dl className="widget-pop mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-2xl font-bold tracking-tight md:text-3xl">
                        <Counter value={s.value} />
                      </dt>
                      <dd className="mt-1 text-[11px] leading-snug text-mute">
                        {s.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
