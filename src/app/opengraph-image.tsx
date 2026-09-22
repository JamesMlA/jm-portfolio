import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Palette mirrored from src/app/globals.css (`@theme`). No webfonts: the card
 * renders with the generic monospace stack, same as before — font-free
 * rasterization keeps this file safe under `output: "standalone"`. */
const VOID = "#05080a";
const LINE = "#152229";
const LINE_HI = "#1e3138";
const INK = "#e3ecef";
const MUTE = "#9aafb8";
const DIM = "#8397a1";
const SIGNAL = "#4fe3a1";
const AMBER = "#f0b45f";

/** Deterministic fractal-noise grain (fixed seed) as a pure data URI. */
const GRAIN_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">` +
    `<filter id="n" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/>` +
    `</filter>` +
    `<rect width="1200" height="630" fill="#000" filter="url(#n)"/></svg>`,
)}`;

/** Telemetry tick rail heights — index-driven, hence deterministic. */
const TICKS = Array.from({ length: 24 }, (_, i) => ({
  h: i % 10 === 0 ? 20 : i % 5 === 0 ? 13 : 7,
  c: i % 10 === 0 ? AMBER : i % 5 === 0 ? SIGNAL : LINE_HI,
}));

/** Static OG card — mission control: void, hairline grid, mint signal, grain. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: VOID,
          backgroundImage:
            "linear-gradient(to right, rgba(21,34,41,0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(21,34,41,0.65) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          color: INK,
          padding: "64px 72px",
          fontFamily: "monospace",
        }}
      >
        {/* Signal source: mint glow with concentric contour echo, upper right. */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -180,
            width: 620,
            height: 620,
            borderRadius: 999,
            backgroundImage:
              "radial-gradient(circle, rgba(79,227,161,0.18) 0%, rgba(79,227,161,0.06) 45%, rgba(5,8,10,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -20,
            width: 300,
            height: 300,
            borderRadius: 999,
            border: "1px solid rgba(79,227,161,0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 999,
            border: "1px solid rgba(79,227,161,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 85,
            left: 1065,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: SIGNAL,
            boxShadow: "0 0 16px rgba(79,227,161,0.8)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 192,
            left: 960,
            width: 8,
            height: 8,
            borderRadius: 999,
            background: AMBER,
            boxShadow: "0 0 12px rgba(240,180,95,0.7)",
          }}
        />

        {/* Corner ticks. */}
        <div style={{ position: "absolute", top: 30, left: 30, width: 36, height: 36, borderTop: `2px solid ${SIGNAL}`, borderLeft: `2px solid ${SIGNAL}` }} />
        <div style={{ position: "absolute", top: 30, right: 30, width: 36, height: 36, borderTop: `2px solid ${LINE_HI}`, borderRight: `2px solid ${LINE_HI}` }} />
        <div style={{ position: "absolute", bottom: 30, left: 30, width: 36, height: 36, borderBottom: `2px solid ${LINE_HI}`, borderLeft: `2px solid ${LINE_HI}` }} />
        <div style={{ position: "absolute", bottom: 30, right: 30, width: 36, height: 36, borderBottom: `2px solid ${LINE_HI}`, borderRight: `2px solid ${LINE_HI}` }} />

        {/* Header — live signal indicator + handle. */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: SIGNAL,
              boxShadow: "0 0 16px rgba(79,227,161,0.8)",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 20, color: MUTE, letterSpacing: 4, textTransform: "uppercase" }}>
            {site.handle}
          </div>
        </div>

        {/* Identity — values from src/content/site.ts only. */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              fontSize: 24,
              color: SIGNAL,
              letterSpacing: 3,
              textTransform: "uppercase",
              textShadow: "0 0 28px rgba(79,227,161,0.35)",
            }}
          >
            {site.role}
          </div>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.05,
              marginTop: 18,
              letterSpacing: -2,
              color: INK,
              display: "flex",
            }}
          >
            {site.name}
          </div>
          {/* Signal line — mint trace with an amber instrumentation segment. */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 34 }}>
            <div style={{ width: 240, height: 2, background: SIGNAL, boxShadow: "0 0 18px rgba(79,227,161,0.65)", display: "flex" }} />
            <div style={{ width: 56, height: 2, background: AMBER, display: "flex" }} />
            <div style={{ width: 24, height: 2, background: LINE_HI, display: "flex" }} />
          </div>
        </div>

        {/* Footer — origin + telemetry tick rail. */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            marginTop: 44,
            paddingTop: 26,
            borderTop: `1px solid ${LINE}`,
            fontSize: 20,
            color: DIM,
          }}
        >
          <span>{site.url.replace("https://", "")}</span>
          <span style={{ color: LINE_HI }}>·</span>
          <span>{site.location}</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7, marginLeft: "auto" }}>
            {TICKS.map((t, i) => (
              <div key={i} style={{ width: 2, height: t.h, background: t.c, display: "flex" }} />
            ))}
          </div>
        </div>

        {/* Grain — decorative, keeps the void from banding. */}
        <img
          src={GRAIN_SRC}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, opacity: 0.05 }}
        />
      </div>
    ),
    size,
  );
}
