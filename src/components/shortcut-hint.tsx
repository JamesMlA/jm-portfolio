"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useI18n } from "./i18n";
import { useToast } from "./providers";
import { StatusDot } from "./ui";

/**
 * Easter egg #1 — press `g` then a section key to jump.
 * Easter egg #2 — a one-time ⌘K hint that surfaces late, then leaves.
 */
export function ShortcutHint() {
  const { d } = useI18n();
  const { push } = useToast();
  const [armed, setArmed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("jm.hint")) return;
    const id = window.setTimeout(() => setShowHint(true), 9000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const dismiss = () => {
      setShowHint(false);
      window.sessionStorage.setItem("jm.hint", "1");
    };
    const id = window.setTimeout(dismiss, 9000);
    window.addEventListener("pointerdown", dismiss, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, [showHint]);

  useEffect(() => {
    const map: Record<string, string> = {
      h: "home",
      a: "about",
      e: "experience",
      p: "projects",
      s: "skills",
      g: "github",
      c: "contact",
    };

    let gTimestamp = 0;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const withinChord = Date.now() - gTimestamp < 1400;

      if (key === "g" && !withinChord) {
        gTimestamp = Date.now();
        setArmed(true);
        window.setTimeout(() => setArmed(false), 1400);
        return;
      }
      if (!withinChord) return;

      const id = map[key];
      gTimestamp = 0;
      setArmed(false);
      if (!id) return;
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!fired) {
        setFired(true);
        push({ title: d.egg.terminalFound, body: d.egg.unlocked, tone: "ok" });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [d.egg.terminalFound, d.egg.unlocked, fired, push]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-5">
        <button
          type="button"
          onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
          className={`flex min-h-6 items-center gap-2.5 rounded-full border border-line-hi bg-abyss/90 px-3.5 py-2 font-mono text-2xs text-dim shadow-lift backdrop-blur transition-all duration-500 hover:border-signal/40 hover:text-mute ${
            showHint ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
          }`}
        >
          <kbd className="rounded border border-line px-1.5 py-0.5 text-faint">⌘K</kbd>
          <span>{d.nav.palette}</span>
          <span className="text-faint">·</span>
          <span className="flex items-center gap-1.5 text-faint">
            <ArrowUp className="size-3" />
            g
          </span>
        </button>
      </div>

      <div
        aria-hidden
        className={`pointer-events-none fixed top-3 left-1/2 z-[65] -translate-x-1/2 transition-all duration-200 ${
          armed ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <span className="flex items-center gap-2 rounded-md border border-signal/40 bg-abyss/95 px-3 py-1.5 font-mono text-2xs text-signal shadow-lift backdrop-blur">
          <StatusDot />
          g
          <span className="text-faint">then a–z</span>
        </span>
      </div>
    </>
  );
}
