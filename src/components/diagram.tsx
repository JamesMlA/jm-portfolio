"use client";

import {
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cx } from "@/lib/utils";

/**
 * Compact architecture diagrams — mission-control schematics.
 * Hand-placed boxes + orthogonal connectors: a technical drawing, not an
 * auto-layout. Hairline strokes throughout; the signal path runs mint,
 * telemetry edges amber, and each node class carries its instrumentation
 * colour. Everything is SVG so it scales and survives dark/light theming
 * through CSS variables.
 */

type Kind = "plain" | "accent" | "cloud" | "data" | "store";

export type DBox = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub?: string;
  rows?: string[];
  w?: number;
  h?: number;
  kind?: Kind;
};

type DEdge = {
  from: string;
  to: string;
  dashed?: boolean;
  label?: string;
  /** route below the boxes instead of between rows */
  drop?: number;
};

const W = 168;
const H = 46;

/** Node classes: mint marks control points, azure the cloud boundary,
 *  amber the data plane. Everything else stays hairline neutral. */
const strokeFor: Record<Kind, string> = {
  plain: "var(--color-line-hi)",
  accent: "var(--color-signal)",
  cloud: "var(--color-azure)",
  data: "var(--color-amber)",
  store: "var(--color-terrain)",
};

const fillFor: Record<Kind, string> = {
  plain: "var(--color-panel)",
  accent: "var(--color-signal-deep)",
  cloud: "color-mix(in oklab, var(--color-azure) 8%, var(--color-panel))",
  data: "color-mix(in oklab, var(--color-amber) 8%, var(--color-panel))",
  store: "var(--color-panel)",
};

const labelFor: Record<Kind, string> = {
  plain: "fill-ink",
  accent: "fill-signal",
  cloud: "fill-azure",
  data: "fill-amber",
  store: "fill-ink",
};

/** Strokes draw themselves in once the figure reaches the viewport. The
 *  `.motion-only .draw` rule only exists under scripting + motion allowed,
 *  so reduced-motion readers keep fully drawn static schematics; pausing
 *  the animation just holds the pre-draw state until the drawing is seen. */
/** Visibility latch per element — one-way, so the snapshot stays cheap. */
const seen = new WeakSet<Element>();

function subscribeInView(
  ref: React.RefObject<Element | null>,
  onChange: () => void,
) {
  const el = ref.current;
  if (!el || typeof IntersectionObserver === "undefined") return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          seen.add(el);
          onChange();
          io.disconnect();
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
  );
  io.observe(el);
  return () => io.disconnect();
}

function useInView(ref: React.RefObject<Element | null>) {
  return useSyncExternalStore(
    (onChange) => subscribeInView(ref, onChange),
    () => {
      const el = ref.current;
      return (
        typeof IntersectionObserver === "undefined" || (el !== null && seen.has(el))
      );
    },
    () => false,
  );
}

export function Diagram({
  boxes,
  edges,
  viewBox = "0 0 880 300",
  caption,
  className,
}: {
  boxes: DBox[];
  edges: DEdge[];
  viewBox?: string;
  caption?: string;
  className?: string;
}) {
  const frameRef = useRef<SVGSVGElement | null>(null);
  const inView = useInView(frameRef);
  const map = Object.fromEntries(boxes.map((b) => [b.id, b]));
  const geo = (b: DBox) => {
    const w = b.w ?? W;
    const h = b.h ?? H + (b.rows ? b.rows.length * 13 : 0);
    return { w, h, cx: b.x + w / 2, cy: b.y + h / 2 };
  };

  return (
    <figure className={cx("panel grain relative overflow-hidden", className)}>
      <svg
        ref={frameRef}
        viewBox={viewBox}
        role="img"
        aria-label={caption}
        className="block w-full"
        style={{ maxHeight: 340 }}
      >
        <defs>
          <marker id="dg-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--color-signal)" />
          </marker>
          <marker id="dg-arrow-d" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--color-amber)" />
          </marker>
        </defs>

        <g className="motion-only">
          {edges.map((edge, i) => {
            const a = map[edge.from];
            const b = map[edge.to];
            if (!a || !b) return null;
            const ga = geo(a);
            const gb = geo(b);
            let d: string;

            if (edge.drop !== undefined) {
              d = `M ${ga.cx} ${a.y + ga.h} V ${edge.drop} H ${gb.cx} V ${b.y}`;
            } else if (Math.abs(gb.cy - ga.cy) < 6 && gb.cx > ga.cx) {
              d = `M ${a.x + ga.w} ${ga.cy} H ${b.x}`;
            } else if (gb.cx > ga.cx + W) {
              const midX = ga.cx + (gb.cx - ga.cx) / 2;
              d = `M ${a.x + ga.w} ${ga.cy} H ${midX} V ${gb.cy} H ${b.x}`;
            } else {
              d = `M ${ga.cx} ${a.y + ga.h} V ${b.y}`;
            }

            return (
              <g key={i}>
                {/* the schematic hairline: mint signal path, amber telemetry */}
                <path
                  d={d}
                  fill="none"
                  pathLength={edge.dashed ? undefined : 1}
                  stroke={edge.dashed ? "var(--color-amber)" : "var(--color-signal)"}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={edge.dashed ? "4 4" : undefined}
                  opacity={edge.dashed ? 0.65 : 0.5}
                  markerEnd={edge.dashed ? "url(#dg-arrow-d)" : "url(#dg-arrow)"}
                  className={edge.dashed ? undefined : "draw"}
                  style={
                    edge.dashed
                      ? undefined
                      : ({
                          animationPlayState: inView ? "running" : "paused",
                          "--draw-delay": `${i * 70}ms`,
                        } as CSSProperties)
                  }
                />
                {/* travelling flow riding the edge */}
                <path
                  d={d}
                  fill="none"
                  stroke={edge.dashed ? "var(--color-amber)" : "var(--color-signal)"}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={edge.dashed ? "2 14" : "3 13"}
                  opacity={edge.dashed ? 0.9 : 0.95}
                  className="animate-flow"
                />
              </g>
            );
          })}
        </g>

        {boxes.map((b) => {
          const g = geo(b);
          const kind = b.kind ?? "plain";
          return (
            <g key={b.id}>
              <rect
                x={b.x}
                y={b.y}
                width={g.w}
                height={g.h}
                rx="2"
                fill={fillFor[kind]}
                stroke={strokeFor[kind]}
                strokeWidth={kind === "accent" ? 1.2 : 1}
                strokeDasharray={kind === "store" ? "3 3" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              {kind === "accent" ? (
                <circle
                  cx={b.x + 12}
                  cy={b.y + 14}
                  r="2"
                  fill="var(--color-signal)"
                  className="animate-blink"
                />
              ) : null}
              <text
                x={b.x + (kind === "accent" ? 22 : 12)}
                y={b.y + (b.rows ? 20 : b.sub ? 21 : 27)}
                className={cx("font-mono text-2xs", labelFor[kind])}
              >
                {b.label}
              </text>
              {b.sub ? (
                <text x={b.x + 12} y={b.y + 36} className="fill-dim font-mono text-2xs">
                  {b.sub}
                </text>
              ) : null}
              {b.rows?.map((row, ri) => (
                <text
                  key={row}
                  x={b.x + 12}
                  y={b.y + 36 + ri * 13}
                  className="fill-mute font-mono text-2xs"
                >
                  <tspan className="fill-signal">·</tspan> {row}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      {caption ? (
        <figcaption className="border-t border-line px-4 py-2.5 font-mono text-2xs leading-relaxed text-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */

const cloudDiagram = {
  boxes: [
    { id: "repo", x: 24, y: 34, label: "Infrastructure repo", sub: "modules · envs", kind: "accent" as Kind },
    { id: "plan", x: 24, y: 128, label: "CI plan", sub: "reviewed diff" },
    { id: "network", x: 248, y: 34, label: "Network", sub: "VPC · subnets · SG" },
    { id: "compute", x: 248, y: 128, label: "Compute", sub: "containers · ASG" },
    { id: "data", x: 248, y: 222, label: "Data", sub: "RDS · object storage", kind: "data" as Kind },
    { id: "iam", x: 472, y: 34, label: "IAM", sub: "roles · OIDC", kind: "cloud" as Kind },
    { id: "prod", x: 472, y: 128, label: "Production", sub: "promoted artifact", kind: "accent" as Kind },
    { id: "stage", x: 472, y: 222, label: "Staging", sub: "same modules" },
    { id: "obs", x: 696, y: 128, label: "Observability", sub: "metrics · logs" },
  ],
  edges: [
    { from: "repo", to: "plan" },
    { from: "repo", to: "network" },
    { from: "network", to: "compute" },
    { from: "network", to: "data" },
    { from: "plan", to: "iam" },
    { from: "compute", to: "prod" },
    { from: "data", to: "prod" },
    { from: "compute", to: "stage" },
    { from: "prod", to: "obs" },
    { from: "stage", to: "obs" },
  ],
  viewBox: "0 0 880 300",
};

const k8sDiagram = {
  boxes: [
    { id: "clients", x: 24, y: 136, label: "Clients", sub: "internet" },
    { id: "ingress", x: 224, y: 136, label: "Ingress", sub: "TLS · routing" },
    {
      id: "ns",
      x: 424,
      y: 34,
      w: 190,
      h: 190,
      label: "namespace: platform",
      rows: ["deployment: api", "deployment: worker", "cronjob: reports"],
      kind: "accent" as Kind,
    },
    { id: "policy", x: 664, y: 34, label: "Guardrails", sub: "quota · RBAC", kind: "cloud" as Kind },
    { id: "netpol", x: 664, y: 128, label: "NetworkPolicy", sub: "default deny" },
    { id: "nodes", x: 664, y: 222, label: "Nodes", sub: "kubelet · containerd" },
  ],
  edges: [
    { from: "clients", to: "ingress" },
    { from: "ingress", to: "ns" },
    { from: "ns", to: "policy" },
    { from: "ns", to: "netpol" },
    { from: "ns", to: "nodes" },
  ],
  viewBox: "0 0 880 280",
};

const cicdDiagram = {
  boxes: [
    { id: "push", x: 24, y: 128, label: "git push", sub: "pull request", kind: "accent" as Kind },
    { id: "build", x: 224, y: 128, label: "Build", rows: ["pin deps", "compile"] },
    { id: "test", x: 424, y: 34, label: "Test", sub: "unit · integration" },
    { id: "scan", x: 424, y: 128, label: "Security scan", sub: "deps · image" },
    { id: "image", x: 424, y: 222, label: "Image build", sub: "one artifact" },
    { id: "oidc", x: 648, y: 34, label: "OIDC", sub: "short-lived creds", kind: "cloud" as Kind },
    { id: "registry", x: 648, y: 128, label: "Registry", sub: "tagged digest", kind: "store" as Kind },
    { id: "deploy", x: 648, y: 222, label: "Deploy", sub: "rollout · health", kind: "accent" as Kind },
  ],
  edges: [
    { from: "push", to: "build" },
    { from: "build", to: "test" },
    { from: "build", to: "scan" },
    { from: "build", to: "image" },
    { from: "test", to: "oidc" },
    { from: "image", to: "registry" },
    { from: "scan", to: "registry" },
    { from: "registry", to: "deploy" },
  ],
  viewBox: "0 0 880 300",
};

const streamingDiagram = {
  boxes: [
    { id: "source", x: 24, y: 34, label: "Source", sub: "camera · RTMP" },
    { id: "ingest", x: 224, y: 34, label: "Ingest", sub: "receive · buffer" },
    { id: "encode", x: 424, y: 34, label: "FFmpeg", rows: ["transcode", "ladder of renditions"], kind: "accent" as Kind },
    { id: "package", x: 648, y: 34, label: "Packager", sub: "segments · manifest" },
    { id: "edge", x: 648, y: 128, label: "Delivery", sub: "edge · cache" },
    { id: "hosts", x: 224, y: 222, label: "Linux hosts", sub: "containerized, pinned" },
    { id: "probe", x: 424, y: 222, label: "Stream probes", sub: "continuity · latency", kind: "data" as Kind },
    { id: "alert", x: 648, y: 222, label: "Alerts", sub: "on user symptoms" },
  ],
  edges: [
    { from: "source", to: "ingest" },
    { from: "ingest", to: "encode" },
    { from: "encode", to: "package" },
    { from: "package", to: "edge" },
    { from: "hosts", to: "encode" },
    { from: "probe", to: "encode", dashed: true },
    { from: "probe", to: "alert" },
    { from: "edge", to: "probe", dashed: true },
  ],
  viewBox: "0 0 880 300",
};

const mlopsDiagram = {
  boxes: [
    { id: "data", x: 24, y: 34, label: "Dataset", sub: "versioned input", kind: "data" as Kind },
    { id: "prep", x: 224, y: 34, label: "Prep pipeline", sub: "Python · idempotent" },
    { id: "train", x: 424, y: 34, label: "Train", sub: "local GPU", kind: "accent" as Kind },
    { id: "eval", x: 648, y: 34, label: "Evaluate", sub: "quality gate" },
    { id: "env", x: 224, y: 222, label: "Environment", sub: "pinned · image" },
    { id: "registry", x: 424, y: 222, label: "Model registry", sub: "artifacts", kind: "store" as Kind },
    { id: "serve", x: 648, y: 128, label: "Serving", sub: "container · limits", kind: "accent" as Kind },
    { id: "obs", x: 424, y: 128, label: "Monitoring", sub: "drift · latency" },
  ],
  edges: [
    { from: "data", to: "prep" },
    { from: "prep", to: "train" },
    { from: "train", to: "eval" },
    { from: "eval", to: "registry" },
    { from: "env", to: "train", dashed: true },
    { from: "registry", to: "serve" },
    { from: "serve", to: "obs", dashed: true },
    { from: "obs", to: "registry" },
  ],
  viewBox: "0 0 880 300",
};

export const diagrams = {
  cloud: cloudDiagram,
  k8s: k8sDiagram,
  cicd: cicdDiagram,
  streaming: streamingDiagram,
  mlops: mlopsDiagram,
} as const;

/** Renders the diagram registered for a project's variant. */
export function ProjectDiagram({
  variant,
  caption,
}: {
  variant: keyof typeof diagrams;
  caption: string;
}) {
  const { boxes, edges, viewBox } = diagrams[variant];
  return <Diagram boxes={boxes} edges={edges} viewBox={viewBox} caption={caption} />;
}

/** Small abstract preview used on the project plates. */
export function DiagramTrace({ variant }: { variant: keyof typeof diagrams }) {
  const paths: Record<keyof typeof diagrams, string[]> = {
    cloud: ["M4 20 H26 V10 H48", "M4 20 H26 V30 H48", "M48 10 H70", "M48 30 H70 V20 H92"],
    k8s: ["M4 20 H24 V10 H46", "M4 20 H24 V30 H46", "M46 10 H68", "M46 30 H68 V20 H92"],
    cicd: ["M4 20 H22 V8 H44", "M22 20 H44", "M22 20 V32 H44", "M44 8 H70 V20 H92"],
    streaming: ["M4 12 H30 V6 H56", "M56 6 H80", "M4 28 H30 V22 H56", "M56 22 V34 H80"],
    mlops: ["M4 14 H28 V8 H52", "M52 8 H76 V20 H96", "M4 30 H28 V24 H52", "M52 24 H76"],
  };
  return (
    <svg viewBox="0 0 100 40" aria-hidden className="h-10 w-full">
      {paths[variant].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--color-line-hi)"
          strokeWidth="1"
          strokeDasharray={i === 0 ? undefined : "2 2"}
          className={i === 0 ? "stroke-signal/60" : undefined}
        />
      ))}
      {/* travelling signal along the mint run */}
      <path
        d={paths[variant][0]}
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.9"
        className="motion-only animate-flow"
      />
      {[
        [4, 20],
        [22, 20],
        [44, 8],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="var(--color-signal)" opacity={1 - i * 0.25} />
      ))}
    </svg>
  );
}
