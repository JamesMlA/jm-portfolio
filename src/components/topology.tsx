"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { cx } from "@/lib/utils";
import { PanelBar } from "./ui";
import { Workflow, Pause, Play } from "lucide-react";

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

/** Spine path reused by the flow dashes and the travelling packets. */
const spinePath = spine
  .map((id, i) => `${i === 0 ? "M" : "L"} ${byId[id].x} ${byId[id].y}`)
  .join(" ")
  .concat(` L ${byId.grafana.x} ${byId.grafana.y}`);

const FEEDBACK_PATH = `M ${byId.alerts.x} ${byId.alerts.y + SMALL_H / 2 + 8} V 286 H ${byId.actions.x} V ${byId.actions.y + NODE_H / 2 + 6}`;

export function Topology() {
  const { d } = useI18n();
  const t = d.topology;
  const [active, setActive] = useState<NodeId | null>("kubernetes");
  const [running, setRunning] = useState(true);
  const activeSpec = active ? byId[active] : null;

  return (
    <div className="panel grain relative overflow-hidden">
      <PanelBar
        title={t.title}
        icon={Workflow}
        right={
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-pressed={!running}
            className="flex items-center gap-1.5 rounded border border-line px-2 py-1 font-mono text-2xs tracking-wide text-dim transition-colors hover:border-line-hi hover:text-mute"
          >
            {running ? <Pause className="size-3" /> : <Play className="size-3" />}
            {running ? t.running : t.paused}
          </button>
        }
      />

      {/* Desktop / tablet diagram */}
      <div className="hidden px-2 py-4 sm:block">
        <svg
          viewBox="0 0 1008 316"
          role="img"
          aria-label={t.caption}
          className={cx("w-full", !running && "topology-paused")}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-line-hi)" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-signal)" />
            </marker>
          </defs>

          {/* stage labels + column ticks */}
          {columns.map((col) => (
            <g key={col.label}>
              <text
                x={col.x}
                y={26}
                textAnchor="middle"
                className="fill-faint font-mono text-[9px] tracking-[0.18em] uppercase"
              >
                {t.stages[col.label as keyof typeof t.stages]}
              </text>
              <line
                x1={col.x}
                y1={38}
                x2={col.x}
                y2={44}
                stroke="var(--color-line-hi)"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* vertical connectors between stacked nodes */}
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

          {/* horizontal spine */}
          <path
            d={spinePath}
            fill="none"
            stroke="var(--color-line-hi)"
            strokeWidth="1.25"
            markerEnd="url(#arrow)"
          />

          {/* animated flow overlay */}
          <path
            className="motion-only animate-flow"
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
            opacity="0.5"
            markerEnd="url(#arrow)"
          />
          <text
            x={560}
            y={280}
            textAnchor="middle"
            className="fill-amber/70 font-mono text-[9px] tracking-[0.16em] uppercase"
          >
            feedback
          </text>

          {/* travelling change — commit moving through the pipeline */}
          <g className="motion-only">
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
              <animateMotion
                dur="9s"
                begin="4.5s"
                repeatCount="indefinite"
                path={spinePath}
              />
            </circle>
          </g>

          {/* nodes */}
          {nodes.map((n) => {
            const h = n.small ? SMALL_H : NODE_H;
            const isActive = active === n.id;
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
                className="cursor-pointer outline-none"
              >
                <rect
                  x={n.x - NODE_W / 2}
                  y={n.y - h / 2}
                  width={NODE_W}
                  height={h}
                  rx="7"
                  fill={isActive ? "var(--color-panel-hi)" : "var(--color-panel)"}
                  stroke={isActive ? "var(--color-signal)" : "var(--color-line-hi)"}
                  strokeWidth={isActive ? 1.25 : 1}
                  className="transition-[fill,stroke] duration-300"
                />
                {n.accent ? (
                  <circle cx={n.x - NODE_W / 2 + 12} cy={n.y} r="2.5" fill="var(--color-signal)">
                    <animate
                      attributeName="opacity"
                      values="1;0.25;1"
                      dur="2.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                ) : null}
                <text
                  x={n.accent ? n.x + 5 : n.x}
                  y={n.y + 3.5}
                  textAnchor="middle"
                  className={cx(
                    "font-mono text-[10.5px] transition-colors duration-300",
                    isActive ? "fill-ink" : "fill-mute",
                  )}
                >
                  {t.nodes[n.id]}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex items-start gap-3 border-t border-line px-4 pt-3">
          <span className="label-xs mt-0.5 shrink-0">{t.inspect}</span>
          <p className="min-h-[2.5rem] text-xs leading-relaxed text-mute">
            {activeSpec ? t.notes[activeSpec.id] : t.caption}
          </p>
        </div>
      </div>

      {/* Mobile: same topology as a linear rail */}
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
                  className={cx(
                    "rounded-md border px-2.5 py-1.5 font-mono text-2xs transition-colors",
                    active === id
                      ? "border-signal/60 bg-signal-deep text-signal-text"
                      : "border-line text-mute",
                  )}
                >
                  {t.nodes[id]}
                </button>
              ))}
            </div>
            {col.ids.includes(active ?? "developer") ? (
              <p className="mt-2 text-xs leading-relaxed text-mute">{t.notes[active!]}</p>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="border-t border-line px-4 py-2.5 text-2xs leading-relaxed text-faint">
        <span className="mr-1.5 font-mono tracking-[0.16em] text-dim uppercase">
          {t.legend}
        </span>
        {t.caption}
      </p>
    </div>
  );
}
