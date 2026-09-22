"use client";

import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Reveal, Section } from "./ui";
import { skillDomains } from "@/content/data";

/**
 * The tech-spec readout on the black stage: every technology with how it is
 * actually used, grouped by engineering domain. No filters — just the rows.
 */
export function Skills() {
  const { d, l } = useI18n();

  return (
    <Section id="skills" tone="dark">
      <div className="max-w-[980px]">
        <Reveal>
          <Kicker>{d.skills.eyebrow.replace(/^\d+\s*—\s*/, "")}</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <Headline>{d.skills.title}</Headline>
        </Reveal>
        <Reveal delay={160}>
          <Lead>{d.skills.lead}</Lead>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-x-16 gap-y-14 md:mt-20 md:grid-cols-2">
        {skillDomains.map((group, i) => (
          <Reveal key={group.id} delay={(i % 2) * 80}>
            <h3 className="text-[21px] font-semibold">{l(group.label)}</h3>

            <div className="mt-5 border-t hairline">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="border-b hairline py-4 last:border-b-0"
                >
                  <p className="text-[17px] font-bold">{skill.name}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-soft">
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
