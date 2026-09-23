"use client";

import { useReducedMotion } from "motion/react";
import { useI18n } from "./i18n";
import { Words } from "./ui";
import { site } from "@/content/site";

/**
 * The name header over the hero film — a full-viewport, muted, looping render
 * (generated at build), with the name and role rising over it. Reduced motion,
 * or a browser that refuses the video, falls back to the film's poster still.
 */
export function Hero() {
  const { d } = useI18n();
  const reduced = useReducedMotion();

  return (
    <section
      id="home"
      className="tone-dark relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 text-center"
    >
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/renders/hero-poster.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/renders/hero-poster.png"
          aria-hidden
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/renders/hero.mp4" type="video/mp4" />
        </video>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(21_18_13/0.62),rgb(21_18_13/0.22)_42%,rgb(21_18_13/0.82))]"
      />

      <div className="relative">
        <h1>
          <Words
            text={site.name}
            className="display-hero text-[clamp(3rem,8vw,5.5rem)]"
            step={90}
          />
        </h1>
        <p className="mt-5 font-mono text-[12px] tracking-[0.22em] text-soft uppercase">
          {site.role}
        </p>
        <p className="mx-auto mt-4 max-w-[38rem] text-[15px] leading-relaxed text-soft">
          {d.hero.sub}
        </p>
      </div>
    </section>
  );
}
