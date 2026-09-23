"use client";

import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Reveal, Section, Tag, TextLink } from "./ui";
import { timeline } from "@/content/data";
import { site } from "@/content/site";
import { cx } from "@/lib/utils";

/** Visual weight per role — the sheet recedes as the work gets older. */
const weight = {
  lead: {
    row: "py-12",
    company: "text-[clamp(2rem,4vw,2.75rem)]",
    summary: "text-[19px]",
  },
  major: {
    row: "py-10",
    company: "text-[clamp(1.6rem,2.6vw,2rem)]",
    summary: "text-[17px]",
  },
  mid: {
    row: "py-8",
    company: "text-[21px]",
    summary: "text-[17px]",
  },
  small: {
    row: "py-6",
    company: "text-[17px]",
    summary: "text-[15px]",
  },
} as const;

/**
 * The career as an Apple tech-spec sheet: one hairline row per role, the
 * company carrying the weight, the period set in tabular figures, and the
 * focus areas chipped underneath. Closed by the old footnote line.
 */
export function Experience() {
  const { d, l } = useI18n();
  // "02 — Experience" → the label tail rides the kicker; no numerals up here.
  const kicker = d.experience.eyebrow.split(" — ")[1] ?? d.experience.eyebrow;

  return (
    <Section id="experience" tone="light">
      <Reveal>
        <Kicker className="text-soft">{kicker}</Kicker>
      </Reveal>
      <Reveal delay={70}>
        <Headline>{d.experience.title}</Headline>
      </Reveal>
      <Reveal delay={140}>
        <Lead className="max-w-[46rem]">{d.experience.lead}</Lead>
      </Reveal>

      {/* ---------- the spec sheet ---------- */}
      <ol className="mt-16">
        {timeline.map((entry, i) => {
          const w = weight[entry.scale];

          return (
            <Reveal
              as="li"
              key={entry.id}
              delay={i * 90}
              className="grid gap-5 border-b hairline last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-10"
            >
              <article className={cx("contents", w.row)}>
                <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-start">
                  <p className="text-[15px] tabular-nums text-soft">
                    {l(entry.period)}
                  </p>
                  {entry.current ? <Tag>{d.experience.current}</Tag> : null}
                </div>

                <div>
                  <h3
                    className={cx(
                      "font-semibold tracking-tight text-main",
                      w.company,
                    )}
                  >
                    {entry.url ? (
                      <TextLink
                        href={entry.url}
                        external
                        className="font-semibold text-main"
                      >
                        <span className={w.company}>{entry.company}</span>
                      </TextLink>
                    ) : (
                      entry.company
                    )}
                  </h3>

                  <p className="mt-2 text-[17px] text-soft">
                    {l(entry.role)}
                  </p>

                  <p
                    className={cx(
                      "mt-4 max-w-[46rem] leading-relaxed",
                      w.summary,
                    )}
                  >
                    {l(entry.summary)}
                  </p>

                  <div className="mt-6">
                    <p className="text-[13px] text-soft">
                      {d.experience.focusLabel}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {entry.focus.map((item) => (
                        <li key={item.en}>
                          <Tag>{l(item)}</Tag>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ol>

      {/* ---------- the closing footnote ---------- */}
      <Reveal delay={120} className="mt-12">
        <p className="text-[13px] leading-relaxed text-soft">
          {site.location} · {d.experience.remote} · {d.hero.availability}
        </p>
      </Reveal>
    </Section>
  );
}
