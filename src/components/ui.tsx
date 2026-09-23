"use client";

import { Fragment, type ReactNode } from "react";
import { useI18n } from "./i18n";
import { Reveal } from "./reveal";
import { cx } from "@/lib/utils";

export { Reveal };

/**
 * A story section: one tone (light | gray | dark), one measure. Text columns
 * sit in a 980px grid; visuals may ask for more with `wide`.
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

/** The signature label — mono, tracked, in the accent. */
export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cx("kicker text-link", className)}>{children}</p>;
}

/**
 * Headline text word by word: each word rises out of its own band, staggered.
 * The rise is gated behind `scripting: enabled` — without JS the words simply
 * sit there (AgentReady AR-READ-01).
 */
export function Words({
  text,
  className,
  step = 55,
}: {
  text: string;
  className?: string;
  step?: number;
}) {
  return (
    <Reveal as="span" className={cx("reveal-steady block", className)}>
      {text.split(" ").map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            className="word-band"
            style={{ "--d": `${i * step}ms` } as React.CSSProperties}
          >
            {word}
          </span>{" "}
        </Fragment>
      ))}
    </Reveal>
  );
}

/** The big headline — words rise in sequence. */
export function Headline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cx("display-hero mt-3 text-[clamp(2.4rem,6vw,4.5rem)]", className)}>
      {typeof children === "string" ? <Words text={children} /> : children}
    </h2>
  );
}

/** Supporting line under a headline — 21–28px soft secondary. */
export function Lead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("mt-5 text-[clamp(1.15rem,2.2vw,1.75rem)] leading-snug text-soft", className)}>
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
        "group inline-flex items-center gap-1 py-1 text-[17px] font-medium text-link transition-opacity hover:opacity-75",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        {"›"}
      </span>
      {external ? <span className="sr-only">{d.a11y.external}</span> : null}
    </a>
  );
}

/** Filled action pill — lifts on hover, springs on press. */
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

/** Quiet mono chip — tech names, tags, focus areas. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("tag", className)}>{children}</span>;
}

/** Big number with its label — the spec readout. */
export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="display-hero text-[clamp(1.8rem,4vw,2.75rem)]">{value}</p>
      <p className="mt-1 text-[13px] text-soft">{label}</p>
    </div>
  );
}

/** One row of a spec sheet: mono label left, value right. */
export function SpecRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5 border-b py-5 last:border-b-0 hairline sm:grid-cols-[11rem_1fr] sm:gap-8">
      <p className="kicker pt-1 text-soft">{label}</p>
      <div className="text-[17px] leading-relaxed">{children}</div>
    </div>
  );
}
