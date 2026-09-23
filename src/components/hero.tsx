"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useI18n } from "./i18n";
import { Pill, Reveal, TextLink, Words } from "./ui";
import { site } from "@/content/site";

/**
 * The opening stage: name, headline rising word by word, two links, and the
 * portrait settling into the fold on scroll.
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
      <h1 className="w-full">
        <Reveal as="span" className="block">
          <span className="kicker text-link">{site.name}</span>
        </Reveal>
        <Words
          text={d.hero.headline}
          className="display-hero mt-4 text-[clamp(2.6rem,7.5vw,5.25rem)]"
          step={70}
        />
      </h1>

      <Reveal delay={220}>
        <p className="mt-6 max-w-[42rem] text-[clamp(1.05rem,2vw,1.5rem)] leading-snug text-soft">
          {d.hero.sub}
        </p>
      </Reveal>

      <Reveal delay={320}>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-6">
          <Pill href="#contact">{d.hero.ctaSecondary}</Pill>
          <TextLink href="#projects">{d.hero.ctaPrimary}</TextLink>
        </div>
      </Reveal>

      {/* the shot — portrait on stage light, settling as you scroll */}
      <motion.div
        ref={shotRef}
        style={reduced ? undefined : { scale }}
        className="relative mt-16 w-full max-w-[34rem]"
      >
        <div
          aria-hidden
          className="absolute inset-x-10 -top-10 bottom-0 rounded-[50%] bg-[radial-gradient(closest-side,var(--shot-glow),transparent)] blur-2xl"
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

      <Reveal delay={120}>
        <p className="mt-6 pb-10 font-mono text-[11px] tracking-[0.14em] text-soft uppercase">
          {d.hero.availability}
        </p>
      </Reveal>
    </section>
  );
}
