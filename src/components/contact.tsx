"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { GithubIcon, LinkedinIcon } from "./brand-icons";
import { Headline, Kicker, Pill, Reveal, Section, Tag, TextLink } from "./ui";
import { site } from "@/content/site";

/**
 * The quiet close on the cream Info page: one anchor, the ways to reach me,
 * the interests worth a conversation, and the signature line.
 */
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
    <Section id="contact" tone="light">
      {/* ---- the anchor ---- */}
      <Reveal>
        <Kicker className="text-soft">
          {d.contact.eyebrow.replace(/^\d+\s*—\s*/, "")}
        </Kicker>
      </Reveal>
      <Reveal delay={80}>
        <Headline>{d.contact.title}</Headline>
      </Reveal>
      <Reveal delay={160}>
        <p className="mt-5 max-w-[46rem] text-[17px] leading-relaxed text-soft">
          {d.contact.lead}
        </p>
      </Reveal>

      {/* ---- ways to reach me ---- */}
      <Reveal delay={240} className="mt-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Pill href={site.links.email}>{d.contact.email}</Pill>
          <TextLink href={site.links.linkedin} external>
            <span className="inline-flex items-center gap-2">
              <LinkedinIcon className="size-4" />
              {d.contact.linkedin}
            </span>
          </TextLink>
          <TextLink href={site.links.github} external>
            <span className="inline-flex items-center gap-2">
              <GithubIcon className="size-4" />
              {d.contact.github}
            </span>
          </TextLink>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-soft">
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
      <Reveal delay={320} className="mt-14">
        <h3 className="kicker text-soft">{d.contact.interestTitle}</h3>
        <ul className="mt-5 flex flex-wrap gap-2">
          {d.contact.interests.map((interest) => (
            <li key={interest}>
              <Tag>{interest}</Tag>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={400}>
        <p className="mt-14 text-[15px] text-soft">{d.contact.signature}</p>
      </Reveal>
    </Section>
  );
}
