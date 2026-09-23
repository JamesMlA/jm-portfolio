#!/usr/bin/env node
/**
 * Deterministic media for the site (CONTEXT.md "Render panel"):
 *  - three render panels per case study — landscape (2400x1200), macro and
 *    field (both 1600x1000). Each project gets its OWN trio of motifs drawn
 *    from a pool of nine, so the fifteen plates never repeat themselves.
 *  - every panel carries baked annotation (title card on the landscape, a
 *    plate stamp on macro/field) — typed in the site's own faces, vendored in
 *    assets/fonts and passed to resvg explicitly (no system fonts, so the
 *    pipeline stays deterministic and offline).
 *  - a looping hero film (hero.mp4) + poster, custom cursors, favicon.
 *
 * All randomness comes from a mulberry32 PRNG seeded with an FNV-1a hash of
 * "<id>-<kind>"; coordinates and text are the only inputs, so re-running is
 * byte-identical (the mp4 is stabilised with bitexact flags).
 *
 * Usage: npm run renders
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT_DIR = join(ROOT, "public", "renders");
const PUBLIC_DIR = join(ROOT, "public");
const FONT_FILES = [
  join(ROOT, "assets", "fonts", "InstrumentSerif-Regular.ttf"),
  join(ROOT, "assets", "fonts", "JetBrainsMono-Medium.ttf"),
];
const SERIF = "Instrument Serif";
const MONO = "JetBrains Mono";

const KIND_SIZE = {
  landscape: { width: 2400, height: 1200 },
  macro: { width: 1600, height: 1000 },
  field: { width: 1600, height: 1000 },
};

/**
 * Copy mirrors src/content/data.ts (English). Domains are language-neutral on
 * the site; titles use the default language.
 */
const CATALOG = [
  { id: "cloud-infrastructure", index: "01", title: "Cloud infrastructure", domain: "AWS · Azure · GCP", accent: "mint" },
  { id: "kubernetes-platform", index: "02", title: "Kubernetes platform", domain: "Platform · SRE", accent: "cream" },
  { id: "cicd-automation", index: "03", title: "CI/CD & automation", domain: "Delivery · Tooling", accent: "green" },
  { id: "streaming-infrastructure", index: "04", title: "Streaming infrastructure", domain: "Media · Linux", accent: "mint" },
  { id: "mlops", index: "05", title: "AI / MLOps", domain: "Infrastructure for machine learning", accent: "cream" },
];

/** Every project gets its own trio, each including one craft reference. */
const ROLES = {
  "cloud-infrastructure": { landscape: "ridges", macro: "hexgrid", field: "network" },
  "kubernetes-platform": { landscape: "cluster", macro: "moire", field: "wheel" },
  "cicd-automation": { landscape: "terminal", macro: "spokes", field: "constellation" },
  "streaming-infrastructure": { landscape: "dunes", macro: "rings", field: "tree" },
  mlops: { landscape: "bands", macro: "terraces", field: "hexgrid" },
};

const HERO = { width: 1600, height: 900, fps: 20, seconds: 12 };

/** Design tokens mirrored from src/app/globals.css (`@theme`). */
const C = {
  void: "#15120d",
  voidSoft: "#1e1a14",
  cream: "#f3eee3",
  creamSoft: "#e9e2d2",
  mint: "#4fe3a1",
  green: "#0a6b45",
};

/* ------------------------------------------------------- seeded randomness */

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
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

const f = (n) => Math.round(n * 100) / 100;
const TAU = 6.2832;
/** Text goes into XML — ampersands and angle brackets must be escaped. */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Three sine harmonics across the width — the shared ridge primitive. */
function ridgePath(rand, width, baseY, amp, drift = 0, overshoot = 0) {
  const ph = [rand() * TAU, rand() * TAU, rand() * TAU];
  const fr = [0.5 + rand() * 0.6, 1.2 + rand() * 1.1, 2.4 + rand() * 1.6];
  let d = "";
  for (let i = 0; i <= 96; i += 1) {
    const x = -overshoot + (i / 96) * (width + overshoot * 2) + drift;
    const t = (i / 96) * TAU;
    const y =
      baseY +
      amp *
        (Math.sin(t * fr[0] + ph[0]) * 0.55 +
          Math.sin(t * fr[1] + ph[1]) * 0.3 +
          Math.sin(t * fr[2] + ph[2]) * 0.15);
    d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
  }
  return d;
}

function wobbleLine(rand, W, H, baseY, amp, segments = 96) {
  const ph = [rand() * TAU, rand() * TAU];
  const fr = [1 + rand() * 1.2, 2.5 + rand() * 2];
  let d = "";
  for (let i = 0; i <= segments; i += 1) {
    const x = (i / segments) * W;
    const t = (i / segments) * TAU;
    const y = baseY + amp * (Math.sin(t * fr[0] + ph[0]) * 0.7 + Math.sin(t * fr[1] + ph[1]) * 0.3);
    d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
  }
  return d;
}

function ringPath(rand, cx, cy, r, k) {
  const ph = [rand() * TAU, rand() * TAU];
  const fr = [2 + Math.floor(rand() * 3), 5 + Math.floor(rand() * 4)];
  let d = "";
  for (let s = 0; s <= 120; s += 1) {
    const a = (s / 120) * TAU;
    const wob =
      1 +
      0.07 * Math.sin(a * fr[0] + ph[0] + k * 0.06) +
      0.04 * Math.sin(a * fr[1] + ph[1]);
    d += `${s ? "L" : "M"}${f(cx + Math.cos(a) * r * wob * 1.15)} ${f(
      cy + Math.sin(a) * r * wob * 0.8,
    )}`;
  }
  return `${d}Z`;
}

/* ---------------------------------------------------------------- motifs -- */

/** Layered harmonic ridges under a low disc. */
function ridges(rand, W, H, accent) {
  const glowX = W * (0.25 + rand() * 0.5);
  const glowY = H * (0.26 + rand() * 0.16);
  let out = `<circle cx="${f(glowX)}" cy="${f(glowY)}" r="${f(
    Math.min(W, H) * 0.55,
  )}" fill="url(#glow)"/>`;
  out += `<circle cx="${f(glowX)}" cy="${f(glowY)}" r="${f(
    Math.min(W, H) * (0.14 + rand() * 0.1),
  )}" fill="${C.cream}" fill-opacity="0.05"/>`;
  for (let i = 0; i < 5; i += 1) {
    const t = i / 4;
    const baseY = H * (0.52 + t * 0.34);
    const amp = H * (0.05 + (1 - t) * 0.05);
    const last = i === 4;
    const d = ridgePath(rand, W, baseY, amp, 0, 60);
    out += `<path d="${d}L${W + 60} ${H}L-60 ${H}Z" fill="${last ? C.void : C.voidSoft}"/>`;
    out += `<path d="${d}" fill="none" stroke="${last ? accent : C.creamSoft}" stroke-opacity="${
      last ? 0.85 : f(0.07 + (1 - t) * 0.07)
    }" stroke-width="${last ? 2.4 : 1.4}"/>`;
  }
  return out;
}

/** Soft overlapping dunes — wide quadratic crests, no horizon line. */
function dunes(rand, W, H, accent) {
  let out = "";
  const n = 6 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i += 1) {
    const cx1 = W * rand();
    const baseY = H * (0.3 + (i / n) * 0.6);
    const amp = H * (0.16 + rand() * 0.18);
    const d = `M-100 ${f(baseY + amp)} Q ${f(cx1)} ${f(baseY - amp)} ${f(W * 0.5)} ${f(
      baseY,
    )} T ${W + 100} ${f(baseY + amp * 0.4)} L ${W + 100} ${H + 100} L -100 ${H + 100} Z`;
    out += `<path d="${d}" fill="${C.voidSoft}" fill-opacity="0.9"/>`;
    out += `<path d="${d.split(" L ")[0]}" fill="none" stroke="${
      i === n - 1 ? accent : C.creamSoft
    }" stroke-opacity="${i === n - 1 ? 0.6 : f(0.06 + rand() * 0.06)}" stroke-width="${
      i === n - 1 ? 1.8 : 1.2
    }"/>`;
  }
  return out;
}

/** Stepped terraces — quantised contour levels, hairline edges. */
function terraces(rand, W, H, accent) {
  let out = "";
  const levels = 14 + Math.floor(rand() * 6);
  const seedPath = ridgePath(rand, W, H * 0.5, H * 0.22, 0, 80);
  const pts = seedPath.replace(/[ML]/g, " ").trim().split(/\s+/).map(Number);
  const xs = [];
  const ys = [];
  for (let i = 0; i < pts.length; i += 2) {
    xs.push(pts[i]);
    ys.push(pts[i + 1]);
  }
  for (let l = 0; l < levels; l += 1) {
    const t = l / (levels - 1);
    const yOff = H * (0.16 + t * 0.74);
    const step = Math.round(t * 6) / 6;
    let d = "";
    for (let i = 0; i < xs.length; i += 1) {
      const y = Math.max(yOff, ys[i] * (1 - step) + yOff * step);
      d += `${i ? "L" : "M"}${f(xs[i])} ${f(y)}`;
    }
    const major = l % 4 === 0;
    out += `<path d="${d}" fill="none" stroke="${
      major ? accent : C.creamSoft
    }" stroke-opacity="${major ? 0.4 : 0.14}" stroke-width="${major ? 1.6 : 1}"/>`;
  }
  return out;
}

/** A wireframe surface — stacked wavy hairlines. */
function bands(rand, W, H, accent) {
  let out = "";
  const lines = 26 + Math.floor(rand() * 10);
  for (let i = 0; i < lines; i += 1) {
    const t = i / (lines - 1);
    const d = wobbleLine(rand, W, H * (0.24 + t * 0.62), H * (0.02 + (1 - Math.abs(0.5 - t) * 2) * 0.05));
    const major = i % 5 === 0;
    out += `<path d="${d}" fill="none" stroke="${
      major ? accent : C.creamSoft
    }" stroke-opacity="${major ? 0.35 : 0.12}" stroke-width="${major ? 1.4 : 1}"/>`;
  }
  return out;
}

/** Displaced concentric rings. */
function rings(rand, W, H, accent) {
  const cx = W * (0.32 + rand() * 0.36);
  const cy = H * (0.3 + rand() * 0.4);
  const count = 24 + Math.floor(rand() * 10);
  const gap = Math.min(W, H) * 0.034;
  let out = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(
    Math.min(W, H) * 0.5,
  )}" fill="url(#glow)"/>`;
  for (let k = 0; k < count; k += 1) {
    const major = k % 5 === 0;
    out += `<path d="${ringPath(rand, cx, cy, 26 + k * gap, k)}" fill="none" stroke="${
      k % 3 === 0 ? accent : C.creamSoft
    }" stroke-opacity="${major ? 0.5 : f(0.12 + (k % 3) * 0.05)}" stroke-width="${
      major ? 1.8 : 1
    }"/>`;
  }
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="4" fill="${accent}" fill-opacity="0.8"/>`;
  return out;
}

/** Two rotated line families interfering — a moiré field. */
function moire(rand, W, H, accent) {
  const a1 = -0.06 - rand() * 0.05;
  const a2 = 0.05 + rand() * 0.05;
  const gap1 = 26 + rand() * 10;
  const gap2 = 28 + rand() * 12;
  let out = "";
  const span = Math.hypot(W, H) * 1.2;
  for (const [angle, gap, tone] of [
    [a1, gap1, C.creamSoft],
    [a2, gap2, accent],
  ]) {
    const cx = W / 2 + Math.cos(angle) * span * 0.5;
    const cy = H / 2 + Math.sin(angle) * span * 0.5;
    for (let i = -span / gap; i < span / gap; i += 1) {
      const ox = Math.cos(angle + Math.PI / 2) * i * gap;
      const oy = Math.sin(angle + Math.PI / 2) * i * gap;
      out += `<path d="M${f(cx - Math.cos(angle) * span + ox)} ${f(
        cy - Math.sin(angle) * span + oy,
      )}L${f(cx + Math.cos(angle) * span + ox)} ${f(
        cy + Math.sin(angle) * span + oy,
      )}" stroke="${tone}" stroke-opacity="0.14" stroke-width="1"/>`;
    }
  }
  return out;
}

/** Radial spokes from an off-centre origin, cut by one long arc. */
function spokes(rand, W, H, accent) {
  const cx = W * (0.2 + rand() * 0.2);
  const cy = H * (0.55 + rand() * 0.2);
  const count = 34 + Math.floor(rand() * 14);
  const reach = Math.hypot(W, H);
  let out = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(reach * 0.5)}" fill="url(#glow)"/>`;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * TAU;
    const r0 = reach * (0.1 + rand() * 0.08);
    const r1 = reach * (0.55 + rand() * 0.3);
    const major = i % 6 === 0;
    out += `<path d="M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(
      cx + Math.cos(a) * r1,
    )} ${f(cy + Math.sin(a) * r1)}" stroke="${
      major ? accent : C.creamSoft
    }" stroke-opacity="${major ? 0.45 : 0.13}" stroke-width="${major ? 1.5 : 1}"/>`;
  }
  const arcR = reach * (0.28 + rand() * 0.12);
  out += `<path d="M${f(cx - arcR)} ${f(cy)}A ${f(arcR)} ${f(arcR)} 0 0 1 ${f(
    cx + arcR,
  )} ${f(cy)}" fill="none" stroke="${accent}" stroke-opacity="0.5" stroke-width="1.8"/>`;
  return out;
}

/** A quiet point network over a hairline grid. */
function network(rand, W, H, accent) {
  let out = "";
  for (let x = 100; x < W; x += 100) {
    out += `<path d="M${x} 0V${H}" stroke="${C.creamSoft}" stroke-opacity="0.04"/>`;
  }
  for (let y = 100; y < H; y += 100) {
    out += `<path d="M0 ${y}H${W}" stroke="${C.creamSoft}" stroke-opacity="0.04"/>`;
  }
  const n = 80 + Math.floor(rand() * 30);
  const pts = [];
  for (let i = 0; i < n; i += 1) pts.push([rand() * W, rand() * H]);
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      if (Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) < 150) {
        out += `<path d="M${f(pts[i][0])} ${f(pts[i][1])}L${f(pts[j][0])} ${f(
          pts[j][1],
        )}" stroke="${C.mint}" stroke-opacity="0.1"/>`;
      }
    }
  }
  for (let i = 0; i < n; i += 1) {
    const [x, y] = pts[i];
    const lit = rand() < 0.12;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(
      lit ? 3 : 1.2 + rand() * 1.6,
    )}" fill="${lit ? accent : C.cream}" fill-opacity="${lit ? 0.9 : 0.35}"/>`;
    if (lit) {
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="none" stroke="${accent}" stroke-opacity="0.35"/>`;
    }
  }
  return out;
}

/** A constellation — points joined by arcs, reading like a plotted route. */
function constellation(rand, W, H, accent) {
  const n = 9 + Math.floor(rand() * 5);
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    pts.push([W * (0.08 + rand() * 0.84), H * (0.14 + rand() * 0.72)]);
  }
  let out = "";
  for (let i = 0; i + 1 < n; i += 1) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const mx = (x1 + x2) / 2 + (rand() - 0.5) * H * 0.18;
    const my = (y1 + y2) / 2 + (rand() - 0.5) * H * 0.18;
    out += `<path d="M${f(x1)} ${f(y1)}Q ${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}" fill="none" stroke="${
      C.creamSoft
    }" stroke-opacity="0.22" stroke-width="1"/>`;
  }
  pts.forEach(([x, y], i) => {
    const big = i % 3 === 0;
    out += `<circle cx="${f(x)}" cy="${f(y)}" r="${big ? 4.5 : 2.2}" fill="${
      big ? accent : C.cream
    }" fill-opacity="${big ? 0.95 : 0.5}"/>`;
    if (big) {
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="13" fill="none" stroke="${accent}" stroke-opacity="0.3"/>`;
    }
  });
  return out;
}

/* ------------------------------------------------- domain motifs (craft) -- */

/** A terminal buffer: prompt column, code lines, one live block cursor. */
function terminal(rand, W, H, accent) {
  const marginX = 150;
  const rows = 15 + Math.floor(rand() * 4);
  const top = H * 0.26;
  const step = (H * 0.58) / rows;
  const promptW = step * 2.1;
  let out = `<circle cx="${f(W * 0.7)}" cy="${f(H * 0.3)}" r="${f(
    Math.min(W, H) * 0.42,
  )}" fill="url(#glow)"/>`;
  out += `<circle cx="${f(W * 0.7)}" cy="${f(H * 0.3)}" r="${f(
    Math.min(W, H) * 0.16,
  )}" fill="${C.cream}" fill-opacity="0.05"/>`;
  const cursorRow = Math.floor(rand() * rows);
  for (let r = 0; r < rows; r += 1) {
    const y = top + r * step;
    const glyph = r % 4 === 3 ? "$" : "&gt;";
    out += `<text x="${marginX}" y="${f(y + step * 0.72)}" font-family="${MONO}" font-size="${f(
      step * 1.25,
    )}" fill="${accent}" fill-opacity="0.88">${glyph}</text>`;
    let x = marginX + promptW;
    const blocks = 2 + Math.floor(rand() * 3);
    for (let b = 0; b < blocks; b += 1) {
      const w = 46 + rand() * 300;
      out += `<rect x="${f(x)}" y="${f(y + step * 0.18)}" width="${f(w)}" height="${f(
        step * 0.4,
      )}" rx="${f(step * 0.1)}" fill="${C.cream}" fill-opacity="${f(0.12 + rand() * 0.08)}"/>`;
      x += w + 28;
      if (x > W - marginX - 80) break;
    }
    if (r === cursorRow) {
      out += `<rect x="${f(x)}" y="${f(y + step * 0.08)}" width="${f(
        step * 0.62,
      )}" height="${f(step * 0.8)}" rx="2" fill="${accent}" fill-opacity="0.95"/>`;
    }
  }
  return out;
}

/** A cluster topology: nodes holding pods, joined by hairline mesh. */
function cluster(rand, W, H, accent) {
  let out = `<circle cx="${f(W * 0.5)}" cy="${f(H * 0.45)}" r="${f(
    Math.min(W, H) * 0.55,
  )}" fill="url(#glow)"/>`;
  const cols = 4;
  const rows = 2 + Math.floor(rand() * 2);
  const nodes = [];
  const nodeW = (W - 2 * 180) / cols;
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const x = 180 + c * nodeW + (r % 2 ? 40 : 0);
      const y = H * 0.3 + r * (H * 0.32);
      nodes.push({ x, y, w: nodeW - 90, h: H * 0.2 });
    }
  }
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      if (rand() < 0.35) {
        const a = nodes[i];
        const b = nodes[j];
        out += `<path d="M${f(a.x + a.w / 2)} ${f(a.y + a.h / 2)}L${f(
          b.x + b.w / 2,
        )} ${f(b.y + b.h / 2)}" stroke="${accent}" stroke-opacity="0.14"/>`;
      }
    }
  }
  for (const n of nodes) {
    out += `<rect x="${f(n.x)}" y="${f(n.y)}" width="${f(n.w)}" height="${f(
      n.h,
    )}" rx="10" fill="${C.void}" fill-opacity="0.55" stroke="${C.creamSoft}" stroke-opacity="0.22"/>`;
    const pods = 3 + Math.floor(rand() * 4);
    for (let p = 0; p < pods; p += 1) {
      const pw = 18;
      const gap = 12;
      const px = n.x + 22 + p * (pw + gap);
      const py = n.y + n.h / 2 - pw / 2 + (rand() - 0.5) * 12;
      const lit = rand() < 0.32;
      out += `<rect x="${f(px)}" y="${f(py)}" width="${pw}" height="${pw}" rx="3" fill="${
        lit ? accent : C.cream
      }" fill-opacity="${lit ? 0.78 : 0.16}"/>`;
    }
  }
  return out;
}

/** The helm wheel: seven spokes, two rings, one lit hub. */
function wheel(rand, W, H, accent) {
  const cx = W * (0.4 + rand() * 0.2);
  const cy = H * 0.5;
  const R = Math.min(W, H) * (0.3 + rand() * 0.06);
  const r0 = R * 0.3;
  let out = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.5)}" fill="url(#glow)"/>`;
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R * 1.06)}" fill="none" stroke="${C.creamSoft}" stroke-opacity="0.5"/>`;
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r0)}" fill="none" stroke="${C.creamSoft}" stroke-opacity="0.55"/>`;
  for (let k = 0; k < 7; k += 1) {
    const a = (k / 7) * TAU - Math.PI / 2;
    const tipX = cx + Math.cos(a) * R;
    const tipY = cy + Math.sin(a) * R;
    const perp = a + Math.PI / 2;
    const halfW = R * 0.085;
    out += `<path d="M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(
      tipX + Math.cos(perp) * halfW,
    )} ${f(tipY + Math.sin(perp) * halfW)}L${f(tipX - Math.cos(perp) * halfW)} ${f(
      tipY - Math.sin(perp) * halfW,
    )}Z" fill="${accent}" fill-opacity="0.3" stroke="${accent}" stroke-opacity="0.72"/>`;
  }
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="7" fill="${accent}" fill-opacity="0.9"/>`;
  return out;
}

/** A filesystem tree: orthogonal branches ending in files, root glyph. */
function tree(rand, W, H, accent) {
  const top = H * 0.18;
  const bottom = H * 0.86;
  const rootX = W * 0.16;
  let out = `<text x="${f(rootX - 78)}" y="${f(H * 0.5 + 10)}" font-family="${MONO}" font-size="34" fill="${accent}" fill-opacity="0.5">#</text>`;
  const branches = 4 + Math.floor(rand() * 2);
  for (let b = 0; b < branches; b += 1) {
    const y = top + ((b + 0.5) / branches) * (bottom - top);
    const x2 = rootX + W * (0.22 + rand() * 0.28);
    out += `<path d="M${f(rootX)} ${f(H * 0.5)}H${f(rootX + 22)}V${f(y)}H${f(x2)}" fill="none" stroke="${C.creamSoft}" stroke-opacity="0.2"/>`;
    const leaves = 2 + Math.floor(rand() * 3);
    const x3 = x2 + W * (0.16 + rand() * 0.14);
    out += `<path d="M${f(x2)} ${f(y)}H${f(x3)}" fill="none" stroke="${C.creamSoft}" stroke-opacity="0.14"/>`;
    for (let l = 0; l < leaves; l += 1) {
      const ly = y - (leaves - 1) * 14 + l * 28;
      const lit = rand() < 0.3;
      out += `<path d="M${f(x3)} ${f(y)}V${f(ly)}H${f(x3 + 26)}" fill="none" stroke="${C.creamSoft}" stroke-opacity="0.14"/>`;
      out += `<rect x="${f(x3 + 30)}" y="${f(ly - 7)}" width="14" height="14" rx="3" fill="${
        lit ? accent : C.cream
      }" fill-opacity="${lit ? 0.75 : 0.15}"/>`;
    }
  }
  return out;
}

/** A hex lattice of pods — a few lit, a couple ringed. */
function hexgrid(rand, W, H, accent) {
  const size = 62 + rand() * 10;
  const dx = size * Math.sqrt(3);
  const dy = size * 1.5;
  let out = `<circle cx="${f(W * 0.5)}" cy="${f(H * 0.5)}" r="${f(
    Math.min(W, H) * 0.6,
  )}" fill="url(#glow)"/>`;
  for (let row = -1; row * dy < H + dy; row += 1) {
    for (let col = -1; col * dx < W + dx; col += 1) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * dy;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * TAU - Math.PI / 2;
        return `${f(cx + Math.cos(a) * size * 0.92)} ${f(cy + Math.sin(a) * size * 0.92)}`;
      }).join("L");
      const roll = rand();
      const lit = roll < 0.16;
      out += `<path d="M${pts}Z" fill="${lit ? accent : "none"}" fill-opacity="${
        lit ? 0.32 : 0
      }" stroke="${lit ? accent : C.creamSoft}" stroke-opacity="${
        lit ? 0.8 : 0.2
      }" stroke-width="${lit ? 1.6 : 1}"/>`;
    }
  }
  return out;
}

const MOTIFS = {
  ridges,
  dunes,
  terraces,
  bands,
  rings,
  moire,
  spokes,
  network,
  constellation,
  terminal,
  cluster,
  wheel,
  tree,
  hexgrid,
};

/* ------------------------------------------------------------ annotation -- */

function accentFor(name) {
  return name === "green" ? C.green : name === "cream" ? C.cream : C.mint;
}

/** Landscape plate: the project's title card, typed in the site's own faces. */
function titleCard(cat, accent, W, H) {
  const margin = 110;
  const labelY = H - 232;
  return `
<text x="${margin}" y="${labelY}" font-family="${MONO}" font-size="24" letter-spacing="6" fill="${C.creamSoft}" fill-opacity="0.8">${esc(cat.domain.toUpperCase())}</text>
<text x="${margin}" y="${labelY + 118}" font-family="${SERIF}" font-size="118" fill="${C.cream}">${esc(cat.title)}</text>
<text x="${W - margin}" y="${labelY + 118}" text-anchor="end" font-family="${MONO}" font-size="24" letter-spacing="4" fill="${accent}" fill-opacity="0.9">${esc(cat.index)} / 05</text>
<path d="M${margin} ${labelY - 58}H${W - margin}" stroke="${C.creamSoft}" stroke-opacity="0.18"/>`;
}

/** Macro/field plates: a small stamp carrying just the study's identity. */
function plateStamp(cat, accent, H) {
  const margin = 84;
  return `
<text x="${margin}" y="${H - margin}" font-family="${MONO}" font-size="22" letter-spacing="5" fill="${C.creamSoft}" fill-opacity="0.68">${esc(
    `${cat.index} · ${cat.title.toUpperCase()}`,
  )}</text>
<circle cx="${margin - 38}" cy="${H - margin - 7}" r="5" fill="${accent}" fill-opacity="0.85"/>`;
}

function svgDoc(W, H, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<radialGradient id="glow">
<stop offset="0" stop-color="${C.mint}" stop-opacity="0.08"/>
<stop offset="1" stop-color="${C.mint}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${C.voidSoft}"/>
${body}
</svg>`;
}

function buildPlate(cat, kind) {
  const { width: W, height: H } = KIND_SIZE[kind];
  const rand = mulberry32(fnv1a(`${cat.id}-${kind}`));
  const accent = accentFor(cat.accent);
  const motif = MOTIFS[ROLES[cat.id][kind]];
  const body = motif(rand, W, H, accent);
  const text = kind === "landscape" ? titleCard(cat, accent, W, H) : plateStamp(cat, accent, H);
  return svgDoc(W, H, body + text);
}

/* ------------------------------------------------------------- hero film -- */

const HERO_SEED = mulberry32(fnv1a("hero-film"));
const HERO_DUST = Array.from({ length: 40 }, () => ({
  x: HERO_SEED() * HERO.width,
  y: HERO_SEED() * HERO.height * 0.55,
  r: 0.7 + HERO_SEED() * 1.5,
  phase: HERO_SEED(),
}));
const HERO_GLOW_X = HERO.width * (0.3 + HERO_SEED() * 0.4);
const HERO_GLOW_Y = HERO.height * (0.28 + HERO_SEED() * 0.14);
const HERO_DISC = Math.min(HERO.width, HERO.height) * 0.2;
const HERO_RIDGES = Array.from({ length: 5 }, (_, i) => {
  const rand = mulberry32(fnv1a(`hero-ridge-${i}`));
  const t = i / 4;
  return {
    baseY: HERO.height * (0.5 + t * 0.36),
    drift: 14 + (1 - t) * 34,
    phase: rand(),
    path: ridgePath(rand, HERO.width, 0, HERO.height * (0.05 + (1 - t) * 0.05), 0, 60),
  };
});

function buildHeroFrame(p) {
  const a = p * TAU;
  let out = `<rect width="${HERO.width}" height="${HERO.height}" fill="${C.voidSoft}"/>`;
  out += `<circle cx="${f(HERO_GLOW_X)}" cy="${f(HERO_GLOW_Y)}" r="${f(
    Math.min(HERO.width, HERO.height) * 0.62,
  )}" fill="url(#glow)" opacity="${f(0.7 + 0.3 * Math.sin(a))}"/>`;
  out += `<circle cx="${f(HERO_GLOW_X)}" cy="${f(HERO_GLOW_Y)}" r="${f(
    HERO_DISC * (1 + 0.03 * Math.sin(a)),
  )}" fill="${C.cream}" fill-opacity="0.05"/>`;
  for (const d of HERO_DUST) {
    out += `<circle cx="${f(d.x)}" cy="${f(d.y)}" r="${f(d.r)}" fill="${C.cream}" fill-opacity="${f(
      0.08 + 0.22 * Math.abs(Math.sin(a + d.phase * TAU)),
    )}"/>`;
  }
  out += `<g transform="translate(0 ${f(Math.sin(a) * 6)})">`;
  HERO_RIDGES.forEach((r, i) => {
    const last = i === 4;
    const shift = `transform="translate(${f(Math.sin(a + r.phase * TAU) * r.drift)} ${f(r.baseY)})"`;
    out += `<path d="${r.path}L${HERO.width + 60} ${HERO.height}L-60 ${HERO.height}Z" ${shift} fill="${
      last ? C.void : C.voidSoft
    }"/>`;
    out += `<path d="${r.path}" ${shift} fill="none" stroke="${
      last ? C.mint : C.creamSoft
    }" stroke-opacity="${last ? 0.85 : f(0.07 + (1 - i / 4) * 0.07)}" stroke-width="${last ? 2.4 : 1.4}"/>`;
  });
  out += `</g>`;
  const sweep = p * (HERO.width + 700) - 350;
  out += `<path d="M${f(sweep)} 0V${HERO.height}" stroke="${C.mint}" stroke-opacity="0.16" stroke-width="1.5"/>`;
  out += `<path d="M${f(sweep - 6)} 0V${HERO.height}" stroke="${C.mint}" stroke-opacity="0.06" stroke-width="6"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${HERO.width}" height="${HERO.height}" viewBox="0 0 ${HERO.width} ${HERO.height}">
<defs>
<radialGradient id="glow">
<stop offset="0" stop-color="${C.mint}" stop-opacity="0.08"/>
<stop offset="1" stop-color="${C.mint}" stop-opacity="0"/>
</radialGradient>
</defs>
${out}
</svg>`;
}

/* --------------------------------------------------------------- cursors -- */

function cursorSvg(size, ringR, dotR) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<circle cx="${size / 2}" cy="${size / 2}" r="${ringR}" fill="none" stroke="${C.mint}" stroke-opacity="0.85" stroke-width="1.5"/>
<circle cx="${size / 2}" cy="${size / 2}" r="${dotR}" fill="${C.mint}" fill-opacity="0.95"/>
</svg>`;
}

/* ------------------------------------------------------------------ main -- */

const render = (svg, fitWidth) =>
  new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: MONO },
    ...(fitWidth ? { fitTo: { mode: "width", value: fitWidth } } : {}),
  })
    .render()
    .asPng();

mkdirSync(OUT_DIR, { recursive: true });

for (const cat of CATALOG) {
  rmSync(join(OUT_DIR, `${cat.id}.png`), { force: true }); // superseded single poster
  for (const kind of Object.keys(KIND_SIZE)) {
    const png = render(buildPlate(cat, kind));
    writeFileSync(join(OUT_DIR, `${cat.id}-${kind}.png`), png);
    console.log(`renders/${cat.id}-${kind}.png  ${png.length} bytes`);
  }
}

writeFileSync(join(OUT_DIR, "hero-poster.png"), render(buildHeroFrame(0)));

// The film needs ffmpeg — installed in the Docker build stage and normally
// present on dev machines. Without it the committed hero.mp4 is kept as-is.
let hasFfmpeg = true;
try {
  execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
} catch {
  hasFfmpeg = false;
}

if (hasFfmpeg) {
  const frameDir = mkdtempSync(join(tmpdir(), "hero-frames-"));
  const frames = HERO.fps * HERO.seconds;
  for (let i = 0; i < frames; i += 1) {
    writeFileSync(
      join(frameDir, `f${String(i).padStart(4, "0")}.png`),
      render(buildHeroFrame(i / frames), HERO.width),
    );
  }
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate", String(HERO.fps),
      "-i", join(frameDir, "f%04d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "30",
      "-preset", "slow",
      "-movflags", "+faststart",
      "-fflags", "+bitexact",
      "-flags:v", "+bitexact",
      join(OUT_DIR, "hero.mp4"),
    ],
    { stdio: "ignore" },
  );
  rmSync(frameDir, { recursive: true, force: true });
  console.log("renders/hero.mp4");
} else {
  console.warn("ffmpeg not found — keeping the committed renders/hero.mp4");
}

writeFileSync(join(PUBLIC_DIR, "cursor.png"), render(cursorSvg(32, 4, 2), 32));
writeFileSync(join(PUBLIC_DIR, "cursor-link.png"), render(cursorSvg(32, 10, 2.5), 32));
console.log("cursor.png + cursor-link.png");

const iconPng = render(readFileSync(join(PUBLIC_DIR, "icon.svg"), "utf8"), 32);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6);
ico.writeUInt8(32, 7);
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(iconPng.length, 14);
ico.writeUInt32LE(22, 18);
writeFileSync(join(PUBLIC_DIR, "favicon.ico"), Buffer.concat([ico, iconPng]));
console.log(`favicon.ico  ${22 + iconPng.length} bytes`);
