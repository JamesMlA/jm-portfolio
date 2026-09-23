"use client";

import Link from "next/link";
import { useI18n } from "./i18n";
import { site, sections } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * The end of the scroll — the reference's tiny link stack, plus the
 * load-bearing "For agents" block (AgentReady AR-READ-06).
 */
export function Footer() {
  const { d } = useI18n();
  const year = "2026";

  const elsewhere = [
    { href: site.links.email, label: d.contact.email, external: false },
    { href: site.links.github, label: d.contact.github, external: true },
    { href: site.links.linkedin, label: d.contact.linkedin, external: true },
    { href: site.links.blog, label: d.github.blog, external: true },
  ];

  const agentFiles = [
    { href: "/llms.txt", label: "/llms.txt", note: d.footer.forAgentsIndex },
    { href: "/index.md", label: "/index.md", note: d.footer.forAgentsMarkdown },
    { href: "/sitemap.xml", label: "/sitemap.xml", note: d.footer.forAgentsSitemap },
  ];

  return (
    <footer className="tone-dark border-t hairline px-7 py-14">
      <div className="mx-auto grid max-w-[1400px] gap-10 text-[12px] sm:grid-cols-3">
        <nav aria-label={d.nav.menu}>
          <p className="kicker text-soft">{d.nav.menu}</p>
          <ul className="mt-4 space-y-2">
            {sections
              .filter((s) => s.id !== "home")
              .map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/info#${s.id}`}
                    className="text-soft transition-colors hover:text-main"
                  >
                    {d.nav.sections[s.id]}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <nav aria-label={d.nav.sections.contact}>
          <p className="kicker text-soft">{d.nav.sections.contact}</p>
          <ul className="mt-4 space-y-2">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer noopener" : undefined}
                  className="text-soft transition-colors hover:text-main"
                >
                  {item.label}
                  {item.external ? (
                    <span className="sr-only"> {d.a11y.external}</span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={d.footer.forAgents}>
          <p className="kicker text-soft">{d.footer.forAgents}</p>
          <ul className="mt-4 space-y-2">
            {agentFiles.map((f) => (
              <li key={f.href}>
                <a
                  href={f.href}
                  className="text-soft transition-colors hover:text-main"
                >
                  {f.label}
                </a>
                <span className="ml-2 text-soft opacity-70">{f.note}</span>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-12 flex max-w-[1400px] flex-wrap gap-x-4 gap-y-1 text-[11px] text-soft">
        <span>
          {d.footer.built} · {year}
        </span>
        <span>{d.footer.stack}</span>
        <span>{d.footer.rights}</span>
        <span className={cx("ml-auto font-mono")}>
          {d.footer.version} 2026.09
        </span>
      </p>
    </footer>
  );
}
