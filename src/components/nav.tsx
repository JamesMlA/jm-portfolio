"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Menu, X } from "lucide-react";
import { useI18n, type Lang } from "./i18n";
import { sections, site } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * The bar: 44px, warm frosted glass, tone-aware — dark glass over the dark
 * stages, cream glass over the paper ones. The language switch runs inside a
 * view transition so the whole page crossfades, Apple-style.
 */
export function Nav() {
  const { d, lang, setLang } = useI18n();
  const [barDark, setBarDark] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const y = 22;
      let dark = true;
      for (const el of document.querySelectorAll<HTMLElement>("main > section")) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) {
          dark = el.classList.contains("tone-dark");
          break;
        }
      }
      setBarDark(dark);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const switchLang = (next: Lang) => {
    const apply = () => flushSync(() => setLang(next));
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (
      !reduced &&
      typeof document !== "undefined" &&
      "startViewTransition" in document
    ) {
      (
        document as Document & {
          startViewTransition: (update: () => void) => void;
        }
      ).startViewTransition(apply);
      return;
    }
    apply();
  };

  const langs: Lang[] = ["en", "es"];

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 backdrop-blur-[20px] backdrop-saturate-[180%] transition-colors duration-300",
        barDark
          ? "bg-[rgb(21 18 13 / 0.72)] text-cream"
          : "bg-[rgb(243 238 227 / 0.72)] text-ink",
      )}
    >
      <nav
        aria-label={d.nav.menu}
        className="mx-auto flex h-11 w-full max-w-[1200px] items-center justify-between px-6 text-[12px]"
      >
        <a href="#home" className="font-semibold tracking-tight">
          {site.name}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {sections
            .filter((s) => s.id !== "home")
            .map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="opacity-80 transition-opacity hover:opacity-100"
                >
                  {d.nav.sections[s.id]}
                </a>
              </li>
            ))}
        </ul>

        <div className="flex items-center gap-5">
          <div role="group" aria-label={d.nav.language} className="flex gap-2">
            {langs.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLang(l)}
                aria-pressed={lang === l}
                className={cx(
                  "font-mono uppercase transition-opacity",
                  lang === l ? "opacity-100" : "opacity-50 hover:opacity-80",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <a
            href="#contact"
            className="hidden rounded-full bg-green px-3 py-1 font-medium text-void transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
          >
            {d.nav.sections.contact}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? d.nav.close : d.nav.menu}
            className="md:hidden"
          >
            {open ? (
              <X className="size-5" strokeWidth={1.5} />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="fixed inset-0 top-11 bg-[rgb(21 18 13 / 0.94)] text-cream backdrop-blur-[20px] backdrop-saturate-[180%] md:hidden">
          <nav aria-label={d.nav.menu} className="px-6 py-6">
            <ul className="flex flex-col">
              {sections.map((s) => (
                <li key={s.id} className="border-b border-cream/10 last:border-b-0">
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-[24px] font-semibold tracking-tight"
                  >
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
