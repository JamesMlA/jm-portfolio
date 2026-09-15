"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Circle, RotateCw, SquareTerminal } from "lucide-react";
import { useI18n } from "./i18n";
import { useToast } from "./providers";
import { cx } from "@/lib/utils";

type Line = {
  prompt?: string;
  text?: string;
  tone?: "default" | "dim" | "ok" | "warn" | "azure";
  pause?: number;
};

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

const HIDDEN: Line[] = [
  { prompt: "~", text: "whoami" },
  { text: "james maradiaga — lead devops engineer", tone: "ok" },
  { text: "you found the tucked-away command. nice.", tone: "dim", pause: 600 },
];

const toneClass = {
  default: "text-ink",
  dim: "text-dim",
  ok: "text-signal",
  warn: "text-amber",
  azure: "text-azure",
} as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      const id = window.setTimeout(() => setReduced(true), 0);
      return () => window.clearTimeout(id);
    }
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const CHARS_PER_TICK = 2;
const TICK_MS = 26;

export function HeroTerminal() {
  const { d } = useI18n();
  const { push } = useToast();
  const [typed, setTyped] = useState<Line[]>([]);
  const [cursor, setCursor] = useState(0);
  const [char, setChar] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hiddenMode, setHiddenMode] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const foundRef = useRef(false);
  const pending = useMemo<Line[]>(() => (hiddenMode ? HIDDEN : LINES), [hiddenMode]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? true), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = useCallback(
    (mode: "normal" | "hidden" = "normal") => {
      setTyped([]);
      setCursor(0);
      setChar(0);
      setHiddenMode(mode === "hidden");
    },
    [],
  );

  useEffect(() => {
    const onReplay = () => replay("normal");
    window.addEventListener("jm:terminal", onReplay);
    return () => window.removeEventListener("jm:terminal", onReplay);
  }, [replay]);

  /** One node at a time: type a line, commit it, pause, advance. */
  useEffect(() => {
    if (reduced) {
      const id = window.setTimeout(() => {
        setTyped(pending);
        setCursor(pending.length);
      }, 0);
      return () => window.clearTimeout(id);
    }
    if (!visible || cursor >= pending.length) return;

    const line = pending[cursor];
    const full = line.text ?? "";
    const isPromptLine = Boolean(line.prompt);

    if (isPromptLine && char < full.length) {
      const id = window.setTimeout(() => setChar((c) => c + CHARS_PER_TICK), TICK_MS);
      return () => window.clearTimeout(id);
    }

    const hold = isPromptLine ? 120 : (line.pause ?? 220);
    const id = window.setTimeout(() => {
      setTyped((prev) => [...prev, line]);
      setChar(0);
      setCursor((c) => c + 1);
    }, hold);
    return () => window.clearTimeout(id);
  }, [char, cursor, pending, reduced, visible]);

  useEffect(() => {
    if (reduced || !visible || cursor < pending.length) return;
    const id = window.setTimeout(() => replay(hiddenMode ? "hidden" : "normal"), 2600);
    return () => window.clearTimeout(id);
  }, [cursor, pending.length, reduced, visible, hiddenMode, replay]);

  const onHiddenDot = () => {
    replay("hidden");
    if (!foundRef.current) {
      foundRef.current = true;
      push({ title: d.egg.terminalFound, body: d.egg.unlocked, tone: "ok" });
    }
  };

  const typing = cursor < pending.length && Boolean(pending[cursor]?.prompt);

  return (
    <div ref={hostRef} className="panel grain relative overflow-hidden shadow-panel">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
        <button
          type="button"
          onClick={onHiddenDot}
          aria-label={d.palette.commands.terminal}
          title="?"
          className="group flex min-h-6 items-center gap-1.5 py-1.5"
        >
          <Circle className="size-2.5 fill-rose/70 text-rose/70" />
          <Circle className="size-2.5 fill-amber/70 text-amber/70" />
          <Circle className="size-2.5 fill-signal/70 text-signal/70 transition-transform duration-300 group-hover:scale-125" />
        </button>
        <span className="ml-1 flex items-center gap-2 font-mono text-2xs tracking-wide text-dim">
          <SquareTerminal className="size-3.5" strokeWidth={1.75} />
          {d.hero.terminalTitle}
        </span>
        <button
          type="button"
          onClick={() => replay("normal")}
          className="ml-auto flex min-h-6 items-center gap-1.5 rounded border border-line px-2 py-1 font-mono text-2xs text-dim transition-colors hover:border-line-hi hover:text-mute"
        >
          <RotateCw className="size-3" />
          {d.hero.terminalHint}
        </button>
      </div>

      <div className="scroll-slim h-[19.5rem] overflow-y-auto px-4 py-3.5 font-mono text-[0.775rem] leading-[1.7]">
        <div className="space-y-0.5">
          {typed.map((line, i) => (
            <p key={`${hiddenMode}-${i}`} className="break-words">
              {line.prompt ? (
                <span className="mr-2 text-signal select-none">{line.prompt} $</span>
              ) : null}
              <span className={toneClass[line.tone ?? "default"]}>{line.text}</span>
            </p>
          ))}

          {cursor < pending.length ? (
            <p className="break-words">
              {pending[cursor].prompt ? (
                <span className="mr-2 text-signal select-none">{pending[cursor].prompt} $</span>
              ) : null}
              <span className={toneClass[pending[cursor].tone ?? "default"]}>
                {typing ? pending[cursor].text!.slice(0, char) : ""}
              </span>
              {typing ? (
                <span className="ml-0.5 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] animate-blink bg-signal align-middle" />
              ) : null}
            </p>
          ) : (
            <p>
              <span className="mr-2 text-signal select-none">~ $</span>
              <span className="inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] animate-blink bg-signal align-middle" />
            </p>
          )}
        </div>
      </div>

      <p
        className={cx(
          "border-t border-line px-4 py-2.5 font-mono text-2xs leading-relaxed text-faint",
        )}
      >
        {d.status.footer}
      </p>
    </div>
  );
}
