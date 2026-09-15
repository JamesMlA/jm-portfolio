"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Command,
  Copy,
  CornerDownLeft,
  Gauge,
  Globe,
  Moon,
  RotateCw,
  Sun,
} from "lucide-react";
import { useI18n, type Lang } from "./i18n";
import { useTheme } from "./theme";
import { useToast } from "./providers";
import type { IconComponent } from "./ui";
import type { PaletteGroup } from "@/content/en";
import { sections, site } from "@/content/site";
import { cx } from "@/lib/utils";

type Cmd = {
  id: string;
  label: string;
  group: PaletteGroup;
  icon: IconComponent;
  hint?: string;
  keywords?: string;
  run: () => void;
};

export function CommandPalette() {
  const { d, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      push({ title: d.contact.copied, body: site.email, tone: "ok" });
    } catch {
      push({ title: site.email, body: d.contact.copy, tone: "info" });
    }
  }, [d.contact.copied, d.contact.copy, push]);

  const commands = useMemo<Cmd[]>(() => {
    const nav: Cmd[] = sections.map((s) => ({
      id: `nav-${s.id}`,
      label: d.nav.sections[s.id],
      group: "navigate",
      icon: ArrowUp,
      hint: `g ${s.key}`,
      keywords: `${s.id} ${s.keywords}`,
      run: () => go(s.id),
    }));

    return [
      ...nav,
      {
        id: "status",
        label: d.palette.commands.status,
        group: "actions",
        icon: Gauge,
        keywords: "status health uptime check",
        run: () => window.dispatchEvent(new Event("jm:status")),
      },
      {
        id: "terminal",
        label: d.palette.commands.terminal,
        group: "actions",
        icon: RotateCw,
        keywords: "replay demo animation demo",
        run: () => window.dispatchEvent(new Event("jm:terminal")),
      },
      {
        id: "email",
        label: d.palette.commands.email,
        group: "actions",
        icon: Copy,
        keywords: "email mail contact copy",
        run: () => void copyEmail(),
      },
      {
        id: "top",
        label: d.palette.commands.top,
        group: "actions",
        icon: ArrowUp,
        keywords: "top home scroll",
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
      {
        id: "theme",
        label: theme === "dark" ? d.palette.commands.theme : d.palette.commands.themeDark,
        group: "theme",
        icon: theme === "dark" ? Sun : Moon,
        keywords: "theme dark light interface",
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      ...(["en", "es"] as Lang[]).map<Cmd>((code) => ({
        id: `lang-${code}`,
        label: code === "en" ? d.palette.commands.langEn : d.palette.commands.langEs,
        group: "language",
        icon: Globe,
        keywords: `language idioma ${code}`,
        run: () => setLang(code),
      })),
    ];
  }, [copyEmail, d, go, setTheme, setLang, theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const exec = useCallback(
    (cmd: Cmd) => {
      cmd.run();
      close();
    },
    [close],
  );

  // global openers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isPaletteKey = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isPaletteKey) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) close();
      if (e.key === "/" && !open) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("jm:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("jm:palette", onOpen);
    };
  }, [close, open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  /** Keep keyboard focus inside the dialog while it owns the screen. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], input, button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // Clamp instead of resetting from an effect: the list can shrink under the cursor.
  const activeIndex = filtered.length === 0 ? 0 : Math.min(active, filtered.length - 1);

  const onListKey = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (Math.min(a, filtered.length - 1) + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (Math.min(a, filtered.length - 1) + filtered.length - 1) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) exec(cmd);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const delta = e.shiftKey ? -1 : 1;
      setActive((a) => (Math.min(a, filtered.length - 1) + delta + filtered.length) % filtered.length);
    }
  };

  const groups = ["navigate", "actions", "theme", "language"] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={d.palette.title}
      className={cx(
        "fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[14vh]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={close}
        className={cx(
          "absolute inset-0 bg-void/70 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        className={cx(
          "panel relative w-full max-w-xl overflow-hidden shadow-lift transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0",
        )}
        onKeyDown={onListKey}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Command className="size-4 shrink-0 text-signal" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder={d.palette.placeholder}
            aria-label={d.palette.placeholder}
            className="w-full bg-transparent font-mono text-sm text-ink placeholder:text-faint focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-2xs text-faint">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="scroll-slim max-h-[22rem] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center font-mono text-xs text-faint">
              {d.palette.empty}
            </li>
          ) : (
            groups.map((group) => {
              const items = filtered.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <li key={group}>
                  <p className="label-xs px-4 pt-3 pb-1.5">{d.palette.groups[group]}</p>
                  <ul>
                    {items.map((cmd) => {
                      const index = filtered.indexOf(cmd);
                      const Icon = cmd.icon;
                      const isActive = index === activeIndex;
                      return (
                        <li key={cmd.id}>
                          <button
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => exec(cmd)}
                            className={cx(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[0.85rem] transition-colors",
                              isActive ? "bg-panel-hi text-ink" : "text-mute hover:text-ink",
                            )}
                          >
                            <Icon
                              className={cx("size-3.5 shrink-0", isActive ? "text-signal" : "text-dim")}
                              strokeWidth={1.75}
                            />
                            <span className="flex-1 truncate">{cmd.label}</span>
                            {cmd.hint ? (
                              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-2xs text-faint">
                                {cmd.hint}
                              </kbd>
                            ) : null}
                            {isActive ? (
                              <CornerDownLeft className="size-3 text-faint" strokeWidth={1.75} />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 font-mono text-2xs text-faint">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line px-1">↑</kbd>
            <kbd className="rounded border border-line px-1">↓</kbd>
            {d.nav.menu}
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-line px-1">↵</kbd>
            <Check className="size-3" />
          </span>
          <span className="ml-auto">
            {site.handle} · {lang.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
