"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Workflow } from "lucide-react";
import { useI18n } from "./i18n";
import { PanelBar } from "./ui";
import { cx } from "@/lib/utils";

const NODE_W = 122;
const NODE_H = 38;
const SMALL_H = 32;

type NodeId =
  | "developer"
  | "git"
  | "actions"
  | "terraform"
  | "aws"
  | "azure"
  | "gcp"
  | "kubernetes"
  | "docker"
  | "services"
  | "workers"
  | "grafana"
  | "logs"
  | "alerts";

type NodeSpec = {
  id: NodeId;
  x: number;
  y: number;
  small?: boolean;
  accent?: boolean;
  /** vertical connector drawn up to the node above it in the same column */
  below?: NodeId;
};

/** Hand-placed coordinates — a diagram, not a layout algorithm. */
const nodes: NodeSpec[] = [
  { id: "developer", x: 78, y: 96 },
  { id: "git", x: 78, y: 164, small: true, below: "developer" },

  { id: "actions", x: 220, y: 96 },

  { id: "terraform", x: 362, y: 96 },

  { id: "aws", x: 504, y: 96 },
  { id: "azure", x: 504, y: 164, small: true, below: "aws" },
  { id: "gcp", x: 504, y: 216, small: true, below: "azure" },

  { id: "kubernetes", x: 646, y: 96, accent: true },
  { id: "docker", x: 646, y: 164, small: true, below: "kubernetes" },

  { id: "services", x: 788, y: 96 },
  { id: "workers", x: 788, y: 164, small: true, below: "services" },

  { id: "grafana", x: 930, y: 96 },
  { id: "logs", x: 930, y: 164, small: true, below: "grafana" },
  { id: "alerts", x: 930, y: 216, small: true, below: "logs" },
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<NodeId, NodeSpec>;

const spine: NodeId[] = [
  "developer",
  "actions",
  "terraform",
  "aws",
  "kubernetes",
  "services",
  "grafana",
];

const columns: { x: number; label: string; ids: NodeId[] }[] = [
  { x: 78, label: "source", ids: ["developer", "git"] },
  { x: 220, label: "pipeline", ids: ["actions"] },
  { x: 362, label: "iac", ids: ["terraform"] },
  { x: 504, label: "cloud", ids: ["aws", "azure", "gcp"] },
  { x: 646, label: "cluster", ids: ["kubernetes", "docker"] },
  { x: 788, label: "apps", ids: ["services", "workers"] },
  { x: 930, label: "observability", ids: ["grafana", "logs", "alerts"] },
];

/** Signal edge reused by the flow dashes and the travelling packets. */
const spinePath = spine
  .map((id, i) => `${i === 0 ? "M" : "L"} ${byId[id].x} ${byId[id].y}`)
  .join(" ");

/** Observation closes the loop: what alerts surface returns as the next change. */
const FEEDBACK_PATH = `M ${byId.alerts.x} ${byId.alerts.y + SMALL_H / 2 + 6} V 292 H ${byId.actions.x} V ${byId.actions.y + NODE_H / 2 + 6}`;



/**
 * SMIL (packets, LED pulse) is not touched by the CSS reduced-motion rules,
 * so motion is gated in JS and the diagram stays complete without it.
 */
function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const sync = () => setAllowed(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return allowed;
}

export function Topology() {
  const { d } = useI18n();
  const t = d.topology;
  const [active, setActive] = useState<NodeId | null>(null);
  const [running, setRunning] = useState(true);
  const motionAllowed = useMotionAllowed();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const activeSpec = active ? byId[active] : null;

  // Paused freezes the packets mid-edge; the flow dashes fall back to static.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (running) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [running]);

  return (
    <div className="panel grain ticks relative overflow-hidden">
      <PanelBar
        title={t.title}
        icon={Workflow}
        right={
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-pressed={!running}
            className="flex min-h-6 items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-2xs tracking-wide text-dim transition-colors hover:border-line-hi hover:text-mute"
          >
            {running ? (
              <Pause className="size-3" strokeWidth={1.75} />
            ) : (
              <Play className="size-3" strokeWidth={1.75} />
            )}
            {running ? t.running : t.paused}
          </button>
        }
      />

      {/* Desktop / tablet schematic */}
      <div className="hidden px-2 py-4 sm:block">
        <svg
          ref={svgRef}
          viewBox="0 0 1008 316"
          role="group"
          aria-label={t.caption}
          className="w-full"
        >
          <defs>
            <marker
              id="topo-arrow-signal"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-signal)" />
            </marker>
            <marker
              id="topo-arrow-amber"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-amber)" />
            </marker>
          </defs>

          {/* stage rails — one engineering column per pipeline stage */}
          <g aria-hidden>
            <line x1="28" y1="38" x2="980" y2="38" stroke="var(--color-line)" strokeWidth="1" />
            {columns.map((col) => (
              <g key={col.label}>
                <line
                  x1={col.x}
                  y1="38"
                  x2={col.x}
                  y2="300"
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  strokeDasharray="1 6"
                />
                <line
                  x1={col.x}
                  y1="38"
                  x2={col.x}
                  y2={46}
                  stroke="var(--color-line-hi)"
                  strokeWidth="1"
                />
              </g>
            ))}
          </g>
          {columns.map((col) => (
            <text
              key={col.label}
              x={col.x}
              y={26}
              textAnchor="middle"
              className="fill-faint font-mono text-[9px] tracking-[0.18em] uppercase"
            >
              {t.stages[col.label as keyof typeof t.stages]}
            </text>
          ))}

          {/* vertical connectors between stacked nodes */}
          <g aria-hidden>
            {nodes
              .filter((n) => n.below)
              .map((n) => {
                const parent = byId[n.below!];
                const startY = parent.y + (parent.small ? SMALL_H : NODE_H) / 2;
                const endY = n.y - (n.small ? SMALL_H : NODE_H) / 2;
                return (
                  <line
                    key={`edge-${n.id}`}
                    x1={n.x}
                    y1={startY}
                    x2={n.x}
                    y2={endY}
                    stroke="var(--color-line-hi)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                );
              })}
          </g>

          {/* signal edge — the delivery path */}
          <g aria-hidden>
            <path
              d={spinePath}
              fill="none"
              stroke="var(--color-signal-dim)"
              strokeWidth="1.25"
              markerEnd="url(#topo-arrow-signal)"
            />
            <path
              className={running ? "motion-only animate-flow" : undefined}
              d={spinePath}
              fill="none"
              stroke="var(--color-signal)"
              strokeWidth="1.25"
              strokeDasharray="3 13"
              opacity="0.85"
            />

            {/* observability feedback loop */}
            <path
              d={FEEDBACK_PATH}
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.45"
              markerEnd="url(#topo-arrow-amber)"
            />
            <text
              x={(byId.actions.x + byId.alerts.x) / 2}
              y={286}
              textAnchor="middle"
              className="fill-amber font-mono text-[9px] tracking-[0.18em] uppercase"
            >
              {t.feedback}
            </text>
          </g>

          {/* travelling packets — a change moving through the pipeline */}
          {motionAllowed ? (
            <g aria-hidden className="motion-only">
              <circle r="3" fill="var(--color-signal)">
                <animateMotion dur="9s" repeatCount="indefinite" path={spinePath} />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.05;0.9;1"
                  dur="9s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2.5" fill="var(--color-azure)" opacity="0.9">
                <animateMotion dur="9s" begin="4.5s" repeatCount="indefinite" path={spinePath} />
              </circle>
            </g>
          ) : null}

          {/* nodes */}
          {nodes.map((n) => {
            const h = n.small ? SMALL_H : NODE_H;
            const isActive = active === n.id;
            const x0 = n.x - NODE_W / 2;
            const x1 = n.x + NODE_W / 2;
            const y0 = n.y - h / 2;
            const y1 = n.y + h / 2;
            return (
              <g
                key={n.id}
                tabIndex={0}
                role="button"
                aria-label={t.nodes[n.id]}
                aria-pressed={isActive}
                onMouseEnter={() => setActive(n.id)}
                onFocus={() => setActive(n.id)}
                onClick={() => setActive(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(n.id);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <rect
                  x={x0}
                  y={y0}
                  width={NODE_W}
                  height={h}
                  rx="7"
                  fill={isActive ? "var(--color-panel-hi)" : "var(--color-panel)"}
                  stroke={isActive ? "var(--color-signal)" : "var(--color-line-hi)"}
                  strokeWidth={isActive ? 1.25 : 1}
                  className="transition-[fill,stroke] duration-300"
                />
                {isActive ? (
                  /* engineering-drawing corner ticks around the selected chip */
                  <path
                    aria-hidden
                    d={`M ${x0 - 4} ${y0 + 5} V ${y0 - 4} H ${x0 + 5} M ${x1 - 5} ${y0 - 4} H ${x1 + 4} V ${y0 + 5} M ${x1 + 4} ${y1 - 5} V ${y1 + 4} H ${x1 - 5} M ${x0 + 5} ${y1 + 4} H ${x0 - 4} V ${y1 - 5}`}
                    fill="none"
                    stroke="var(--color-signal)"
                    strokeWidth="1.25"
                    opacity="0.8"
                  />
                ) : null}
                {n.accent ? (
                  <circle cx={x0 + 12} cy={n.y} r="2.5" fill="var(--color-signal)">
                    {motionAllowed ? (
                      <animate
                        attributeName="opacity"
                        values="1;0.25;1"
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                    ) : null}
                  </circle>
                ) : null}
                <text
                  x={n.accent ? n.x + 5 : n.x}
                  y={n.y + 3.5}
                  textAnchor="middle"
                  className={cx(
                    "font-mono text-[10.5px] tracking-[0.04em] transition-colors duration-300",
                    isActive ? "fill-ink" : "fill-mute",
                  )}
                >
                  {t.nodes[n.id]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile: the same pipeline as a staged rail */}
      <ol className="divide-y divide-line sm:hidden">
        {columns.map((col) => (
          <li key={col.label} className="px-4 py-3">
            <p className="label-xs">{t.stages[col.label as keyof typeof t.stages]}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {col.ids.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActive(id)}
                  aria-pressed={active === id}
                  className={cx(
                    "min-h-8 rounded-md border px-2.5 py-2 font-mono text-2xs tracking-wide transition-colors",
                    active === id
                      ? "border-signal/60 bg-signal-deep text-signal-text"
                      : "border-line-hi bg-panel/60 text-mute",
                  )}
                >
                  {t.nodes[id]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {/* inspector — shared readout for the diagram and the rail */}
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1 border-t border-line px-4 py-3">
        <span className="label-xs mt-0.5 shrink-0">{t.inspect}</span>
        <p className="min-h-[2.5rem] min-w-0 flex-1 text-xs leading-relaxed text-mute">
          {activeSpec ? t.notes[activeSpec.id] : t.caption}
        </p>
      </div>

      {/* legend + the honesty label — always visible */}
      <p className="border-t border-line px-4 py-2.5 text-2xs leading-relaxed text-faint">
        <span className="mr-1.5 font-mono tracking-[0.16em] text-dim uppercase">
          {t.legend}
        </span>
        {t.caption}
      </p>
    </div>
  );
}
