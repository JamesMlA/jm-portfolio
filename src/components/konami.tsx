"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./i18n";
import { useToast } from "./providers";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Easter egg — ↑↑↓↓←→←→BA fires one change-packet sweep across the page.
 * Purely decorative, ~2.6s, then it removes itself.
 */
export function Konami() {
  const { d } = useI18n();
  const { push } = useToast();
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    let index = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQUENCE[index]) {
        index += 1;
        if (index === SEQUENCE.length) {
          index = 0;
          setBurst((b) => b + 1);
          push({ title: "200 OK", body: d.egg.konami, tone: "ok" });
        }
      } else {
        index = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [d.egg.konami, push]);

  useEffect(() => {
    if (burst === 0) return;
    const id = window.setTimeout(() => setBurst(0), 2600);
    return () => window.clearTimeout(id);
  }, [burst]);

  if (burst === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={`${burst}-${i}`}
          className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-signal to-transparent motion-reduce:hidden"
          style={{
            top: `${18 + i * 21}%`,
            animation: `konami-sweep 1.9s cubic-bezier(0.22,1,0.36,1) ${i * 0.14}s both`,
          }}
        />
      ))}
      <style>{`@keyframes konami-sweep { from { transform: translateX(-100%); opacity: 0 } 12% { opacity: 1 } to { transform: translateX(100%); opacity: 0 } }`}</style>
    </div>
  );
}
