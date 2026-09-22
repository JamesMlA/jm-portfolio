#!/usr/bin/env node
/**
 * Deterministic, text-free poster art for the case studies.
 *
 * One 1600x1000 PNG per Project id (src/content/data.ts) written to
 * public/renders/<id>.png. Motif: mission-control instrumentation —
 * concentric noise-displaced contour rings over a hairline scan grid, with
 * telemetry tick rails and sparse particles. Palette from src/app/globals.css.
 *
 * Every random draw comes from a mulberry32 PRNG seeded with an FNV-1a hash of
 * the id, and all coordinates are rounded before formatting, so re-running the
 * script is byte-identical. Rasterization uses @resvg/resvg-js with system
 * font loading disabled — no fonts enter the pipeline, so the posters can
 * never contain text. The run also answers the browsers' unconditional
 * /favicon.ico probe: public/icon.svg rasterized into a single-entry ICO.
 *
 * Usage: npm run renders
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const WIDTH = 1600;
const HEIGHT = 1000;
const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "renders",
);

/** Design tokens mirrored from src/app/globals.css (`@theme`). */
const C = {
  void: "#05080a",
  panel: "#0a1116",
  line: "#152229",
  lineHi: "#1e3138",
  terrain: "#3d5c66",
  mint: "#4fe3a1",
  amber: "#f0b45f",
  azure: "#6ba7f5",
};

/** `projects` ids from src/content/data.ts, in document order. */
const IDS = [
  "cloud-infrastructure",
  "kubernetes-platform",
  "cicd-automation",
  "streaming-infrastructure",
  "mlops",
];

/** Accent rotation — the five read as a set but never share a signature pair. */
const ACCENTS = [C.mint, C.amber, C.azure];

/* ---------------------------------------------------------------- PRNG -- */

function fnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand, lo, hi) => lo + rand() * (hi - lo);

/** Two-decimal coordinate rounding keeps path strings byte-stable. */
const f = (n) => String(Math.round(n * 100) / 100);

/* --------------------------------------------------------------- motifs -- */

/**
 * One closed contour of a pseudo-terrain: a circle displaced by a sum of
 * integer-frequency sine harmonics. All rings of a poster share the same
 * harmonic field (with a per-ring phase drift) so they nest like the contour
 * lines of a single landform.
 */
function contourPath(cx, cy, radius, harmonics, drift, amp, squash) {
  const steps = 240;
  let d = "";
  for (let s = 0; s < steps; s++) {
    const t = (s / steps) * Math.PI * 2;
    let disp = 0;
    for (const h of harmonics) {
      disp += h.amp * Math.sin(h.freq * t + h.phase + drift);
    }
    const r = radius * (1 + amp * disp);
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r * squash;
    d += `${s ? "L" : "M"}${f(x)} ${f(y)}`;
  }
  return `${d}Z`;
}

/** Hairline scan grid with a faint major/minor cadence. */
function scanGrid(rand) {
  const step = 50;
  const gx = Math.floor(rand() * step);
  const gy = Math.floor(rand() * step);
  let out = "";
  for (let x = gx; x <= WIDTH; x += step) {
    const major = Math.round(x / step) % 4 === 0;
    out += `<line x1="${f(x)}" y1="0" x2="${f(x)}" y2="${HEIGHT}" stroke="${
      major ? C.lineHi : C.line
    }" stroke-opacity="${major ? 0.8 : 0.55}" stroke-width="1"/>`;
  }
  for (let y = gy; y <= HEIGHT; y += step) {
    const major = Math.round(y / step) % 4 === 0;
    out += `<line x1="0" y1="${f(y)}" x2="${WIDTH}" y2="${f(y)}" stroke="${
      major ? C.lineHi : C.line
    }" stroke-opacity="${major ? 0.8 : 0.55}" stroke-width="1"/>`;
  }
  return out;
}

/**
 * Telemetry tick rail: a hairline baseline carrying minor ticks, graduated
 * majors, and occasional seeded signal pips. `dir` "h" runs along x at y=pos,
 * `dir` "v" runs along y at x=pos; `flip` grows ticks inward/upward.
 */
function tickRail({ dir, pos, from, to, flip, accent, accent2, rand }) {
  const step = 16;
  const flipSign = flip ? -1 : 1;
  const rail =
    dir === "h"
      ? `M${f(from)} ${f(pos)}H${f(to)}`
      : `M${f(pos)} ${f(from)}V${f(to)}`;
  let out = `<path d="${rail}" stroke="${C.lineHi}" stroke-opacity="0.9" stroke-width="1"/>`;
  let k = 0;
  for (let p = from; p <= to; p += step, k++) {
    const major = k % 10 === 0;
    const mid = k % 5 === 0;
    const len = (major ? 22 : mid ? 12 : 6) * flipSign;
    const color = major ? accent : mid ? accent2 : C.lineHi;
    const op = major ? 0.9 : mid ? 0.6 : 0.75;
    const seg =
      dir === "h"
        ? `M${f(p)} ${f(pos)}V${f(pos + len)}`
        : `M${f(pos)} ${f(p)}H${f(pos + len)}`;
    out += `<path d="${seg}" stroke="${color}" stroke-opacity="${f(op)}" stroke-width="${major ? 2 : 1}"/>`;
    if (major && rand() < 0.3) {
      const px = dir === "h" ? p : pos + len * 1.7;
      const py = dir === "h" ? pos + len * 1.7 : p;
      out += `<circle cx="${f(px)}" cy="${f(py)}" r="2.5" fill="${accent}" fill-opacity="0.8"/>`;
    }
  }
  return out;
}

/** Sparse particles — dust on the scope, a few as crosshair motes or halos. */
function particles(rand, accent, accent2) {
  const n = 24 + Math.floor(rand() * 10);
  let out = "";
  for (let k = 0; k < n; k++) {
    const x = between(rand, 24, WIDTH - 24);
    const y = between(rand, 24, HEIGHT - 24);
    const r = between(rand, 1.2, 3.2);
    const pick = rand();
    const color = pick < 0.55 ? C.terrain : pick < 0.8 ? accent : accent2;
    const op = between(rand, 0.3, 0.75);
    const shape = rand();
    if (shape < 0.18) {
      out += `<path d="M${f(x - 6)} ${f(y)}H${f(x + 6)}M${f(x)} ${f(y - 6)}V${f(y + 6)}" stroke="${color}" stroke-opacity="${f(op)}" stroke-width="1"/>`;
    } else if (shape < 0.32) {
      out +=
        `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 3)}" fill="${color}" fill-opacity="${f(op * 0.15)}"/>` +
        `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}" fill-opacity="${f(op)}"/>`;
    } else {
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}" fill-opacity="${f(op)}"/>`;
    }
  }
  return out;
}

/** Engineering-drawing corner ticks; the first answers to the accent. */
function cornerTicks(accent) {
  const arm = 44;
  const inset = 40;
  const corners = [
    { x: inset, y: inset, sx: 1, sy: 1 },
    { x: WIDTH - inset, y: inset, sx: -1, sy: 1 },
    { x: inset, y: HEIGHT - inset, sx: 1, sy: -1 },
    { x: WIDTH - inset, y: HEIGHT - inset, sx: -1, sy: -1 },
  ];
  return corners
    .map((c, k) => {
      const d = `M${f(c.x + c.sx * arm)} ${f(c.y)}H${f(c.x)}V${f(c.y + c.sy * arm)}`;
      return `<path d="${d}" fill="none" stroke="${
        k === 0 ? accent : C.lineHi
      }" stroke-opacity="${k === 0 ? 0.9 : 0.8}" stroke-width="2"/>`;
    })
    .join("");
}

/* ---------------------------------------------------------------- poster -- */

function buildSvg(id) {
  const index = IDS.indexOf(id);
  const rand = mulberry32(fnv1a(id));
  const accent = ACCENTS[index % 3];
  const accent2 = ACCENTS[(index + 1) % 3];

  // Ring field: same center and harmonic terrain for every ring of one poster.
  const cx = between(rand, 520 + index * 80, 760 + index * 80);
  const cy = between(rand, 400, 620);
  const squash = between(rand, 0.82, 0.94);
  const harmonics = [1, 2, 3, 4].map((k) => ({
    freq: 2 + Math.floor(rand() * 7),
    amp: 0.11 / k,
    phase: between(rand, 0, Math.PI * 2),
  }));
  const ringCount = 9 + Math.floor(rand() * 4);
  const r0 = between(rand, 50, 78);
  const gap = between(rand, 30, 46);

  let rings = "";
  for (let j = 0; j < ringCount; j++) {
    const radius = r0 + j * gap;
    const amp = 0.05 + j * 0.012;
    const d = contourPath(cx, cy, radius, harmonics, j * 0.19, amp, squash);
    const majorRing = j % 5 === 0;
    const midRing = j % 5 === 2;
    const color = majorRing ? accent : midRing ? accent2 : C.terrain;
    const op = majorRing ? 0.6 : midRing ? 0.35 : 0.28 + j * 0.01;
    if (majorRing) {
      // Soft halo under the accented contours (blur-free glow: fat + faint).
      rings += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.07" stroke-width="9"/>`;
    }
    rings += `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${f(op)}" stroke-width="${majorRing ? 2 : 1.25}"/>`;
  }

  // Center marker on the ring field.
  const marker =
    `<path d="M${f(cx - 18)} ${f(cy)}H${f(cx + 18)}M${f(cx)} ${f(cy - 18)}V${f(cy + 18)}" stroke="${accent2}" stroke-opacity="0.55" stroke-width="1"/>` +
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="6" fill="none" stroke="${accent2}" stroke-opacity="0.5" stroke-width="1"/>`;

  const rails =
    tickRail({
      dir: "h",
      pos: 64,
      from: 96,
      to: WIDTH - 96,
      flip: true,
      accent,
      accent2,
      rand,
    }) +
    tickRail({
      dir: "h",
      pos: HEIGHT - 64,
      from: 96,
      to: WIDTH - 96,
      flip: false,
      accent: accent2,
      accent2: accent,
      rand,
    }) +
    tickRail({
      dir: "v",
      pos: WIDTH - 64,
      from: 160,
      to: HEIGHT - 160,
      flip: true,
      accent,
      accent2,
      rand,
    });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs>
<radialGradient id="bg" cx="${f(cx / WIDTH)}" cy="${f(cy / HEIGHT)}" r="0.8">
<stop offset="0" stop-color="${C.panel}"/>
<stop offset="1" stop-color="${C.void}"/>
</radialGradient>
<radialGradient id="glow" cx="${f(cx / WIDTH)}" cy="${f(cy / HEIGHT)}" r="0.5">
<stop offset="0" stop-color="${accent}" stop-opacity="0.1"/>
<stop offset="1" stop-color="${accent}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
${scanGrid(rand)}
<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(between(rand, 440, 560))}" fill="url(#glow)"/>
${rings}
${marker}
${rails}
${particles(rand, accent, accent2)}
${cornerTicks(accent)}
</svg>`;
}

/* ----------------------------------------------------------------- main -- */

mkdirSync(OUT_DIR, { recursive: true });
for (const id of IDS) {
  const resvg = new Resvg(buildSvg(id), {
    font: { loadSystemFonts: false },
  });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT_DIR, `${id}.png`), png);
  console.log(`renders/${id}.png  ${png.length} bytes`);
}

/* ---------------------------------------------------------------- favicon -- */

const iconSvg = readFileSync(join(OUT_DIR, "..", "icon.svg"), "utf8");
const iconPng = new Resvg(iconSvg, {
  font: { loadSystemFonts: false },
  fitTo: { mode: "width", value: 32 },
})
  .render()
  .asPng();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); // image type: icon
ico.writeUInt16LE(1, 4); // one entry
ico.writeUInt8(32, 6); // width
ico.writeUInt8(32, 7); // height
ico.writeUInt16LE(1, 10); // planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(iconPng.length, 14); // payload size
ico.writeUInt32LE(22, 18); // payload offset
writeFileSync(join(OUT_DIR, "..", "favicon.ico"), Buffer.concat([ico, iconPng]));
console.log(`favicon.ico  ${22 + iconPng.length} bytes`);
