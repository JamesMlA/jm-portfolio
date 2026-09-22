"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { Chip, Reveal, Section, SectionHead } from "./ui";
import { principles } from "@/content/data";
import { cx } from "@/lib/utils";

/**
 * Principles as directive cards instead of a force graph: focus one and the
 * cards it does not pull on recede, so the coupling reads without drawing it.
 * Hover previews the coupling, a click pins it for keyboard and touch.
 */
export function Thinking() {
  const { d, l } = useI18n();
  // "05 — Mental model" → the numeral rides in the Eyebrow index slot.
  const [index, eyebrow] = d.thinking.eyebrow.split(" — ");

  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hover ?? pinned;
  const activePrinciple = principles.find((p) => p.id === active);

  return (
    <Section id="thinking" className="bg-abyss">
      <Reveal className="reveal-mask">
        <SectionHead
          index={index}
          eyebrow={eyebrow ?? d.thinking.eyebrow}
          title={d.thinking.title}
          lead={d.thinking.lead}
          wide
        />
      </Reveal>

      <Reveal delay={80} className="mt-4">
        <p className="font-mono text-2xs tracking-wide text-faint">
          {d.thinking.focusHint}
        </p>
      </Reveal>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {principles.map((p, i) => {
          const isActive = p.id === active;
          const isLit =
            active === null || isActive || activePrinciple?.pulls.includes(p.id);

          return (
            <Reveal as="li" key={p.id} delay={i * 70} className="h-full">
              <button
                type="button"
                aria-pressed={pinned === p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                onClick={() => setPinned((v) => (v === p.id ? null : p.id))}
                className={cx(
                  "panel grain ticks volt-rim flex h-full w-full flex-col p-6 text-left transition-opacity duration-300",
                  isLit ? "opacity-100" : "opacity-35",
                )}
              >
                <div className="flex items-baseline gap-3">
                  <span aria-hidden className="numeral text-3xl leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg tracking-tight text-ink">
                    {l(p.label)}
                  </h3>
                </div>

                <p className="label-xs mt-5">{d.thinking.detail}</p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-mute">
                  {l(p.detail)}
                </p>

                <p className="label-xs mt-5">{d.thinking.related}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.pulls.map((id) => (
                    <Chip
                      key={id}
                      tone={isActive ? "signal" : "neutral"}
                    >
                      {l(principles.find((x) => x.id === id)!.label)}
                    </Chip>
                  ))}
                </div>
              </button>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
