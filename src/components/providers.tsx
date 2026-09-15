"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDocumentLang } from "./i18n";
import { cx } from "@/lib/utils";

type ToastTone = "ok" | "warn" | "info";
type Toast = { id: number; title: string; body?: string; tone: ToastTone };

type ToastValue = {
  push: (toast: { title: string; body?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastValue | null>(null);

const toneDot: Record<ToastTone, string> = {
  ok: "bg-signal",
  warn: "bg-amber",
  info: "bg-azure",
};

/** Console-style notifications. Short-lived, non-blocking, never modal. */
function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<ToastValue["push"]>(({ title, body, tone = "ok" }) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, title, body, tone }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      4600,
    );
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="panel animate-rise pointer-events-auto flex items-start gap-3 px-3.5 py-3 shadow-lift backdrop-blur-sm"
          >
            <span
              className={cx("mt-1.5 size-1.5 shrink-0 rounded-full", toneDot[toast.tone])}
            />
            <div className="min-w-0">
              <p className="font-mono text-2xs tracking-wide text-ink">{toast.title}</p>
              {toast.body ? (
                <p className="mt-1 text-xs leading-relaxed text-mute">{toast.body}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <Providers>");
  return ctx;
}

export function Providers({ children }: { children: ReactNode }) {
  useDocumentLang();
  return <Toaster>{children}</Toaster>;
}
