"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useI18n } from "./i18n";
import { Pill, TextLink } from "./ui";
import { site } from "@/content/site";

/**
 * The launch stage: product name, tagline, two links, and the product shot
 * settling into the fold as you scroll — the apple.com product-page opener.
 */
export function Hero() {
  const { d } = useI18n();
  const reduced = useReducedMotion();
  const shotRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: shotRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);

  return (
    <section
      id="home"
      className="tone-dark relative flex min-h-[100svh] flex-col items-center overflow-hidden px-6 pt-28 text-center"
    >
      <h1>
        <span className="kicker text-link">{site.name}</span>
        <span className="display-hero mt-3 block text-[clamp(2.6rem,7.5vw,5.25rem)]">
          {d.hero.headline}
        </span>
      </h1>

      <p className="mt-5 max-w-[42rem] text-[clamp(1.05rem,2vw,1.5rem)] leading-snug text-soft">
        {d.hero.sub}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        <Pill href="#contact">{d.hero.ctaSecondary}</Pill>
        <TextLink href="#projects">{d.hero.ctaPrimary}</TextLink>
      </div>

      {/* the product shot — portrait on stage light, settling on scroll */}
      <motion.div
        ref={shotRef}
        style={reduced ? undefined : { scale }}
        className="relative mt-14 w-full max-w-[34rem]"
      >
        <div
          aria-hidden
          className="absolute inset-x-10 -top-10 bottom-0 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-sky)_30%,transparent),transparent)] blur-2xl"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={site.photo}
          alt={d.hero.photoAlt}
          width={560}
          height={560}
          className="shot-fade relative w-full rounded-t-[2.5rem]"
        />
      </motion.div>

      <p className="mt-6 pb-10 text-[13px] text-soft">
        {d.hero.availability}
      </p>
    </section>
  );
}
