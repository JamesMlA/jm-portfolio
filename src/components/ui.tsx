"use client";

import type { ReactNode } from "react";
import { useI18n } from "./i18n";
import { cx } from "@/lib/utils";

export { Reveal } from "./reveal";

/**
 * A story section: one tone (light | gray | dark), one measure. Text columns
 * sit in Apple's 980px grid; visuals may ask for more with `wide`.
 */
export function Section({
  id,
  tone = "light",
  children,
  className,
  wide = false,
}: {
  id?: string;
  tone?: "light" | "gray" | "dark";
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section
      id={id}
      className={cx(
        "tone-light",
        tone === "gray" && "tone-gray",
        tone === "dark" && "tone-dark",
        "relative overflow-hidden px-6 py-24 sm:px-8 md:py-32",
        className,
      )}
    >
      <div
        className={cx(
          "mx-auto w-full",
          wide ? "max-w-[1200px]" : "max-w-[980px]",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** The small colored label above a story headline. */
export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("kicker text-link", className)}>{children}</p>
  );
}

/** The launch headline. */
export function Headline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cx(
        "display-hero mt-2 text-[clamp(2.4rem,6vw,4.5rem)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** Supporting line under a headline — 21–28px soft grey. */
export function Lead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("mt-4 text-[clamp(1.15rem,2.2vw,1.75rem)] leading-snug text-soft", className)}>
      {children}
    </p>
  );
}

/** Text link with a chevron that slides on hover. */
export function TextLink({
  href,
  children,
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  const { d } = useI18n();
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={cx(
        "group inline-flex items-center gap-0.5 py-1 text-[17px] text-link",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        {"›"}
      </span>
      {external ? <span className="sr-only">{d.a11y.external}</span> : null}
    </a>
  );
}

/** Filled action pill. */
export function Pill({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cx("pill", className)}>
      {children}
    </a>
  );
}

/** Quiet product chip — tech names, tags, focus areas. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("tag", className)}>{children}</span>;
}

/** Big number with its label — the tech-spec readout. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="display-hero text-[clamp(1.8rem,4vw,2.75rem)]">{value}</p>
      <p className="mt-1 text-[13px] text-soft">{label}</p>
    </div>
  );
}

/** One row of a spec sheet: label left, value right. */
export function SpecRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b py-5 last:border-b-0 hairline sm:grid-cols-[10rem_1fr] sm:gap-8">
      <p className="text-[15px] font-semibold text-soft">{label}</p>
      <div className="text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}
