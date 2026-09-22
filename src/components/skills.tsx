"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useI18n } from "./i18n";
import { PanelBar, Reveal, Section, SectionHead } from "./ui";
import { SignalField } from "@/components/render/signal-field";
import { skillDomains } from "@/content/data";
import { cx } from "@/lib/utils";

export function Skills() {
  const { d, l } = useI18n();
  const [domain, setDomain] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<{ domain: string; name: string } | null>({
    domain: "cloud",
    name: "AWS",
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skillDomains
      .filter((g) => domain === "all" || g.id === domain)
      .map((g) => ({
        ...g,
        skills: g.skills.filter(
          (s) => !q || `${s.name} ${l(s.note)}`.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.skills.length > 0);
  }, [domain, l, query]);

  const total = visible.reduce((n, g) => n + g.skills.length, 0);

  const active =
    focus &&
    skillDomains
      .find((g) => g.id === focus.domain)
      ?.skills.find((s) => s.name === focus.name);

  return (
    <Section id="skills">
      {/* subsystem signal-flow field, behind everything */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="relative h-full opacity-25">
          <SignalField variant="flow" />
        </div>
      </div>

      <div className="relative">
        <Reveal className="reveal-mask">
          <SectionHead
            index="04"
            eyebrow={d.skills.eyebrow.replace(/^\d+\s*—\s*/, "")}
            title={d.skills.title}
            lead={d.skills.lead}
          />
        </Reveal>

        {/* filter console */}
        <Reveal className="mt-12" delay={60}>
          <div className="panel grain flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-end lg:gap-8">
            <div className="min-w-0 flex-1">
              <p className="label-xs">{d.skills.hint}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  {
                    id: "all",
                    label: { en: d.skills.all, es: d.skills.all },
                    count: skillDomains.reduce((n, g) => n + g.skills.length, 0),
                  },
                  ...skillDomains.map((g) => ({
                    id: g.id,
                    label: g.label,
                    count: g.skills.length,
                  })),
                ].map((item) => {
                  const isActive = domain === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDomain(item.id)}
                      aria-pressed={isActive}
                      className={cx(
                        "volt-rim flex min-h-8 items-center gap-2.5 rounded-md border px-3 py-1.5 text-left transition-colors duration-300",
                        isActive
                          ? "border-signal/45 bg-signal-deep text-signal-text"
                          : "border-line text-mute hover:border-line-hi hover:text-ink",
                      )}
                    >
                      <span className="font-mono text-2xs tracking-wide whitespace-nowrap">
                        {l(item.label)}
                      </span>
                      <span
                        className={cx(
                          "font-mono text-2xs tabular-nums",
                          isActive ? "text-signal/70" : "text-faint",
                        )}
                      >
                        {String(item.count).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex min-w-0 items-center gap-2 rounded-md border border-line px-3 py-2 lg:w-64 lg:shrink-0">
              <Search className="size-3.5 shrink-0 text-faint" strokeWidth={1.75} />
              <span className="sr-only">{d.skills.searchLabel}</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={d.skills.searchPlaceholder}
                className="w-full bg-transparent font-mono text-2xs text-ink placeholder:text-faint focus:outline-none"
              />
            </label>
          </div>
        </Reveal>

        {/* readout */}
        <div className="mt-5 flex items-baseline gap-3 border-b border-line pb-2">
          <span className="label-xs">
            {total} {d.skills.count}
          </span>
          <span className="ml-auto font-mono text-2xs text-faint">
            {query ? `/${query}` : "—"}
          </span>
        </div>

        {/* subsystem panels + context inspector */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-x-8">
          <div className="min-w-0 lg:col-span-8">
            {visible.length === 0 ? (
              <p className="py-10 font-mono text-xs text-faint">{d.skills.empty}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {visible.map((group, gi) => (
                  <Reveal
                    key={group.id}
                    delay={gi * 70}
                    className={cx("min-w-0", visible.length === 1 && "sm:col-span-2")}
                  >
                    <div className="panel ticks flex h-full flex-col">
                      <PanelBar
                        title={l(group.label)}
                        meta={String(group.skills.length).padStart(2, "0")}
                      />
                      <ul className="flex flex-wrap gap-1.5 p-4">
                        {group.skills.map((skill) => {
                          const isActive =
                            focus?.domain === group.id && focus?.name === skill.name;
                          return (
                            <li key={skill.name}>
                              <button
                                type="button"
                                onMouseEnter={() =>
                                  setFocus({ domain: group.id, name: skill.name })
                                }
                                onFocus={() =>
                                  setFocus({ domain: group.id, name: skill.name })
                                }
                                onClick={() =>
                                  setFocus({ domain: group.id, name: skill.name })
                                }
                                aria-pressed={isActive}
                                className={cx(
                                  "volt-rim flex min-h-8 items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-2xs whitespace-nowrap transition-colors duration-300",
                                  isActive
                                    ? "border-signal/50 bg-signal-deep text-signal-text"
                                    : "border-line text-mute hover:border-line-hi hover:text-ink",
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cx(
                                    "size-1 shrink-0 rounded-full transition-colors",
                                    isActive ? "bg-signal" : "bg-line-hi",
                                  )}
                                />
                                {skill.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* how-I-use-it readout */}
          <Reveal delay={120} className="min-w-0 lg:col-span-4">
            <div className="panel grain sticky top-24 overflow-hidden">
              <div className="border-b border-line px-4 py-3">
                <p className="label-xs">{d.skills.how}</p>
              </div>
              {active && focus ? (
                <div className="px-4 py-4">
                  <p className="font-display text-lg tracking-tight text-ink">
                    {active.name}
                  </p>
                  <p className="mt-1 font-mono text-2xs text-signal">
                    {l(skillDomains.find((g) => g.id === focus.domain)!.label)}
                  </p>
                  <p className="mt-4 text-[0.82rem] leading-relaxed text-mute">
                    {l(active.note)}
                  </p>
                </div>
              ) : (
                <p className="px-4 py-6 font-mono text-2xs text-faint">
                  {d.skills.empty}
                </p>
              )}
              <div className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono text-2xs text-faint">
                <span className="text-signal">▚</span>
                <span>{d.skills.hint}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
