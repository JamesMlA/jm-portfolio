"use client";

import { useEffect, useState } from "react";
import { Command, Menu, Moon, Sun, X } from "lucide-react";
import { useI18n, type Lang } from "./i18n";
import { useTheme } from "./theme";
import { StatusDot } from "./ui";
import { sections } from "@/content/site";
import { cx } from "@/lib/utils";

const NAV_IDS = ["home", "about", "experience", "projects", "skills", "github", "contact"] as const;

export function openPalette() {
  window.dispatchEvent(new Event("jm:palette"));
}

export function openStatus() {
  window.dispatchEvent(new Event("jm:status"));
}

export function Nav() {
  const { d, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 12);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Later entries win ties so "contact" claims the bottom of the page.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const id of NAV_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const langs: Lang[] = ["en", "es"];

  return (
    <>
      {/* deployment status strip — doubles as a status trigger */}
      <div className="relative z-50 border-b border-line bg-abyss/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[76rem] items-center gap-3 px-5 py-1.5 sm:px-8">
          <button
            type="button"
            onClick={openStatus}
            className="group flex min-h-6 items-center gap-2 py-1 font-mono text-2xs tracking-wide text-dim transition-colors hover:text-mute"
          >
            <StatusDot />
            <span className="text-signal">200 OK</span>
            <span className="hidden text-faint sm:inline">
              · {d.hero.stats.healthy}
            </span>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-2xs text-faint md:inline">
              {d.egg.hint}
            </span>
            <span className="hidden size-1 rounded-full bg-line-hi md:inline-block" />
            <a
              href="https://github.com/Ancordss/port"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden min-h-6 items-center py-1 font-mono text-2xs text-faint transition-colors hover:text-mute sm:inline-flex"
            >
              v2026.09
            </a>
          </div>
        </div>
      </div>

      <header
        className={cx(
          "sticky top-0 z-50 transition-colors duration-300",
          scrolled ? "border-b border-line bg-void/85 backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex w-full max-w-[76rem] items-center gap-4 px-5 py-3.5 sm:px-8"
        >
          <a
            href="#home"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label={d.nav.sections.home}
          >
            <span className="relative grid size-8 place-items-center rounded-md border border-line-hi bg-panel font-mono text-[0.7rem] font-medium text-signal transition-colors duration-300 group-hover:border-signal/50">
              JM
              <span className="absolute -right-px -bottom-px size-1.5 rounded-full bg-signal" />
            </span>
            <span className="hidden font-display text-[0.9rem] tracking-tight text-ink xl:block">
              james maradiaga
            </span>
          </a>

          <ul className="ml-6 hidden items-center gap-1 min-[900px]:flex">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={active === s.id ? "true" : undefined}
                    className={cx(
                      "group relative flex items-baseline gap-1.5 rounded-md px-2.5 py-2 text-[0.83rem] transition-colors duration-300",
                      active === s.id ? "text-ink" : "text-dim hover:text-mute",
                    )}
                  >
                    {d.nav.sections[s.id]}
                    <span
                      className={cx(
                        "font-mono text-[0.6rem] transition-opacity duration-300",
                        active === s.id ? "text-signal opacity-100" : "text-faint opacity-0 group-hover:opacity-60",
                      )}
                    >
                      {s.key}
                    </span>
                    <span
                      className={cx(
                        "absolute inset-x-2 -bottom-px h-px bg-signal transition-transform duration-300",
                        active === s.id ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </a>
                </li>
              ))}
          </ul>
          {/* the nav list is aria-current'd at every width; this is the compact echo */}
          <span className="ml-4 hidden font-mono text-2xs tracking-wide text-faint sm:block min-[900px]:hidden">
            {d.nav.sections[active as (typeof sections)[number]["id"]]}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="hidden items-center rounded-md border border-line p-0.5 sm:flex"
              role="group"
              aria-label={d.nav.language}
            >
              {langs.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={lang === code}
                  className={cx(
                    "rounded px-2 py-1 font-mono text-2xs tracking-wide transition-colors",
                    lang === code
                      ? "bg-signal-deep text-signal-text"
                      : "text-dim hover:text-mute",
                  )}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? d.palette.commands.theme : d.palette.commands.themeDark}
              className="grid size-8 place-items-center rounded-md border border-line text-dim transition-colors hover:border-line-hi hover:text-mute"
            >
              {theme === "dark" ? (
                <Sun className="size-3.5" strokeWidth={1.75} />
              ) : (
                <Moon className="size-3.5" strokeWidth={1.75} />
              )}
            </button>

            <button
              type="button"
              onClick={openPalette}
              className="hidden min-h-6 items-center gap-2 rounded-md border border-line px-2.5 py-1.5 font-mono text-2xs text-dim transition-colors hover:border-line-hi hover:text-mute md:flex"
            >
              <Command className="size-3" strokeWidth={1.75} />
              <span>K</span>
            </button>

            <a
              href="#contact"
              className="ml-1 hidden rounded-md border border-signal/40 bg-signal-deep px-3.5 py-2 font-mono text-2xs tracking-wide text-signal-text transition-colors hover:bg-signal/10 lg:block"
            >
              {d.nav.sections.contact}
            </a>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={d.a11y.toggleMenu}
              className="grid size-8 place-items-center rounded-md border border-line text-mute transition-colors hover:border-line-hi min-[900px]:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>

        {/* reading progress — a hairline, not a bar */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-signal to-azure/60 transition-transform duration-150"
          style={{ transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
        />
      </header>

      {/* mobile sheet */}
      <div
        className={cx(
          "fixed inset-0 z-40 min-[900px]:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cx(
            "absolute inset-0 bg-void/80 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cx(
            "sheet-scroll absolute inset-x-0 top-0 border-b border-line bg-abyss pt-20 pb-6 transition-transform duration-400",
            open ? "translate-y-0" : "-translate-y-full",
          )}
        >
          <ul className="mx-auto w-full max-w-[76rem] px-5">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between border-b border-line py-3.5 font-display text-lg text-ink"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  {d.nav.sections[s.id]}
                  <span className="font-mono text-2xs text-faint">g {s.key}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-5 flex w-full max-w-[76rem] items-center gap-2 px-5">
            {langs.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cx(
                  "flex-1 rounded-md border px-3 py-2.5 font-mono text-2xs tracking-wide transition-colors",
                  lang === code
                    ? "border-signal/50 bg-signal-deep text-signal-text"
                    : "border-line text-dim",
                )}
              >
                {code === "en" ? "English" : "Español"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
