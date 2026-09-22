"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useI18n } from "./i18n";
import { ActionLink, Chip, PanelBar, Reveal, Section, SectionHead, StatusDot } from "./ui";
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
    <Section id="contact">
      <Reveal>
        <SectionHead
          index="07"
          eyebrow={d.contact.eyebrow.replace(/^\d+\s*—\s*/, "")}
          title={d.contact.title}
          lead={d.contact.lead}
          align="center"
          wide
        />
      </Reveal>

      {/* ---- closing transmission ---- */}
      <Reveal delay={100}>
        <div className="panel grain ticks mx-auto mt-12 max-w-4xl overflow-hidden">
          <PanelBar title={site.email} icon={Mail} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-5 sm:px-8">
            <StatusDot />
            <p className="min-w-0 break-all font-mono text-base tracking-wide text-ink sm:text-lg">
              {site.email}
              <span
                aria-hidden
                className="ml-2 inline-block h-4 w-1.5 translate-y-0.5 bg-signal align-middle animate-blink"
              />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 px-5 py-6 sm:px-8">
            <ActionLink href={site.links.email}>{d.contact.email}</ActionLink>
            <ActionLink
              href={site.links.linkedin}
              external
              variant="secondary"
              icon={ArrowUpRight}
            >
              {d.contact.linkedin}
            </ActionLink>
            <ActionLink href={site.links.github} external variant="secondary" icon={ArrowUpRight}>
              {d.contact.github}
            </ActionLink>
            <button
              type="button"
              onClick={copy}
              className="volt-rim inline-flex min-h-6 items-center gap-2 rounded-lg border border-transparent px-4.5 py-3 font-mono text-xs tracking-wide text-dim transition-colors duration-300 hover:text-signal"
            >
              {copied ? (
                <Check className="size-3.5 text-signal" strokeWidth={2} />
              ) : (
                <Copy className="size-3.5" strokeWidth={1.75} />
              )}
              {copied ? d.contact.copied : d.contact.copy}
            </button>
          </div>

          <div className="border-t border-line px-5 py-6 sm:px-8">
            <p className="label-xs">{d.contact.interestTitle}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {d.contact.interests.map((interest) => (
                <li key={interest}>
                  <Chip>{interest}</Chip>
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-line px-5 py-3 text-center font-mono text-2xs leading-relaxed text-faint">
            <span className="text-signal">$</span> {d.contact.signature}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
