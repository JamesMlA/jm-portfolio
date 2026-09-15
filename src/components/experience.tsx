"use client";

import { useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { useI18n } from "./i18n";
import { Chip, Reveal, Section, SectionHead } from "./ui";
import { timeline } from "@/content/data";
import { site } from "@/content/site";
import { cx } from "@/lib/utils";

/** Visual weight per role — older entries recede. */
const weight = {
  lead: {
    row: "py-7 sm:py-9",
    title: "text-xl sm:text-2xl",
    dot: "size-3",
    body: "text-[0.92rem]",
    chips: "gap-1.5",
  },
  major: {
    row: "py-6",
    title: "text-lg sm:text-xl",
    dot: "size-2.5",
    body: "text-[0.87rem]",
    chips: "gap-1.5",
  },
  mid: {
    row: "py-5",
    title: "text-base sm:text-lg",
    dot: "size-2",
    body: "text-[0.83rem]",
    chips: "gap-1",
  },
  small: {
    row: "py-4",
    title: "text-sm sm:text-base",
    dot: "size-1.5",
    body: "text-[0.8rem]",
    chips: "gap-1",
  },
} as const;

export function Experience() {
  const { d, l } = useI18n();
  const [open, setOpen] = useState<string>("niuro");

  return (
    <Section id="experience">
      <Reveal>
        <SectionHead
          eyebrow={d.experience.eyebrow}
          title={d.experience.title}
          lead={d.experience.lead}
          wide
        />
      </Reveal>

      <ol className="relative mt-14">
        {/* the rail, brightest where the work is current */}
        <span
          aria-hidden
          className="absolute top-2 bottom-24 left-[7px] w-px bg-gradient-to-b from-signal/60 via-line-hi to-transparent"
        />

        {timeline.map((entry, index) => {
          const w = weight[entry.scale];
          const isOpen = open === entry.id;
          const dim = entry.scale === "small";

          return (
            <Reveal as="li" key={entry.id} delay={index * 60} className="relative pl-8 sm:pl-10">
              <span
                aria-hidden
                className={cx(
                  "absolute top-[2.15rem] left-0 rounded-full border-2 border-void",
                  w.dot,
                  entry.current ? "bg-signal" : dim ? "bg-faint" : "bg-line-hi",
                  entry.current && "shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-signal)_18%,transparent)]",
                )}
              />
              {entry.current ? (
                <span
                  aria-hidden
                  className={cx(
                    "absolute top-[2.15rem] left-0 animate-ping rounded-full bg-signal/40",
                    w.dot,
                  )}
                  style={{ animationDuration: "3.4s" }}
                />
              ) : null}

              <div className={cx("border-b border-line", w.row)}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? "" : entry.id)}
                  aria-expanded={isOpen}
                  className="group flex w-full flex-col gap-2 text-left"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3
                      className={cx(
                        "font-display tracking-tight transition-colors",
                        w.title,
                        dim ? "text-mute group-hover:text-ink" : "text-ink",
                      )}
                    >
                      {l(entry.role)}
                    </h3>
                    <span className="flex items-center gap-1.5 font-mono text-2xs text-signal">
                      <Building2 className="size-3" strokeWidth={1.75} />
                      {entry.company}
                    </span>
                    <span className="ml-auto flex items-center gap-2 font-mono text-2xs text-dim tabular-nums">
                      {entry.current ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-signal/40 bg-signal-deep px-2 py-0.5 text-signal-text">
                          {d.experience.current}
                        </span>
                      ) : null}
                      {l(entry.period)}
                    </span>
                  </div>

                  <p
                    className={cx(
                      "max-w-3xl leading-relaxed text-mute",
                      w.body,
                      !isOpen && "line-clamp-2",
                    )}
                  >
                    {l(entry.summary)}
                  </p>

                  {isOpen ? (
                    <div className={cx("mt-2 flex flex-wrap", w.chips)}>
                      {entry.focus.map((f) => (
                        <Chip key={f.en} tone={entry.current ? "signal" : "neutral"}>
                          {l(f)}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <span className="mt-1 flex items-center gap-3 font-mono text-2xs text-faint">
                      <span className="h-px w-4 bg-line-hi" />
                      {entry.focus.length} {d.experience.focusLabel.toLowerCase()}
                    </span>
                  )}
                </button>
              </div>
            </Reveal>
          );
        })}
      </ol>

      <Reveal delay={120} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="flex items-center gap-2 font-mono text-2xs text-faint">
          <MapPin className="size-3" strokeWidth={1.75} />
          {site.location} · remote-friendly
        </span>
        <span className="font-mono text-2xs text-faint">
          <span className="text-signal">●</span> {d.hero.availability}
        </span>
      </Reveal>
    </Section>
  );
}
