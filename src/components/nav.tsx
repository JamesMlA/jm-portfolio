"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n, type Lang } from "./i18n";
import { StatusDot } from "./ui";
import { sections, site } from "@/content/site";
import type { SectionId } from "@/content/site";
import { cx } from "@/lib/utils";

export function Nav() {
  const { d, lang, setLang } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);

      // Later entries win ties so "contact" claims the bottom of the page.
      let current: SectionId = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 96) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // A jump must not leave the sheet covering the destination.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [open]);

  const langs: Lang[] = ["en", "es"];

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-line bg-void/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[76rem] items-center gap-4 px-5 sm:px-8">
        <a
          href="#home"
          className="volt-rim flex items-center gap-2.5 rounded-md border border-line-hi px-2 py-1"
        >
          <span aria-hidden className="display-wide text-xs text-signal">
            JM
          </span>
          <span className="font-mono text-2xs tracking-wide text-dim">
            @{site.handle}
          </span>
        </a>

        <nav aria-label={d.nav.menu} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cx(
                    "rounded-md px-2.5 py-1.5 font-mono text-2xs tracking-widest uppercase transition-colors",
                    active === s.id
                      ? "text-signal"
                      : "text-dim hover:text-ink",
                  )}
                >
                  {d.nav.sections[s.id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div
            role="group"
            aria-label={d.nav.language}
            className="flex overflow-hidden rounded-md border border-line-hi"
          >
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cx(
                  "px-2.5 py-1.5 font-mono text-2xs tracking-wide uppercase transition-colors",
                  lang === l
                    ? "bg-signal-deep text-signal-text"
                    : "text-dim hover:text-ink",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <a
            href="#contact"
            className="hidden rounded-md border border-signal/40 bg-signal-deep px-3.5 py-2 font-mono text-2xs tracking-wide text-signal-text transition-colors hover:border-signal hover:bg-signal/10 sm:inline-flex"
          >
            {d.nav.sections.contact}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? d.nav.close : d.nav.menu}
            className="rounded-md border border-line-hi p-2 text-dim transition-colors hover:text-signal md:hidden"
          >
            {open ? (
              <X className="size-4" strokeWidth={1.75} />
            ) : (
              <Menu className="size-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* scroll telemetry — how far into the log we are */}
      <div aria-hidden className="h-px w-full bg-line/60">
        <div
          className="h-px bg-signal shadow-[0_0_8px_var(--color-volt)] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {open ? (
        <div className="sheet-scroll border-b border-line bg-void/95 backdrop-blur-md md:hidden">
          <nav aria-label={d.nav.menu} className="px-5 py-3 sm:px-8">
            <ul className="flex flex-col divide-y divide-line">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={cx(
                      "flex items-center gap-3 py-3 font-mono text-2xs tracking-widest uppercase",
                      active === s.id ? "text-signal" : "text-mute",
                    )}
                  >
                    <StatusDot pulse={false} tone="signal" />
                    {d.nav.sections[s.id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
