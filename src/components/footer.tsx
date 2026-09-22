"use client";

import { ArrowUp } from "lucide-react";
import { useI18n } from "./i18n";

export function Footer() {
  const { d } = useI18n();

  const agentFiles = [
    { href: "/llms.txt", label: "/llms.txt", note: d.footer.forAgentsIndex },
    { href: "/index.md", label: "/index.md", note: d.footer.forAgentsMarkdown },
    { href: "/sitemap.xml", label: "/sitemap.xml", note: d.footer.forAgentsSitemap },
  ];

  return (
    <footer className="border-t border-line bg-abyss">
      <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          {/* console readout */}
          <div className="space-y-1.5 font-mono text-2xs leading-relaxed text-faint md:col-span-7">
            <p className="text-dim">{d.footer.built}</p>
            <p>{d.footer.stack}</p>
          </div>

          {/* load-bearing agent index (AR-READ-06) — these must stay linked */}
          <div className="md:col-span-5">
            <p className="label-xs">{d.footer.forAgents}</p>
            <ul className="mt-3 space-y-1.5 font-mono text-2xs text-dim">
              {agentFiles.map((file) => (
                <li key={file.href}>
                  <a
                    href={file.href}
                    className="inline-flex min-h-6 items-center gap-2 py-1 transition-colors hover:text-signal"
                  >
                    <span aria-hidden className="text-signal/70">
                      ↳
                    </span>
                    {file.label}
                    <span className="text-faint">· {file.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-2xs text-faint">
          <p>{d.footer.rights}</p>
          <p className="flex items-center gap-2">
            <span aria-hidden className="text-signal">
              ●
            </span>
            {d.footer.version}
          </p>
          <a
            href="#home"
            className="group ml-auto inline-flex min-h-6 items-center gap-1.5 py-1 transition-colors hover:text-signal"
          >
            {d.nav.sections.home}
            <ArrowUp
              className="size-3 transition-transform group-hover:-translate-y-0.5"
              strokeWidth={1.75}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
