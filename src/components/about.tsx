"use client";

import { ArrowDownToLine, Layers, Sparkles } from "lucide-react";
import { useI18n } from "./i18n";
import { Chip, PanelBar, Reveal, Section, SectionHead, StatusDot } from "./ui";

/**
 * Editorial two-column: the left rail carries the identity and the philosophy
 * directives and stays with the reader; the right column is the reading track
 * — prose with display first lines, then the live checklist.
 */
export function About() {
  const { d } = useI18n();
  // "01 — About" → the numeral rides in the Eyebrow index slot.
  const [index, eyebrow] = d.about.eyebrow.split(" — ");

  const directives = [
    {
      n: "01",
      title: d.about.principles.automate.title,
      body: d.about.principles.automate.body,
      Icon: Sparkles,
    },
    {
      n: "02",
      title: d.about.principles.reliability.title,
      body: d.about.principles.reliability.body,
      Icon: Layers,
    },
    {
      n: "03",
      title: d.about.principles.simple.title,
      body: d.about.principles.simple.body,
      Icon: ArrowDownToLine,
    },
  ];

  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-x-16">
        {/* ---------- left rail: identity + engineering philosophy ---------- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Reveal className="reveal-mask">
              <SectionHead
                index={index}
                eyebrow={eyebrow ?? d.about.eyebrow}
                title={d.about.title}
                lead={d.about.lead}
              />
            </Reveal>

            <Reveal delay={120} className="mt-12">
              <p className="label-xs">{d.about.philosophyTitle}</p>
            </Reveal>

            <ul className="mt-5 grid gap-3">
              {directives.map(({ n, title, body, Icon }, i) => (
                <Reveal
                  as="li"
                  key={n}
                  delay={160 + i * 90}
                  className="reveal-x"
                >
                  <article className="panel grain ticks volt-rim p-5">
                    <div className="flex items-baseline gap-3">
                      <span className="numeral text-2xl leading-none">{n}</span>
                      <h3 className="font-display text-lg tracking-tight text-ink">
                        {title}
                      </h3>
                      <Icon
                        aria-hidden
                        className="ml-auto size-4 shrink-0 self-center text-dim"
                        strokeWidth={1.75}
                      />
                    </div>
                    <p className="mt-2.5 text-[0.85rem] leading-relaxed text-mute">
                      {body}
                    </p>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- right: the reading track ---------- */}
        <div className="lg:col-span-7">
          <div className="space-y-5">
            {d.about.body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 90}>
                <p className="max-w-2xl text-[0.95rem] leading-[1.75] text-mute first-line:display-wide first-line:text-[1.2em] first-line:leading-[1.45] first-line:text-ink">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          {/* the checklist someone would tape to the console */}
          <Reveal delay={200} className="mt-12 max-w-2xl">
            <div className="panel grain ticks overflow-hidden">
              <PanelBar title={d.about.nowTitle} />
              <ul className="divide-y divide-line">
                {d.about.now.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3">
                    <StatusDot pulse={false} className="mt-1.5 shrink-0" />
                    <span className="font-mono text-[0.8rem] leading-relaxed text-mute">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3.5">
                {d.about.stack.map((t) => (
                  <Chip key={t} tone="signal">
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
