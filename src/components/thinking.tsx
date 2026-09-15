"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { Reveal, Section, SectionHead } from "./ui";
import { principles } from "@/content/data";
import { cx } from "@/lib/utils";

/**
 * Rendering: a hub-and-spoke model instead of a force graph — one principle
 * in focus, its relationships drawn as labeled connectors, and a written
 * explanation of what it changes. Reads in 2 seconds, still interactive.
 */
export function Thinking() {
  const { d, l } = useI18n();
  const [focus, setFocus] = useState("reliability");
  const active = principles.find((p) => p.id === focus)!;
  const others = principles.filter((p) => p.id !== focus);

  const isPulled = (id: string) => active.pulls.includes(id);

  return (
    <Section id="thinking" className="bg-abyss">
      <Reveal>
        <SectionHead
          eyebrow={d.thinking.eyebrow}
          title={d.thinking.title}
          lead={d.thinking.lead}
          wide
        />
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-x-14">
        {/* the model */}
        <div className="lg:col-span-7">
          <div className="panel grain ticks relative overflow-hidden p-6 sm:p-8">
            <svg
              viewBox="0 0 640 440"
              role="img"
              aria-label={`${l(active.label)} — ${d.thinking.detail}`}
              className="w-full"
            >
              <defs>
                <radialGradient id="think-hub">
                  <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="320" cy="220" r="150" fill="url(#think-hub)" />

              {/* connective ring */}
              <circle
                cx="320"
                cy="220"
                r="150"
                fill="none"
                stroke="var(--color-line)"
                strokeDasharray="3 7"
              />

              {others.map((p, i) => {
                const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
                const x = 320 + Math.cos(angle) * 150;
                const y = 220 + Math.sin(angle) * 150;
                const pulled = isPulled(p.id);
                return (
                  <g key={p.id}>
                    <line
                      x1="320"
                      y1="220"
                      x2={x}
                      y2={y}
                      stroke={pulled ? "var(--color-signal)" : "var(--color-line-hi)"}
                      strokeWidth={pulled ? 1.4 : 1}
                      strokeDasharray={pulled ? undefined : "3 4"}
                      opacity={pulled ? 0.85 : 0.45}
                    />
                    {pulled ? (
                      <circle r="2.5" fill="var(--color-signal)">
                        <animateMotion
                          dur="4.6s"
                          repeatCount="indefinite"
                          path={`M 320 220 L ${x} ${y}`}
                          keyPoints="0;1"
                          keyTimes="0;1"
                        />
                        <animate attributeName="opacity" values="0;1;1;0" dur="4.6s" repeatCount="indefinite" />
                      </circle>
                    ) : null}
                  </g>
                );
              })}

              {/* satellites */}
              {others.map((p, i) => {
                const angle = (i / others.length) * Math.PI * 2 - Math.PI / 2;
                const x = 320 + Math.cos(angle) * 150;
                const y = 220 + Math.sin(angle) * 150;
                const pulled = isPulled(p.id);
                const label = l(p.label);
                const boxW = Math.max(112, label.length * 6.1 + 26);
                return (
                  <g
                    key={p.id}
                    tabIndex={0}
                    role="button"
                    aria-pressed={pulled}
                    aria-label={label}
                    onMouseEnter={() => setFocus(p.id)}
                    onFocus={() => setFocus(p.id)}
                    onClick={() => setFocus(p.id)}
                    className="cursor-pointer outline-none"
                  >
                    <rect
                      x={x - boxW / 2}
                      y={y - 15}
                      width={boxW}
                      height="30"
                      rx="7"
                      fill="var(--color-panel-hi)"
                      stroke={pulled ? "var(--color-signal)" : "var(--color-line-hi)"}
                      strokeWidth="1"
                      className="transition-[stroke] duration-300"
                    />
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      className={cx(
                        "font-mono text-[10px] transition-colors duration-300",
                        pulled ? "fill-signal" : "fill-mute",
                      )}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* hub */}
              <circle cx="320" cy="220" r="66" fill="var(--color-panel)" stroke="var(--color-signal)" strokeWidth="1.2" />
              <circle cx="320" cy="220" r="66" fill="none" stroke="var(--color-signal)" strokeWidth="0.6" opacity="0.4">
                <animate attributeName="r" values="66;78;66" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="5s" repeatCount="indefinite" />
              </circle>
              <foreignObject x="256" y="186" width="128" height="70">
                <div className="flex h-full items-center justify-center px-2 text-center">
                  <p className="font-display text-[0.95rem] leading-tight text-ink">
                    {l(active.label)}
                  </p>
                </div>
              </foreignObject>
            </svg>

            <p className="mt-4 border-t border-line pt-4 text-center font-mono text-2xs text-faint">
              {d.thinking.focusHint}
            </p>
          </div>
        </div>

        {/* the argument */}
        <div className="lg:col-span-5">
          <div className="space-y-1">
            {principles.map((p) => {
              const isActive = p.id === focus;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFocus(p.id)}
                  onMouseEnter={() => setFocus(p.id)}
                  className={cx(
                    "group flex w-full items-start gap-4 border-b border-line py-4 text-left transition-colors",
                    isActive ? "text-ink" : "text-mute hover:text-ink",
                  )}
                >
                  <span
                    className={cx(
                      "mt-1.5 size-1.5 shrink-0 rounded-full transition-colors",
                      isActive ? "bg-signal" : "bg-line-hi",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-display text-base tracking-tight">{l(p.label)}</span>
                    <span
                      className={cx(
                        "grid transition-all duration-500 ease-out",
                        isActive ? "grid-rows-[1fr] pt-2 opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden text-[0.84rem] leading-relaxed text-mute">
                        {l(p.detail)}
                      </span>
                    </span>
                  </span>
                  <span className="mt-1 font-mono text-2xs text-faint">
                    {String(p.pulls.length).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-panel border border-dashed border-line-hi p-4">
            <p className="label-xs">{d.thinking.related}</p>
            <p className="mt-3 font-mono text-xs leading-relaxed text-signal">
              {active.pulls.map((id) => l(principles.find((p) => p.id === id)!.label)).join(" → ")}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
