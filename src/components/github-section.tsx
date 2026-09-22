"use client";

import { useMemo } from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { useI18n } from "./i18n";
import { GithubIcon } from "./brand-icons";
import { ActionLink, Chip, PanelBar, Reveal, Section, SectionHead, StatusDot } from "./ui";
import type { GithubData } from "@/lib/github";
import { site } from "@/content/site";
import { formatYearMonth } from "@/lib/utils";

/* Mint intensity buckets — an LED ramp from dormant to burning. */
const LEVEL_FILL = [
  "color-mix(in oklab, var(--color-line-hi) 55%, transparent)",
  "color-mix(in oklab, var(--color-signal) 24%, transparent)",
  "color-mix(in oklab, var(--color-signal) 44%, transparent)",
  "color-mix(in oklab, var(--color-signal) 68%, transparent)",
  "var(--color-signal)",
];

export function GithubSection({ data }: { data: GithubData }) {
  const { d, lang } = useI18n();

  const weeks = useMemo(() => {
    if (!data.days?.length) return [];
    const first = new Date(`${data.days[0].date}T00:00:00Z`);
    const pad = first.getUTCDay();
    const cells: (typeof data.days)[number][] = [
      ...Array.from({ length: pad }, () => ({ date: "", count: -1, level: -1 })),
      ...data.days,
    ];
    const out: (typeof data.days)[number][][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [data]);

  const stats = [
    { label: d.github.contributions, value: data.totalLastYear.toLocaleString() },
    { label: d.github.publicRepos, value: String(data.publicRepos) },
    { label: d.github.followers, value: String(data.followers) },
    { label: d.github.following, value: String(data.following) },
    { label: d.github.memberSince, value: new Date(data.createdAt).getFullYear().toString() },
  ];

  return (
    <Section id="github">
      <Reveal>
        <SectionHead
          index="06"
          eyebrow={d.github.eyebrow.replace(/^\d+\s*—\s*/, "")}
          title={d.github.title}
          lead={d.github.lead}
          wide
        />
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ---- telemetry: profile + counters ---- */}
        <Reveal className="min-w-0 lg:col-span-5">
          <div className="panel grain ticks h-full overflow-hidden">
            <PanelBar title={d.github.profile} icon={GithubIcon} meta={site.handle} />

            <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://github.com/${site.handle}.png?size=80`}
                alt=""
                loading="lazy"
                width={36}
                height={36}
                className="size-9 rounded-md border border-line-hi"
              />
              <div className="min-w-0">
                <p className="font-mono text-xs text-ink">{site.handle}</p>
                <p className="font-mono text-2xs text-faint">github.com/{site.handle}</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-2xs text-dim">
                <StatusDot tone={data.live ? "signal" : "amber"} />
                {data.live ? d.github.liveNote : d.github.stale}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-panel px-5 py-4">
                  <dt className="label-xs leading-tight">{stat.label}</dt>
                  <dd className="mt-2 font-mono text-xl tabular-nums text-ink">{stat.value}</dd>
                </div>
              ))}
              <div className="bg-panel px-5 py-4">
                <dt className="label-xs leading-tight">{d.github.languages}</dt>
                <dd className="mt-2 flex flex-wrap gap-1">
                  {data.languages.map((language) => (
                    <Chip key={language}>{language}</Chip>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2 px-5 py-4">
              <ActionLink href={site.links.github} external icon={ArrowUpRight}>
                {d.github.viewProfile}
              </ActionLink>
              <ActionLink href={site.links.blog} external variant="secondary" icon={ArrowUpRight}>
                {d.github.blog}
              </ActionLink>
            </div>
            <p className="border-t border-line px-5 py-3 text-2xs leading-relaxed text-faint">
              {d.github.blogNote}
            </p>
          </div>
        </Reveal>

        {/* ---- telemetry: contribution activity ---- */}
        <Reveal delay={80} className="min-w-0 lg:col-span-7">
          <div className="panel grain ticks flex h-full flex-col overflow-hidden">
            <PanelBar
              title={d.github.activity}
              right={
                <span className="font-mono text-2xs text-faint">
                  {data.totalLastYear.toLocaleString()} · {d.github.contributions}
                </span>
              }
            />

            <div className="scroll-slim flex-1 overflow-x-auto px-5 py-6">
              {weeks.length > 0 ? (
                <div className="flex min-w-max gap-[3px]">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px]">
                      {week.map((day, di) => (
                        <span
                          key={`${wi}-${di}`}
                          title={day.count >= 0 ? `${day.date} · ${day.count}` : undefined}
                          className="size-[11px] rounded-[2px] transition-transform duration-200 hover:scale-125"
                          style={{
                            background:
                              day.level < 0 ? "transparent" : LEVEL_FILL[day.level] ?? LEVEL_FILL[0],
                            boxShadow:
                              day.level >= 3 ? "0 0 6px var(--color-volt)" : undefined,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-2xs text-faint">{d.github.stale}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3">
              <span className="font-mono text-2xs text-faint">{d.github.activityNote}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="font-mono text-2xs text-faint">{d.github.less}</span>
                <span aria-hidden className="flex items-center gap-1">
                  {LEVEL_FILL.map((fill, i) => (
                    <span key={i} className="size-[10px] rounded-[2px]" style={{ background: fill }} />
                  ))}
                </span>
                <span className="font-mono text-2xs text-faint">{d.github.more}</span>
              </span>
            </div>
          </div>
        </Reveal>

        {/* ---- telemetry: repository cards ---- */}
        <Reveal delay={120} className="min-w-0 lg:col-span-12">
          <div className="panel grain ticks overflow-hidden">
            <PanelBar
              title={d.github.repos}
              icon={GithubIcon}
              right={<Chip tone="signal">{d.github.pinned}</Chip>}
            />
            <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              {data.repos.map((repo) => (
                <li key={repo.name} className="bg-panel">
                  <a
                    href={repo.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex h-full flex-col p-5 transition-colors duration-300 hover:bg-panel-hi"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon className="size-3.5 shrink-0 text-dim transition-colors group-hover:text-signal" />
                      <span className="truncate font-mono text-xs text-ink">{repo.name}</span>
                      {repo.stars > 0 ? (
                        <span className="ml-auto flex items-center gap-1 font-mono text-2xs text-faint">
                          <Star className="size-3" strokeWidth={1.75} />
                          {repo.stars}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed text-mute">
                      {lang === "es" ? repo.descriptionEs : repo.descriptionEn}
                    </p>
                    <div className="mt-4 flex items-center gap-3 font-mono text-2xs text-faint">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className="size-1.5 rounded-full bg-signal/60" />
                        {repo.language}
                      </span>
                      <span className="ml-auto">
                        {d.github.pushed} {formatYearMonth(repo.pushed, lang)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
            <p className="border-t border-line px-5 py-3 text-2xs leading-relaxed text-faint">
              {d.github.reposNote}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
