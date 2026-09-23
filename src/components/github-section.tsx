"use client";

import { useMemo } from "react";
import { useI18n } from "./i18n";
import { Headline, Kicker, Reveal, Section, Stat, Tag, TextLink } from "./ui";
import type { ContributionDay, GithubData } from "@/lib/github";
import { site } from "@/content/site";
import { formatYearMonth } from "@/lib/utils";

/* Deep-green intensity ramp — five buckets of #0a6b45 on the cream page. */
const LEVEL_FILL = [
  "color-mix(in oklab, var(--color-green-ink) 8%, transparent)",
  "color-mix(in oklab, var(--color-green-ink) 22%, transparent)",
  "color-mix(in oklab, var(--color-green-ink) 45%, transparent)",
  "color-mix(in oklab, var(--color-green-ink) 70%, transparent)",
  "var(--color-green-ink)",
];

/**
 * Open source on the cream Info page: one anchor, the stat row, the live
 * contribution calendar, repositories as quiet rows and the languages.
 * The honesty labels (live / stale) stay visible either way.
 */
export function GithubSection({ data }: { data: GithubData }) {
  const { d, lang } = useI18n();

  /* Contribution calendar as weeks, Sunday-padded like github.com. */
  const weeks = useMemo(() => {
    if (!data.days?.length) return [];
    const first = new Date(`${data.days[0].date}T00:00:00Z`);
    const pad = first.getUTCDay();
    const cells: ContributionDay[] = [
      ...Array.from({ length: pad }, () => ({ date: "", count: -1, level: -1 })),
      ...data.days,
    ];
    const out: ContributionDay[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [data]);

  const stats = [
    { value: data.totalLastYear.toLocaleString(), label: d.github.contributions },
    { value: String(data.publicRepos), label: d.github.publicRepos },
    { value: String(data.followers), label: d.github.followers },
    { value: String(data.following), label: d.github.following },
    { value: new Date(data.createdAt).getFullYear().toString(), label: d.github.memberSince },
  ];

  return (
    <Section id="github" tone="light">
      {/* ---- the anchor ---- */}
      <Reveal>
        <Kicker className="text-soft">
          {d.github.eyebrow.replace(/^\d+\s*—\s*/, "")}
        </Kicker>
      </Reveal>
      <Reveal delay={80}>
        <Headline>{d.github.title}</Headline>
      </Reveal>
      <Reveal delay={160}>
        <p className="mt-5 max-w-[46rem] text-[17px] leading-relaxed text-soft">
          {d.github.lead}
        </p>
      </Reveal>

      {/* ---- profile stats — the spec readout ---- */}
      <Reveal delay={240} className="mt-14">
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>
        <p className="mt-8 text-[13px] text-soft">
          {data.live ? d.github.liveNote : d.github.stale}
        </p>
      </Reveal>

      {/* ---- contribution activity ---- */}
      <Reveal delay={320} className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h3 className="kicker text-soft">{d.github.activity}</h3>
          <p className="text-[15px] text-soft">
            {data.totalLastYear.toLocaleString()} · {d.github.contributions}
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          {weeks.length > 0 ? (
            <div className="flex min-w-max gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => (
                    <span
                      key={`${wi}-${di}`}
                      title={day.count >= 0 ? `${day.date} · ${day.count}` : undefined}
                      className="size-[10px] rounded-[3px] transition-transform duration-200 hover:scale-125"
                      style={{
                        background:
                          day.level < 0 ? "transparent" : (LEVEL_FILL[day.level] ?? LEVEL_FILL[0]),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-soft">{d.github.stale}</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] text-soft">
          <p>{d.github.activityNote}</p>
          <div className="ml-auto flex items-center gap-2">
            <span>{d.github.less}</span>
            <span aria-hidden className="flex items-center gap-1">
              {LEVEL_FILL.map((fill, i) => (
                <span
                  key={i}
                  className="size-[10px] rounded-[3px]"
                  style={{ background: fill }}
                />
              ))}
            </span>
            <span>{d.github.more}</span>
          </div>
        </div>
      </Reveal>

      {/* ---- repositories as quiet rows ---- */}
      <Reveal delay={400} className="mt-16">
        <h3 className="kicker text-soft">{d.github.repos}</h3>
        <p className="mt-2 text-[15px] text-soft">{d.github.reposNote}</p>

        <ul className="mt-6 border-t hairline">
          {data.repos.map((repo) => (
            <li
              key={repo.name}
              className="grid gap-3 border-b hairline py-5 sm:grid-cols-[14rem_1fr] sm:gap-8"
            >
              <div>
                <TextLink href={repo.href} external>
                  {repo.name}
                </TextLink>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-soft">
                  <Tag>{d.github.pinned}</Tag>
                  <Tag>{repo.language}</Tag>
                  <span>
                    {d.github.pushed} {formatYearMonth(repo.pushed, lang)}
                  </span>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-soft">
                {lang === "es" ? repo.descriptionEs : repo.descriptionEn}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ---- languages + action links ---- */}
      <Reveal delay={480} className="mt-16">
        <h3 className="kicker text-soft">{d.github.languages}</h3>
        <ul className="mt-5 flex flex-wrap gap-2">
          {data.languages.map((language) => (
            <li key={language}>
              <Tag>{language}</Tag>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-2">
          <TextLink href={site.links.github} external>
            {d.github.viewProfile}
          </TextLink>
          <TextLink href={site.links.blog} external>
            {d.github.blog}
          </TextLink>
        </div>
        <p className="mt-4 text-[13px] text-soft">{d.github.blogNote}</p>
      </Reveal>
    </Section>
  );
}
