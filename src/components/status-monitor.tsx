"use client";

import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { useI18n } from "./i18n";
import { StatusDot } from "./ui";
import { cx } from "@/lib/utils";

/**
 * Easter egg — a small ops panel behind the `200 OK` chip in the status strip.
 * Every value is simulated on purpose; the footer says so.
 */
type Check = { name: string; region: string; ms: number; tone: "signal" | "amber" };

const CHECKS: Check[] = [
  { name: "static-edge", region: "gt-central-1", ms: 24, tone: "signal" },
  { name: "platform-api", region: "us-east-1", ms: 61, tone: "signal" },
  { name: "worker-pool", region: "us-east-1", ms: 88, tone: "amber" },
  { name: "observability", region: "eu-west-2", ms: 47, tone: "signal" },
];

export function StatusMonitor() {
  const { d } = useI18n();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setRevealed(0);
    };
    window.addEventListener("jm:status", onOpen);
    return () => window.removeEventListener("jm:status", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (revealed >= CHECKS.length) return;
    const id = window.setTimeout(() => setRevealed((r) => r + 1), 240);
    return () => window.clearTimeout(id);
  }, [open, revealed]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const worst = CHECKS.some((c) => c.tone === "amber") ? "amber" : "signal";
  const summary = revealed < CHECKS.length ? d.status.checking : d.status.allUp;

  return (
    <div
      className={cx(
        "fixed right-4 bottom-4 z-[75] w-[min(23rem,calc(100vw-2rem))] transition-all duration-400",
        open
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="panel grain overflow-hidden shadow-lift">
        <div className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5">
          <Activity className="size-3.5 text-dim" strokeWidth={1.75} />
          <span className="font-mono text-2xs tracking-[0.16em] text-dim uppercase">
            {d.status.title}
          </span>
          <span className="ml-auto flex items-center gap-2 font-mono text-2xs">
            <StatusDot tone={worst} />
            <span className={worst === "amber" ? "text-amber" : "text-signal"}>
              {revealed < CHECKS.length ? "…" : "200 OK"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={d.nav.close}
            className="grid size-6 place-items-center rounded text-faint transition-colors hover:text-mute"
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <ul className="divide-y divide-line">
          {CHECKS.map((check, i) => (
            <li
              key={check.name}
              className={cx(
                "flex items-center gap-3 px-3.5 py-2.5 transition-opacity duration-300",
                i < revealed ? "opacity-100" : "opacity-0",
              )}
            >
              <StatusDot tone={check.tone} pulse={i === revealed - 1} />
              <span className="font-mono text-[0.72rem] text-ink">{check.name}</span>
              <span className="font-mono text-2xs text-faint">{check.region}</span>
              <span className="ml-auto flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1 w-10 overflow-hidden rounded-full bg-line"
                >
                  <span
                    className={cx(
                      "block h-full rounded-full transition-all duration-700",
                      check.tone === "amber" ? "bg-amber" : "bg-signal",
                    )}
                    style={{ width: i < revealed ? `${Math.min(100, check.ms * 1.6)}%` : "0%" }}
                  />
                </span>
                <span className="w-12 text-right font-mono text-2xs tabular-nums text-dim">
                  {check.ms} ms
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="border-t border-line px-3.5 py-2.5 font-mono text-2xs leading-relaxed text-faint">
          {summary} — {d.status.footer}
        </p>
      </div>
    </div>
  );
}
