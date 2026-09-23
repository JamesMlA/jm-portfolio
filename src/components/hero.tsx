"use client";

import { useI18n } from "./i18n";
import { Words } from "./ui";
import { site } from "@/content/site";

/**
 * The name header — the reference's opening: name huge and light, role tiny
 * beneath, nothing else. The work starts immediately below the fold.
 */
export function Hero() {
  const { d } = useI18n();

  return (
    <section
      id="home"
      className="tone-dark relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <h1>
        <Words
          text={site.name}
          className="display-hero text-[clamp(3rem,8vw,5.5rem)]"
          step={90}
        />
      </h1>
      <p className="mt-4 font-mono text-[12px] tracking-[0.18em] text-soft uppercase">
        {site.role}
      </p>
      <p className="mt-3 text-[13px] text-soft">{d.hero.sub}</p>
    </section>
  );
}
