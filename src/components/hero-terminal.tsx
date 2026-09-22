"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { RotateCw } from "lucide-react";
import { useI18n } from "./i18n";
import { PanelBar } from "./ui";
import { cx } from "@/lib/utils";

type Line = {
  prompt?: string;
  text?: string;
  tone?: "default" | "dim" | "ok" | "warn" | "azure";
  pause?: number;
};

/**
 * A visual story of an ops morning, not a real transcript. Every number is
 * invented decoration and the footnote under the panel says so.
 */
const LINES: Line[] = [
  { prompt: "~", text: "terraform plan -out=release.tfplan", pause: 420 },
  { text: "Plan: 14 to add, 2 to change, 0 to destroy.", tone: "ok", pause: 520 },
  { prompt: "~", text: "kubectl rollout status deploy/platform-api", pause: 380 },
  { text: "worker-01   Ready   4d", tone: "dim" },
  { text: "worker-02   Ready   4d", tone: "dim" },
  { text: "worker-03   Ready   2d", tone: "dim" },
  { text: 'deployment "platform-api" successfully rolled out', tone: "ok", pause: 560 },
  { prompt: "~", text: "./scripts/check-slo.sh", pause: 360 },
  { text: "availability  99.95%   budget ok", tone: "azure" },
  { text: "p95 latency   128ms    within target", tone: "azure", pause: 400 },
  { prompt: "~", text: "make cost-report", pause: 340 },
  { text: "idle compute  3 nodes flagged for rightsizing", tone: "warn", pause: 900 },
];

const toneClass = {
  default: "text-ink",
  dim: "text-dim",
  ok: "text-signal",
  warn: "text-amber",
  azure: "text-azure",
} as const;

const CHARS_PER_TICK = 2;
const TICK_MS = 26;

function subscribeMotionPref(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeMotionPref,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function LineRow({ line, cursor }: { line: Line; cursor?: boolean }) {
  return (
    <p className="flex gap-2">
      {line.prompt ? (
        <span className="text-signal">{line.prompt}</span>
      ) : (
        <span aria-hidden className="w-3 shrink-0" />
      )}
      <span
        className={cx(
          toneClass[line.tone ?? "default"],
          "min-w-0 whitespace-pre-wrap",
        )}
      >
        {line.text}
        {cursor ? (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-3 w-1.5 animate-blink bg-signal align-middle"
          />
        ) : null}
      </span>
    </p>
  );
}

/**
 * One run of the log: type a line, commit it, pause, advance. Remounted under
 * a fresh key to replay — so a run never resets state from inside an effect.
 */
function TypingPass({
  reduced,
  onReplay,
}: {
  reduced: boolean;
  onReplay: () => void;
}) {
  const [committed, setCommitted] = useState(0);
  const [partial, setPartial] = useState("");

  useEffect(() => {
    if (reduced) return;
    let line = 0;
    let chars = 0;
    let timer: number;

    const step = () => {
      if (line >= LINES.length) {
        timer = window.setTimeout(onReplay, 2600);
        return;
      }
      const target = LINES[line].text ?? "";
      chars = Math.min(target.length, chars + CHARS_PER_TICK);
      setPartial(target.slice(0, chars));
      if (chars >= target.length) {
        const finished = LINES[line];
        line += 1;
        chars = 0;
        setCommitted(line);
        setPartial("");
        timer = window.setTimeout(step, finished.pause ?? 180);
        return;
      }
      timer = window.setTimeout(step, TICK_MS);
    };

    timer = window.setTimeout(step, 500);
    return () => window.clearTimeout(timer);
  }, [reduced, onReplay]);

  if (reduced) {
    return (
      <>
        {LINES.map((line, i) => (
          <LineRow key={i} line={line} />
        ))}
      </>
    );
  }

  return (
    <>
      {LINES.slice(0, committed).map((line, i) => (
        <div key={i} className="animate-rise">
          <LineRow line={line} />
        </div>
      ))}
      {committed < LINES.length ? (
        <LineRow line={{ ...LINES[committed], text: partial }} cursor />
      ) : null}
    </>
  );
}

export function HeroTerminal() {
  const { d } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [run, setRun] = useState(0);
  const replay = useCallback(() => setRun((r) => r + 1), []);

  return (
    <div className="panel ticks scanlines overflow-hidden">
      <PanelBar
        title={d.hero.terminalTitle}
        meta={d.hero.stats.healthy}
        right={
          <button
            type="button"
            onClick={replay}
            className="volt-rim flex min-h-6 items-center gap-1.5 rounded border border-line px-2 py-1 font-mono text-2xs text-dim transition-colors hover:text-signal"
          >
            <RotateCw className="size-3" strokeWidth={1.75} />
            {d.hero.terminalHint}
          </button>
        }
      />
      <div
        aria-hidden
        className="scroll-slim max-h-[22rem] min-h-[18rem] overflow-y-auto px-4 py-4 font-mono text-2xs leading-relaxed"
      >
        <TypingPass key={run} reduced={reduced} onReplay={replay} />
      </div>
      <p className="border-t border-line px-4 py-2.5 font-mono text-2xs text-dim">
        {d.hero.note}
      </p>
    </div>
  );
}
