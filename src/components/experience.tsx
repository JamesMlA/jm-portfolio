"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, Building2, MapPin } from "lucide-react";
import { useI18n } from "./i18n";
import { Chip, Reveal, Section, SectionHead } from "./ui";
import { timeline } from "@/content/data";
import { site } from "@/content/site";
import { cx } from "@/lib/utils";

/** Visual weight per role — the rail recedes as the work gets older. */
const weight = {
  lead: {
    card: "p-6 sm:p-8 border-line-hi",
    title: "text-xl sm:text-2xl",
    body: "text-[0.92rem]",
    dot: "size-3",
  },
  major: {
    card: "p-5 sm:p-6",
    title: "text-lg sm:text-xl",
    body: "text-[0.87rem]",
    dot: "size-2.5",
  },
  mid: {
    card: "p-5",
    title: "text-base sm:text-lg",
    body: "text-[0.83rem]",
    dot: "size-2",
  },
  small: {
    card: "p-4 sm:p-5",
    title: "text-sm sm:text-base",
    body: "text-[0.8rem]",
    dot: "size-1.5",
  },
} as const;

/**
 * A vertical timeline on a hairline spine. The spine is a scroll instrument:
 * a signal line draws over the hairline as the entries go by, and stands
 * fully drawn for anyone who asked for reduced motion.
 */
export function Experience() {
  const { d, l } = useI18n();
  // "02 — Experience" → the numeral rides in the Eyebrow index slot.
  const [index, eyebrow] = d.experience.eyebrow.split(" — ");

  const railRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start center", "end center"],
  });
  const draw = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <Section id="experience">
      <Reveal className="reveal-mask">
        <SectionHead
          index={index}
          eyebrow={eyebrow ?? d.experience.eyebrow}
          title={d.experience.title}
          lead={d.experience.lead}
          wide
        />
      </Reveal>

      <div ref={railRef} className="relative mt-14">
        {/* the rail: hairline first, the signal drawn over it by scroll */}
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-line-hi via-line-hi to-line"
        />
        {reduced === false ? (
          <motion.span
            aria-hidden
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-signal via-signal/60 to-signal/10"
            style={{ scaleY: draw }}
          />
        ) : null}

        <ol className="space-y-6">
          {timeline.map((entry, entryIndex) => {
            const w = weight[entry.scale];
            const dim = entry.scale === "small";

            return (
              <Reveal
                as="li"
                key={entry.id}
                delay={entryIndex * 80}
                className="reveal-x relative pl-8 sm:pl-12"
              >
                {/* node on the rail */}
                <span
                  aria-hidden
                  className={cx(
                    "absolute top-8 left-[7px] -translate-x-1/2 rounded-full border-2 border-void",
                    w.dot,
                    entry.current ? "bg-signal" : dim ? "bg-faint" : "bg-line-hi",
                    entry.current &&
                      "shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-signal)_18%,transparent)]",
                  )}
                />
                {entry.current ? (
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-8 left-[7px] -translate-x-1/2 animate-ping rounded-full bg-signal/40",
                      w.dot,
                    )}
                    style={{ animationDuration: "3.4s" }}
                  />
                ) : null}

                <article className={cx("panel grain ticks volt-rim", w.card)}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                    <h3
                      className={cx(
                        "font-display tracking-tight",
                        w.title,
                        dim ? "text-mute" : "text-ink",
                      )}
                    >
                      {l(entry.role)}
                    </h3>

                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group inline-flex items-center gap-1.5 font-mono text-2xs tracking-wide text-azure transition-colors hover:text-signal"
                      >
                        <Building2
                          aria-hidden
                          className="size-3"
                          strokeWidth={1.75}
                        />
                        {entry.company}
                        <ArrowUpRight
                          aria-hidden
                          className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={1.75}
                        />
                        <span className="sr-only">{d.a11y.external}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-mono text-2xs tracking-wide text-signal">
                        <Building2
                          aria-hidden
                          className="size-3"
                          strokeWidth={1.75}
                        />
                        {entry.company}
                      </span>
                    )}

                    <span className="ml-auto flex items-center gap-2 font-mono text-2xs text-dim tabular-nums">
                      {entry.current ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal-deep px-2 py-0.5 text-signal-text">
                          {d.experience.current}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-line-hi px-2 py-0.5 text-faint">
                          {d.experience.older}
                        </span>
                      )}
                      {l(entry.period)}
                    </span>
                  </div>

                  <p
                    className={cx(
                      "mt-3 max-w-3xl leading-relaxed text-mute",
                      w.body,
                    )}
                  >
                    {l(entry.summary)}
                  </p>

                  <div className="mt-5 border-t border-line pt-4">
                    <p className="label-xs">{d.experience.focusLabel}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {entry.focus.map((f) => (
                        <li key={f.en}>
                          <Chip tone={entry.current ? "signal" : "neutral"}>
                            {l(f)}
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>

      <Reveal
        delay={120}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <span className="flex items-center gap-2 font-mono text-2xs text-faint">
          <MapPin aria-hidden className="size-3" strokeWidth={1.75} />
          {site.location} · {d.experience.remote}
        </span>
        <span className="font-mono text-2xs text-faint">
          <span aria-hidden className="text-signal">
            ●
          </span>{" "}
          {d.hero.availability}
        </span>
      </Reveal>
    </Section>
  );
}
