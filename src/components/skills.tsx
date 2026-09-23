"use client";

import { useI18n } from "./i18n";
import { Headline, Kicker, Reveal, Section } from "./ui";
import { skillDomains } from "@/content/data";

/**
 * Skills on the cream Info page: one anchor (micro-label + huge light title),
 * then quiet spec rows — domain label, skill name, how it is actually used.
 * Hairlines and whitespace only.
 */
export function Skills() {
  const { d, l } = useI18n();

  return (
    <Section id="skills" tone="light">
      <Reveal>
        <Kicker className="text-soft">
          {d.skills.eyebrow.replace(/^\d+\s*—\s*/, "")}
        </Kicker>
      </Reveal>
      <Reveal delay={80}>
        <Headline>{d.skills.title}</Headline>
      </Reveal>
      <Reveal delay={160}>
        <p className="mt-5 max-w-[46rem] text-[17px] leading-relaxed text-soft">
          {d.skills.lead}
        </p>
      </Reveal>

      <div className="mt-14 md:mt-16">
        {skillDomains.map((group) => (
          <Reveal key={group.id} className="mt-12 first:mt-0">
            <h3 className="kicker text-soft">{l(group.label)}</h3>

            <div className="mt-4 border-t hairline">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="grid gap-1 border-b hairline py-4 sm:grid-cols-[12rem_1fr] sm:gap-8"
                >
                  <p className="text-[17px]">{skill.name}</p>
                  <p className="text-[15px] leading-relaxed text-soft">
                    {l(skill.note)}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
