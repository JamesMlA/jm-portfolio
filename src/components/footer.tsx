"use client";

import { ArrowUp, Mail, Terminal } from "lucide-react";
import { useI18n } from "./i18n";
import { GithubIcon, LinkedinIcon } from "./brand-icons";
import { site, sections } from "@/content/site";
import { openPalette, openStatus } from "./nav";

export function Footer() {
  const { d } = useI18n();

  const links = [
    { href: site.links.github, label: d.hero.github, Icon: GithubIcon },
    { href: site.links.linkedin, label: d.hero.linkedin, Icon: LinkedinIcon },
    { href: site.links.email, label: d.hero.email, Icon: Mail },
    { href: site.links.blog, label: d.github.blog, Icon: ArrowUp },
  ];

  return (
    <footer className="relative border-t border-line bg-abyss">
      {/* horizon: one contour line with survey ticks, not a tiled texture */}
      <svg
        aria-hidden
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 w-full"
      >
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M0 ${56 + i * 34} C 280 ${22 + i * 34}, 520 ${96 + i * 34}, 780 ${64 + i * 34} S 1180 ${12 + i * 34}, 1440 ${72 + i * 34}`}
            fill="none"
            stroke="var(--color-line-hi)"
            strokeWidth="1"
            opacity={0.5 - i * 0.13}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            x1={i * 60}
            y1={152}
            x2={i * 60}
            y2={i % 4 === 0 ? 168 : 160}
            stroke="var(--color-line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="relative mx-auto w-full max-w-[76rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-[1.35rem] leading-snug tracking-tight text-ink">
              james maradiaga
            </p>
            <p className="mt-3 max-w-sm font-mono text-2xs leading-relaxed text-dim">
              <span className="text-signal">$</span> {d.meta.tagline}
              <span className="ml-1 inline-block h-3 w-1.5 translate-y-px animate-blink bg-signal align-middle" />
            </p>
            <div className="mt-5 flex items-center gap-3">
              {links.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                  className="grid size-8 place-items-center rounded-md border border-line text-dim transition-colors hover:border-signal/40 hover:text-signal"
                >
                  <Icon className="size-3.5" strokeWidth={1.7} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="label-xs">{d.nav.menu}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex min-h-6 items-center py-1 font-mono text-2xs text-mute transition-colors hover:text-signal"
                  >
                    {d.nav.sections[s.id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="label-xs">{d.footer.forAgents}</p>
            <ul className="mt-4 space-y-2.5 font-mono text-2xs text-dim">
              {[
                { href: "/llms.txt", label: "/llms.txt", note: d.footer.forAgentsIndex },
                { href: "/index.md", label: "/index.md", note: d.footer.forAgentsMarkdown },
                { href: "/sitemap.xml", label: "/sitemap.xml", note: d.footer.forAgentsSitemap },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex min-h-6 items-center gap-2 py-1 transition-colors hover:text-signal"
                  >
                    <span className="text-signal/70">↳</span>
                    {item.label}
                    <span className="text-faint">· {item.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="label-xs">{d.footer.shortcuts}</p>
            <ul className="mt-4 space-y-2.5 font-mono text-2xs text-dim">
              <li className="flex min-h-6 items-center gap-2">
                <kbd className="rounded border border-line px-1.5 py-0.5 text-faint">⌘K</kbd>
                <button
                  type="button"
                  onClick={openPalette}
                  className="inline-flex min-h-6 items-center py-1 transition-colors hover:text-signal"
                >
                  {d.nav.palette}
                </button>
              </li>
              <li className="flex min-h-6 items-center gap-2">
                <kbd className="rounded border border-line px-1.5 py-0.5 text-faint">g</kbd>
                <span>a e p s g c</span>
              </li>
              <li className="flex min-h-6 items-center gap-2">
                <Terminal className="size-3 text-faint" strokeWidth={1.75} />
                <button
                  type="button"
                  onClick={openStatus}
                  className="inline-flex min-h-6 items-center py-1 transition-colors hover:text-signal"
                >
                  status
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 font-mono text-2xs text-faint sm:flex-row sm:items-center">
          <p>© {d.footer.built}</p>
          <p className="sm:ml-auto">{d.footer.stack}</p>
          <p className="flex items-center gap-2">
            <span className="text-signal">●</span>
            <span>{d.footer.version} 2026.09</span>
          </p>
          <a
            href="#home"
            className="group inline-flex min-h-6 items-center gap-1.5 py-1 transition-colors hover:text-signal"
          >
            {d.palette.commands.top}
            <ArrowUp className="size-3 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
