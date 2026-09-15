"use client";

import type { ComponentType, ReactNode } from "react";
import { cx } from "@/lib/utils";

export { Reveal } from "./reveal";

/** Lucide icons and the inline brand glyphs both satisfy this. */
export type IconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("label-xs flex items-center gap-3", className)}>
      <span className="h-px w-6 bg-line-hi" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "left",
  wide = false,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  wide?: boolean;
}) {
  return (
    <header
      className={cx(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="max-w-3xl text-balance text-3xl leading-[1.08] text-ink sm:text-4xl md:text-[2.9rem]">
        {title}
      </h2>
      {lead ? (
        <p
          className={cx(
            "text-pretty text-[0.95rem] leading-relaxed text-mute",
            wide ? "max-w-3xl" : "max-w-2xl",
          )}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}

export function StatusDot({
  tone = "signal",
  pulse = true,
  className,
}: {
  tone?: "signal" | "amber" | "azure" | "dim";
  pulse?: boolean;
  className?: string;
}) {
  const color =
    tone === "signal"
      ? "bg-signal"
      : tone === "amber"
        ? "bg-amber"
        : tone === "azure"
          ? "bg-azure"
          : "bg-faint";
  return (
    <span className={cx("relative inline-flex size-1.5 shrink-0", className)} aria-hidden>
      <span className={cx("absolute inset-0 rounded-full", color)} />
      {/*
        Static halo, not an animation: the whole page shares one pulsing dot
        (the timeline's current role) so the motion stays meaningful.
      */}
      {pulse ? (
        <span
          className={cx("absolute -inset-1 rounded-full opacity-20", color)}
        />
      ) : null}
    </span>
  );
}

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "signal" | "amber";
  className?: string;
}) {
  const tones = {
    neutral: "border-line text-mute hover:border-line-hi hover:text-ink",
    signal: "border-signal-dim/60 bg-signal-deep/50 text-signal-text",
    amber: "border-amber/30 bg-amber/5 text-amber",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-2xs tracking-wide whitespace-nowrap transition-colors",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PanelBar({
  title,
  icon: Icon,
  right,
  meta,
}: {
  title: string;
  icon?: IconComponent;
  right?: ReactNode;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
      {Icon ? <Icon className="size-3.5 shrink-0 text-dim" strokeWidth={1.75} /> : null}
      <span className="font-mono text-2xs tracking-[0.16em] text-dim uppercase">
        {title}
      </span>
      {meta ? (
        <span className="truncate font-mono text-2xs text-faint">{meta}</span>
      ) : null}
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </div>
  );
}

export function ActionLink({
  href,
  children,
  icon: Icon,
  variant = "primary",
  external,
  onClick,
  className,
}: {
  href?: string;
  children: ReactNode;
  icon?: IconComponent;
  variant?: "primary" | "ghost" | "quiet";
  external?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const styles = {
    primary:
      "group relative overflow-hidden border-signal/40 bg-signal-deep text-signal-text-text hover:border-signal hover:bg-signal/10",
    ghost: "border-line-hi text-ink hover:border-signal/50 hover:text-signal",
    quiet: "border-transparent text-mute hover:text-ink",
  } as const;

  const body = (
    <>
      {Icon ? (
        <Icon
          className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-px"
          strokeWidth={1.75}
        />
      ) : null}
      <span>{children}</span>
    </>
  );

  const base = cx(
    "group inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-xs tracking-wide transition-all duration-300",
    styles[variant],
    className,
  );

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {body}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={base}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {body}
    </a>
  );
}

/** Small section wrapper enforcing the shared horizontal rhythm. */
export function Section({
  id,
  children,
  className,
  bleed = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cx(
        "relative scroll-mt-24 border-t border-line",
        !bleed && "px-5 py-20 sm:px-8 md:py-28",
        className,
      )}
    >
      <div className={cx(!bleed && "mx-auto w-full max-w-[76rem]")}>{children}</div>
    </section>
  );
}
