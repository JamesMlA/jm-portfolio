"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { useI18n } from "./i18n";
import { GithubIcon, LinkedinIcon } from "./brand-icons";
import { HeroTerminal } from "./hero-terminal";
import { ActionLink, StatusDot } from "./ui";
import { site } from "@/content/site";
import { cx, localTime } from "@/lib/utils";

// The WebGL terrain mounts after first paint — the headline never waits on it.
const HeroScene = dynamic(
  () => import("./render/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

function LocalClock({ className }: { className?: string }) {
  const { d, lang } = useI18n();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(localTime(site.timeZone, lang));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lang]);

  return (
    <span className={cx("font-mono text-2xs tabular-nums text-dim", className)}>
      {d.hero.stats.region} · {time ?? "--:--:--"}
    </span>
  );
}

export function Hero() {
  const { d } = useI18n();

  const socials = [
    { href: site.links.github, label: d.hero.github, Icon: GithubIcon },
    { href: site.links.linkedin, label: d.hero.linkedin, Icon: LinkedinIcon },
    { href: site.links.email, label: d.hero.email, Icon: Mail },
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden border-b border-line"
    >
      {/* the synthetic landscape, rendered: terrain, radar, dust */}
      <HeroScene className="animate-fade" />
      {/* scrim so the instrument field never fights the type */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,var(--color-void)_24%,color-mix(in_oklab,var(--color-void)_55%,transparent)_44%,color-mix(in_oklab,var(--color-void)_10%,transparent)_66%,transparent_88%)]"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -top-40 left-1/3 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-signal)_10%,transparent),transparent_65%)] blur-2xl"
      />

      <div className="relative mx-auto w-full max-w-[76rem] px-5 pt-28 pb-16 sm:px-8 sm:pt-32 md:pt-36 md:pb-20">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
          {/* ---------- left: identity + statement ---------- */}
          <div className="lg:col-span-7 xl:col-span-6">
            <div className="animate-rise flex flex-wrap items-center gap-3 [animation-delay:60ms]">
              <span className="inline-flex items-center gap-2 rounded-full border border-line-hi bg-panel/70 py-1.5 pr-3.5 pl-3 font-mono text-2xs tracking-wide text-mute backdrop-blur">
                <StatusDot />
                {d.hero.status}
              </span>
              <LocalClock />
            </div>

            <div className="animate-rise mt-8 flex items-center gap-4 [animation-delay:140ms]">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={site.photo}
                  alt={d.hero.photoAlt}
                  width={60}
                  height={60}
                  className="size-15 rounded-xl border border-line-hi object-cover grayscale-[35%] transition-all duration-500 hover:grayscale-0"
                  style={{ width: 60, height: 60 }}
                />
                <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-void bg-signal" />
              </div>
              <div className="min-w-0">
                <p className="display-wide text-[0.98rem] leading-tight text-ink">
                  {site.name}
                </p>
                <p className="mt-0.5 font-mono text-2xs tracking-wide text-dim">
                  <span className="text-signal">@</span>
                  {site.handle} · {d.meta.tagline}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-2xs text-dim">
                  <MapPin className="size-3" strokeWidth={1.75} />
                  {site.location}
                </p>
              </div>
            </div>

            <h1 className="animate-rise display-wide mt-8 text-[clamp(2.3rem,5.6vw,4.2rem)] leading-[1.02] text-balance [animation-delay:220ms]">
              {d.hero.headline}
            </h1>

            <p className="animate-rise mt-6 max-w-xl text-[0.98rem] leading-relaxed text-mute text-pretty [animation-delay:300ms]">
              {d.hero.sub}
            </p>

            <div className="animate-rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:380ms]">
              <ActionLink href="#projects">{d.hero.ctaPrimary}</ActionLink>
              <ActionLink
                href="#contact"
                variant="secondary"
                icon={ArrowUpRight}
              >
                {d.hero.ctaSecondary}
              </ActionLink>
            </div>

            <ul className="animate-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6 [animation-delay:460ms]">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    className="group flex min-h-6 items-center gap-2 py-1 font-mono text-2xs tracking-wide text-dim transition-colors hover:text-signal"
                  >
                    <Icon className="size-4" strokeWidth={1.6} />
                    <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-signal/40">
                      {label}
                    </span>
                    {!href.startsWith("mailto:") ? (
                      <span className="sr-only">{d.a11y.external}</span>
                    ) : null}
                  </a>
                </li>
              ))}
              <li className="ml-auto hidden sm:block">
                <span className="font-mono text-2xs text-faint">
                  <span className="text-signal">●</span> {d.hero.availability}
                </span>
              </li>
            </ul>
          </div>

          {/* ---------- right: mission log ---------- */}
          <div className="animate-rise lg:col-span-5 xl:col-span-6 [animation-delay:320ms]">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
