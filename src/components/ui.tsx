"use client";

import type { ComponentType, ReactNode } from "react";
import { useI18n } from "./i18n";
import { cx } from "@/lib/utils";

export { Reveal } from "./reveal";

/** Lucide icons and the inline brand glyphs both satisfy this. */
export type IconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("label-xs flex items-center gap-3", className)}>
      {index ? (
        <span aria-hidden className="numeral text-base leading-none text-signal/70">
          {index}
        </span>
      ) : (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-signal shadow-[0_0_10px_var(--color-volt)]"
        />
      )}
      {children}
    </p>
  );
}

export function SectionHead({
  index,
  eyebrow,
  title,
  lead,
  align = "left",
  wide = false,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  wide?: boolean;
}) {
  const centered = align === "center";
  return (
    <header
      className={cx(
        "flex flex-col gap-5",
        centered && "items-center text-center",
      )}
    >
      <div
        className={cx(
          "flex w-full items-center gap-4",
          centered && "justify-center",
        )}
      >
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-line-hi to-transparent"
        />
      </div>
      <h2
        className={cx(
          "display-wide text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02]",
          wide && "text-[clamp(2.4rem,6vw,4.4rem)]",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cx(
            "max-w-2xl text-[0.98rem] leading-relaxed text-mute text-pretty",
            centered && "mx-auto",
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
  tone?: "signal" | "amber" | "rose";
  pulse?: boolean;
  className?: string;
}) {
  const fill =
    tone === "amber" ? "bg-amber" : tone === "rose" ? "bg-rose" : "bg-signal";
  return (
    <span className={cx("relative inline-flex size-2", className)}>
      {pulse ? (
        <span
          aria-hidden
          className={cx(
            "absolute inset-0 animate-pulse-ring rounded-full opacity-60",
            fill,
          )}
        />
      ) : null}
      <span className={cx("relative size-2 rounded-full", fill)} />
    </span>
  );
}

const chipTone = {
  neutral: "border-line-hi bg-panel/60 text-mute",
  signal: "border-signal/30 bg-signal-deep/60 text-signal-text",
  amber: "border-amber/30 bg-amber/10 text-amber",
  azure: "border-azure/30 bg-azure/10 text-azure",
} as const;

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof chipTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-2xs tracking-wide",
        chipTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Instrument panel header — phosphor dots, mono title, optional readout. */
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
    <div className="flex items-center gap-3 border-b border-line px-4 py-3">
      <span aria-hidden className="flex items-center gap-1">
        <span className="size-1.5 rounded-full bg-signal/80" />
        <span className="size-1.5 rounded-full bg-amber/50" />
        <span className="size-1.5 rounded-full bg-rose/40" />
      </span>
      {Icon ? (
        <Icon className="size-3.5 text-dim" strokeWidth={1.6} />
      ) : null}
      <p className="min-w-0 truncate font-mono text-2xs tracking-wide text-ink">
        {title}
      </p>
      {meta ? (
        <span className="hidden font-mono text-2xs text-faint sm:inline">
          {meta}
        </span>
      ) : null}
      {right ? <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div> : null}
    </div>
  );
}

const actionVariant = {
  primary:
    "border-signal/40 bg-signal-deep text-signal-text hover:border-signal hover:bg-signal/10",
  secondary:
    "border-line-hi text-ink hover:border-signal/50 hover:text-signal",
  ghost: "border-transparent text-dim hover:text-signal",
} as const;

export function ActionLink({
  href,
  children,
  icon: Icon,
  variant = "primary",
  external,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  icon?: IconComponent;
  variant?: keyof typeof actionVariant;
  external?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const { d } = useI18n();
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={cx(
        "group volt-rim inline-flex min-h-6 items-center gap-2 rounded-lg border px-4.5 py-3 font-mono text-xs tracking-wide transition-colors duration-300",
        actionVariant[variant],
        className,
      )}
    >
      {children}
      {Icon ? (
        <Icon
          className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      ) : null}
      {external ? <span className="sr-only">{d.a11y.external}</span> : null}
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
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cx("relative border-t border-line", className)}>
      <div
        className={cx(
          !bleed && "mx-auto w-full max-w-[76rem] px-5 py-16 sm:px-8 md:py-24",
        )}
      >
        {children}
      </div>
    </section>
  );
}
