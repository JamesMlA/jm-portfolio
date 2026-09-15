"use client";

import { useState } from "react";
import { ArrowDownToLine, CircleCheck, Layers, Sparkles } from "lucide-react";
import { useI18n } from "./i18n";
import { Chip, Reveal, Section, SectionHead } from "./ui";
import { cx } from "@/lib/utils";

export function About() {
  const { d } = useI18n();
  const [open, setOpen] = useState<string | null>("automate");

  const principles = [
    { id: "automate", n: "01", title: d.about.principles.automate.title, body: d.about.principles.automate.body, Icon: Sparkles },
    { id: "reliability", n: "02", title: d.about.principles.reliability.title, body: d.about.principles.reliability.body, Icon: Layers },
    { id: "simple", n: "03", title: d.about.principles.simple.title, body: d.about.principles.simple.body, Icon: ArrowDownToLine },
  ];

  return (
    <Section id="about">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHead eyebrow={d.about.eyebrow} title={d.about.title} lead={d.about.lead} />
          </Reveal>

          <div className="mt-8 space-y-5">
            {d.about.body.map((paragraph, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="max-w-2xl text-[0.95rem] leading-[1.75] text-mute">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160} className="mt-12">
            <div>
              <p className="label-xs">{d.about.philosophyTitle}</p>
              <ul className="mt-5 border-t border-line">
                {principles.map(({ id, n, title, body, Icon }) => {
                  const isOpen = open === id;
                  return (
                    <li key={id} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : id)}
                        aria-expanded={isOpen}
                        className="group flex w-full items-center gap-4 py-4 text-left"
                      >
                        <span className="font-mono text-2xs text-faint">{n}</span>
                        <Icon
                          className={cx(
                            "size-4 shrink-0 transition-colors",
                            isOpen ? "text-signal" : "text-dim group-hover:text-mute",
                          )}
                          strokeWidth={1.75}
                        />
                        <span
                          className={cx(
                            "font-display text-lg tracking-tight transition-colors",
                            isOpen ? "text-ink" : "text-mute group-hover:text-ink",
                          )}
                        >
                          {title}
                        </span>
                        <span
                          aria-hidden
                          className={cx(
                            "ml-auto font-mono text-xs text-faint transition-transform duration-300",
                            isOpen && "rotate-45",
                          )}
                        >
                          +
                        </span>
                      </button>
                      <div
                        className={cx(
                          "grid transition-all duration-400 ease-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="overflow-hidden pr-8 pb-4 pl-12 text-sm leading-relaxed text-mute">
                          {body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120} className="lg:col-span-5">
          <aside className="panel grain ticks sticky top-24 overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 rounded-full bg-signal" />
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-signal" />
              </span>
              <span className="font-mono text-2xs tracking-[0.16em] text-dim uppercase">
                {d.about.nowTitle}
              </span>
              <span className="ml-auto font-mono text-2xs text-faint">2026</span>
            </div>

            <ul className="divide-y divide-line">
              {d.about.now.map((item, i) => (
                <li key={i} className="flex gap-3 px-4 py-3.5">
                  <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-signal/70" strokeWidth={1.75} />
                  <span className="text-[0.82rem] leading-relaxed text-mute">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3.5">
              {["Linux", "Kubernetes", "Terraform", "AWS", "Python", "Go"].map((t) => (
                <Chip key={t} tone="signal">
                  {t}
                </Chip>
              ))}
            </div>
          </aside>
        </Reveal>
      </div>
    </Section>
  );
}
