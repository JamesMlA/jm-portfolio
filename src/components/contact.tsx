"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Pill, Reveal, Section, Tag, TextLink } from "./ui";
import { site } from "@/content/site";

export function Contact() {
  const { d } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };

  return (
    <Section id="contact" tone="dark">
      {/* ---- the close ---- */}
      <Reveal className="text-center">
        <Kicker>{d.contact.eyebrow.replace(/^\d+\s*—\s*/, "")}</Kicker>
        <Headline>{d.contact.title}</Headline>
        <Lead className="mx-auto max-w-[44rem]">{d.contact.lead}</Lead>
      </Reveal>

      <Reveal delay={80} className="mt-12 flex flex-col items-center gap-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          <Pill href={site.links.email}>{d.contact.email}</Pill>
          <TextLink href={site.links.linkedin} external>
            {d.contact.linkedin}
          </TextLink>
          <TextLink href={site.links.github} external>
            {d.contact.github}
          </TextLink>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[15px] text-soft">
          <span>{site.email}</span>
          <button
            type="button"
            onClick={copy}
            className="py-1 transition-colors hover:text-main"
          >
            {copied ? d.contact.copied : d.contact.copy}
          </button>
        </div>
      </Reveal>

      {/* ---- things worth talking about ---- */}
      <Reveal delay={140} className="mx-auto mt-16 max-w-[52rem] text-center">
        <p className="text-[15px] font-semibold">{d.contact.interestTitle}</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {d.contact.interests.map((interest) => (
            <li key={interest}>
              <Tag>{interest}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={200}>
        <p className="mt-16 text-center text-[15px] text-soft">{d.contact.signature}</p>
      </Reveal>
    </Section>
  );
}
