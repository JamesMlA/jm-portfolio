"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { en, type Dictionary } from "@/content/en";
import { es } from "@/content/es";
import type { Localized } from "@/content/data";

export type Lang = "en" | "es";

const dictionaries: Record<Lang, Dictionary> = { en, es };
const STORAGE_KEY = "jm.lang";

/**
 * English is the default and the SSR language. A stored preference is applied
 * by the pre-paint script, and React reads the resulting DOM state — so the
 * switch is instant and hydration never disagrees with the markup.
 */
let cached: Lang = "en";
let synced = false;
const listeners = new Set<() => void>();

function readFromEnvironment(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    /* storage unavailable — fall through to the document */
  }
  const attr = document.documentElement.lang;
  return attr === "es" ? "es" : "en";
}

function getSnapshot(): Lang {
  if (!synced) {
    cached = readFromEnvironment();
    synced = true;
  }
  return cached;
}

const getServerSnapshot = (): Lang => "en";

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cached = readFromEnvironment();
    synced = true;
    document.documentElement.lang = cached;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setLang(next: Lang) {
  cached = next;
  synced = true;
  document.documentElement.lang = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* the session still switches language */
  }
  for (const listener of listeners) listener();
}

/**
 * Keeps the document language in step with the store. Without this, a stored
 * Spanish preference renders Spanish copy under lang="en" — wrong for screen
 * readers and for hyphenation.
 */
export function useDocumentLang() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const l = useCallback((value: Localized) => value[lang], [lang]);
  return useMemo(
    () => ({ lang, d: dictionaries[lang], setLang, l }),
    [lang, l],
  );
}
