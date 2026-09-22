"use client";

import { useI18n } from "./i18n";
import { sections, site } from "@/content/site";

export function Footer() {
  const { d } = useI18n();

  const explore = sections.map((section) => ({
    href: `#${section.id}`,
    label: d.nav.sections[section.id],
  }));

  const elsewhere = [
    { href: site.links.blog, label: d.github.blog, external: true },
    { href: site.links.github, label: d.contact.github, external: true },
    { href: site.links.linkedin, label: d.contact.linkedin, external: true },
    { href: site.links.email, label: d.contact.email, external: false },
  ];

  /* Load-bearing agent index (AgentReady AR-READ-06) — these must stay linked. */
  const agentFiles = [
    { href: "/llms.txt", label: "/llms.txt", note: d.footer.forAgentsIndex },
    { href: "/index.md", label: "/index.md", note: d.footer.forAgentsMarkdown },
    { href: "/sitemap.xml", label: "/sitemap.xml", note: d.footer.forAgentsSitemap },
  ];

  return (
    <footer className="tone-gray border-t hairline">
      <div className="mx-auto w-full max-w-[980px] px-6 py-12 text-[12px] leading-relaxed text-soft sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* page sections */}
          <nav aria-label={d.nav.menu}>
            <p className="font-semibold text-main">{d.nav.menu}</p>
            <ul className="mt-3 space-y-2">
              {explore.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-main">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* elsewhere */}
          <nav aria-label={d.nav.sections.contact}>
            <p className="font-semibold text-main">{d.nav.sections.contact}</p>
            <ul className="mt-3 space-y-2">
              {elsewhere.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer noopener" : undefined}
                    className="transition-colors hover:text-main"
                  >
                    {item.label}
                    {item.external ? <span className="sr-only"> {d.a11y.external}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* load-bearing agent index (AR-READ-06) — these must stay linked */}
          <nav aria-label={d.footer.forAgents}>
            <p className="font-semibold text-main">{d.footer.forAgents}</p>
            <ul className="mt-3 space-y-2">
              {agentFiles.map((file) => (
                <li key={file.href}>
                  <a href={file.href} className="transition-colors hover:text-main">
                    {file.label}
                    <span aria-hidden> · {file.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* legal line */}
        <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 border-t hairline pt-5">
          <p>{d.footer.built}</p>
          <span aria-hidden>·</span>
          <p>{d.footer.stack}</p>
          <span aria-hidden>·</span>
          <p>{d.footer.rights}</p>
          <span aria-hidden>·</span>
          <p>{d.footer.version}</p>
        </div>
      </div>
    </footer>
  );
}
