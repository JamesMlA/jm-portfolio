"use client";

import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Reveal, Section, Tag } from "./ui";

/**
 * The story beat: who I am beneath the product. Reading column first, then
 * the tools, the three engineering principles as a plain feature grid, and a
 * quiet list of what is happening right now.
 */
export function About() {
  const { d } = useI18n();
  // "01 — About" → the label tail rides the kicker; no numerals up here.
  const kicker = d.about.eyebrow.split(" — ")[1] ?? d.about.eyebrow;

  const principles = [
    d.about.principles.automate,
    d.about.principles.reliability,
    d.about.principles.simple,
  ];

  return (
    <Section id="about" tone="light">
      <Reveal>
        <Kicker>{kicker}</Kicker>
      </Reveal>
      <Reveal delay={70}>
        <Headline>{d.about.title}</Headline>
      </Reveal>
      <Reveal delay={140}>
        <Lead className="max-w-[46rem]">{d.about.lead}</Lead>
      </Reveal>

      {/* ---------- the reading column ---------- */}
      <div className="mt-14 max-w-[42rem] space-y-6">
        {d.about.body.map((paragraph, i) => (
          <Reveal key={i} delay={i * 80}>
            <p className="text-[17px] leading-[1.7]">{paragraph}</p>
          </Reveal>
        ))}
      </div>

      {/* ---------- the everyday stack ---------- */}
      <Reveal delay={80} className="mt-10">
        <ul className="flex flex-wrap gap-2">
          {d.about.stack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ---------- engineering philosophy ---------- */}
      <div className="mt-28">
        <Reveal>
          <Kicker>{d.about.philosophyTitle}</Kicker>
        </Reveal>
        <ul className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, i) => (
            <Reveal as="li" key={principle.title} delay={i * 90}>
              <h3 className="text-[21px] font-semibold tracking-tight">
                {principle.title}
              </h3>
              <p className="mt-4 max-w-[24rem] text-[15px] leading-relaxed text-soft">
                {principle.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* ---------- right now ---------- */}
      <div className="mt-28">
        <Reveal>
          <Kicker>{d.about.nowTitle}</Kicker>
        </Reveal>
        <ul className="mt-8 grid gap-x-16 gap-y-4 sm:grid-cols-2">
          {d.about.now.map((item, i) => (
            <Reveal as="li" key={item} delay={i * 60}>
              <p className="text-[17px] leading-relaxed text-soft">{item}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
