"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "jm.theme";

/**
 * Theme lives outside React: the pre-paint script in <head> has already
 * applied it to <html>, so React reads the DOM rather than racing it.
 */
let cached: Theme = "dark";
let synced = false;
const listeners = new Set<() => void>();

function apply(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function readFromEnvironment(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return "dark";
}

function getSnapshot(): Theme {
  if (!synced) {
    cached = readFromEnvironment();
    synced = true;
  }
  return cached;
}

const getServerSnapshot = (): Theme => "dark";

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keeps multiple tabs of the same site in agreement.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cached = readFromEnvironment();
    synced = true;
    apply(cached);
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(next: Theme) {
  cached = next;
  synced = true;
  apply(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* the session still switches theme */
  }
  for (const listener of listeners) listener();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme]);
  return useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle]);
}
