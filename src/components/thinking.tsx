"use client";

import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Reveal, Section, Tag } from "./ui";
import { principles } from "@/content/data";

/**
 * The mental model as static statements: each principle, what it changes, and
 * what it pulls on. No cross-highlighting — the coupling reads in the words.
 */
export function Thinking() {
  const { d, l } = useI18n();
  // "05 — Mental model" → the label tail rides the kicker; no numerals up here.
  const kicker = d.thinking.eyebrow.split(" — ")[1] ?? d.thinking.eyebrow;

  return (
    <Section id="thinking" tone="light">
      <Reveal>
        <Kicker>{kicker}</Kicker>
      </Reveal>
      <Reveal delay={70}>
        <Headline>{d.thinking.title}</Headline>
      </Reveal>
      <Reveal delay={140}>
        <Lead className="max-w-[46rem]">{d.thinking.lead}</Lead>
      </Reveal>

      {/* ---------- the statements ---------- */}
      <ul className="mt-16 grid gap-14 sm:grid-cols-2">
        {principles.map((principle, i) => (
          <Reveal as="li" key={principle.id} delay={i * 90}>
            <article className="border-t hairline pt-6">
              <h3 className="text-[21px] font-semibold tracking-tight text-main">
                {l(principle.label)}
              </h3>

              <p className="mt-8 text-[13px] text-soft">{d.thinking.detail}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-soft">
                {l(principle.detail)}
              </p>

              <p className="mt-8 text-[13px] text-soft">{d.thinking.related}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {principle.pulls.map((id) => (
                  <li key={id}>
                    <Tag>{l(principles.find((x) => x.id === id)!.label)}</Tag>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
