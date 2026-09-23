"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useI18n, type Lang } from "./i18n";
import { site } from "@/content/site";
import { cx } from "@/lib/utils";

/**
 * The bar — as quiet as the reference's: name (home), Info, language, and a
 * small contact pill. Warm frosted glass, tone-aware. The language switch runs
 * inside a view transition so the page crossfades.
 */
export function Nav() {
  const { d, lang, setLang } = useI18n();
  const [barDark, setBarDark] = useState(true);

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
        className="mx-auto flex h-11 w-full max-w-[1400px] items-center justify-between px-7 text-[12px]"
      >
        <Link href="/" className="font-medium tracking-tight">
          {site.name}
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/info"
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            {d.nav.sections.about}
          </Link>
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
          <Link
            href="/info#contact"
            className="hidden rounded-full bg-green px-3 py-1 font-medium text-void transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
          >
            {d.nav.sections.contact}
          </Link>
        </div>
      </nav>
    </header>
  );
}
