"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useI18n } from "./i18n";
import { useToast } from "./providers";
import { GithubIcon, LinkedinIcon } from "./brand-icons";
import { Reveal, Section } from "./ui";
import { TerrainField } from "./terrain-field";
import { site } from "@/content/site";
import { cx } from "@/lib/utils";

export function Contact() {
  const { d } = useI18n();
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
    setCopied(true);
    push({ title: d.contact.copied, body: site.email, tone: "ok" });
    window.setTimeout(() => setCopied(false), 2200);
  };

  const channels = [
    {
      href: site.links.email,
      label: d.contact.email,
      detail: site.email,
      Icon: Mail,
      primary: true,
    },
    {
      href: site.links.linkedin,
      label: d.contact.linkedin,
      detail: "/in/jamesmaradiaga",
      Icon: LinkedinIcon,
      primary: false,
    },
    {
      href: site.links.github,
      label: d.contact.github,
      detail: `/Ancordss`,
      Icon: GithubIcon,
      primary: false,
    },
  ];

  return (
    <Section id="contact" className="overflow-hidden bg-abyss">
      <TerrainField className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
      <div className="relative">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="label-xs justify-center">{d.contact.eyebrow}</p>
            <h2 className="mt-5 text-3xl leading-[1.1] tracking-tight text-balance text-ink sm:text-4xl md:text-[3rem]">
              {d.contact.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-mute text-pretty">
              {d.contact.lead}
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.links.email}
              className="group inline-flex items-center gap-2 rounded-lg border border-signal/40 bg-signal-deep px-5 py-3 font-mono text-xs tracking-wide text-signal-text transition-all duration-300 hover:border-signal hover:bg-signal/10"
            >
              <Mail className="size-3.5" strokeWidth={1.75} />
              {d.contact.email}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-lg border border-line-hi px-4 py-3 font-mono text-xs text-ink transition-colors hover:border-signal/50 hover:text-signal"
            >
              {copied ? (
                <Check className="size-3.5 text-signal" strokeWidth={2} />
              ) : (
                <Copy className="size-3.5" strokeWidth={1.75} />
              )}
              {copied ? d.contact.copied : d.contact.copy}
            </button>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <ul className="mx-auto mt-12 grid max-w-4xl gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-3">
            {channels.map(({ href, label, detail, Icon }) => (
              <li key={label} className="bg-panel">
                <a
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  className="group flex h-full flex-col gap-3 p-5 transition-colors duration-300 hover:bg-panel-hi"
                >
                  <Icon
                    className="size-4 text-dim transition-colors duration-300 group-hover:text-signal"
                    strokeWidth={1.6}
                  />
                  <div>
                    <p className="font-mono text-xs text-ink">{label}</p>
                    <p className="mt-1 truncate font-mono text-2xs text-faint">{detail}</p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-auto h-px w-8 origin-left scale-x-100 bg-line-hi transition-all duration-500 group-hover:w-full group-hover:bg-signal/50"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200}>
          <div className="mx-auto mt-14 max-w-3xl">
            <p className="label-xs justify-center text-center">{d.contact.interestTitle}</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-1.5">
              {d.contact.interests.map((interest) => (
                <li
                  key={interest}
                  className={cx(
                    "rounded-full border border-line px-3 py-1.5 font-mono text-2xs text-mute",
                    "transition-colors duration-300 hover:border-signal/40 hover:text-signal",
                  )}
                >
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-14 text-center font-mono text-2xs text-faint">
            <span className="text-signal">$</span> {d.contact.signature}
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
