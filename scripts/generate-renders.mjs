#!/usr/bin/env node
/**
 * Deterministic, text-free media for the site (CONTEXT.md "Render panel"):
 *  - three render panels per case study — landscape (2400x1200), macro and
 *    field (both 1600x1000)
 *  - a looping hero film (hero.mp4) + its poster, built frame by frame from the
 *    same seeded compositions and encoded with ffmpeg
 *  - custom cursor images (plain + link)
 *  - favicon.ico
 *
 * Every random draw comes from a mulberry32 PRNG seeded with an FNV-1a hash, so
 * panels are byte-identical across runs (the mp4 is stabilised with bitexact
 * flags). Rasterization uses @resvg/resvg-js with system fonts disabled — no
 * text can ever appear. Deliberately no full-canvas noise: it wrecks PNG size.
 *
 * Usage: npm run renders
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "renders",
);
const PUBLIC_DIR = join(OUT_DIR, "..");

const IDS = [
  "cloud-infrastructure",
  "kubernetes-platform",
  "cicd-automation",
  "streaming-infrastructure",
  "mlops",
];

const KIND_SIZE = {
  landscape: { width: 2400, height: 1200 },
  macro: { width: 1600, height: 1000 },
  field: { width: 1600, height: 1000 },
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

/** A ridge line: three sine harmonics, optionally drifted sideways. */
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

/** A displaced closed ring: harmonic wobble around an ellipse. */
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

/* ------------------------------------------------------------- compositions */

/** Landscape — layered ridges under a low disc: quiet, cinematic. */
function buildLandscape(rand, W, H, accent) {
  const glowX = W * (0.25 + rand() * 0.5);
  const glowY = H * (0.26 + rand() * 0.16);
  const disc = Math.min(W, H) * (0.14 + rand() * 0.1);

  let out = `<rect width="${W}" height="${H}" fill="${C.voidSoft}"/>`;
  out += `<circle cx="${f(glowX)}" cy="${f(glowY)}" r="${f(
    Math.min(W, H) * 0.55,
  )}" fill="url(#glow)"/>`;
  out += `<circle cx="${f(glowX)}" cy="${f(glowY)}" r="${f(
    disc,
  )}" fill="${C.cream}" fill-opacity="0.05"/>`;

  for (let i = 0; i < 26; i += 1) {
    out += `<circle cx="${f(rand() * W)}" cy="${f(
      rand() * H * 0.5,
    )}" r="${f(0.8 + rand() * 1.4)}" fill="${C.cream}" fill-opacity="${f(
      0.1 + rand() * 0.25,
    )}"/>`;
  }

  const layers = 5;
  for (let i = 0; i < layers; i += 1) {
    const t = i / (layers - 1);
    const d = ridgePath(rand, W, H * (0.52 + t * 0.34), H * (0.05 + (1 - t) * 0.05));
    const last = i === layers - 1;
    out += `<path d="${d}L${W} ${H}L0 ${H}Z" fill="${
      last ? C.void : C.voidSoft
    }"/>`;
    out += `<path d="${d}" fill="none" stroke="${
      last ? accent : C.creamSoft
    }" stroke-opacity="${last ? 0.85 : f(0.07 + (1 - t) * 0.07)}" stroke-width="${
      last ? 2.4 : 1.4
    }"/>`;
  }
  return out;
}

/** Macro — large displaced contour rings: a texture close-up. */
function buildMacro(rand, W, H, accent) {
  const cx = W * (0.32 + rand() * 0.36);
  const cy = H * (0.3 + rand() * 0.4);
  let out = `<rect width="${W}" height="${H}" fill="${C.void}"/>`;
  const rings = 24 + Math.floor(rand() * 10);
  const gap = Math.min(W, H) * 0.034;
  for (let k = 0; k < rings; k += 1) {
    const major = k % 5 === 0;
    out += `<path d="${ringPath(
      rand,
      cx,
      cy,
      26 + k * gap,
      k,
    )}" fill="none" stroke="${k % 3 === 0 ? accent : C.creamSoft}" stroke-opacity="${
      major ? 0.5 : f(0.12 + (k % 3) * 0.05)
    }" stroke-width="${major ? 1.8 : 1}"/>`;
  }
  out += `<circle cx="${f(cx)}" cy="${f(cy)}" r="4" fill="${accent}" fill-opacity="0.8"/>`;
  return out;
}

/** Field — a quiet point network over a hairline grid. */
function buildField(rand, W, H, accent) {
  let out = `<rect width="${W}" height="${H}" fill="${C.voidSoft}"/>`;
  for (let x = 100; x < W; x += 100) {
    out += `<path d="M${x} 0V${H}" stroke="${C.creamSoft}" stroke-opacity="0.04"/>`;
  }
  for (let y = 100; y < H; y += 100) {
    out += `<path d="M0 ${y}H${W}" stroke="${C.creamSoft}" stroke-opacity="0.04"/>`;
  }

  out += `<path d="${ridgePath(rand, W, H * (0.3 + rand() * 0.4), H * 0.04)}" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="1.4"/>`;

  const n = 80 + Math.floor(rand() * 30);
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    pts.push([rand() * W, rand() * H]);
  }
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

function svgDoc(W, H, body, extraDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<radialGradient id="glow">
<stop offset="0" stop-color="${C.mint}" stop-opacity="0.08"/>
<stop offset="1" stop-color="${C.mint}" stop-opacity="0"/>
</radialGradient>
${extraDefs}
</defs>
${body}
</svg>`;
}

function buildSvg(id, kind) {
  const rand = mulberry32(fnv1a(`${id}-${kind}`));
  const { width: W, height: H } = KIND_SIZE[kind];
  const accent = rand() < 0.65 ? C.mint : C.cream;
  const body =
    kind === "landscape"
      ? buildLandscape(rand, W, H, accent)
      : kind === "macro"
        ? buildMacro(rand, W, H, accent)
        : buildField(rand, W, H, accent);
  return svgDoc(W, H, body);
}

/* ------------------------------------------------------------- hero film -- */

const HERO_SEED = mulberry32(fnv1a("hero-film"));
const HERO_GLOW_X = HERO.width * (0.3 + HERO_SEED() * 0.4);
const HERO_GLOW_Y = HERO.height * (0.28 + HERO_SEED() * 0.14);
const HERO_DISC = Math.min(HERO.width, HERO.height) * 0.2;
const HERO_DUST = Array.from({ length: 40 }, () => ({
  x: HERO_SEED() * HERO.width,
  y: HERO_SEED() * HERO.height * 0.55,
  r: 0.7 + HERO_SEED() * 1.5,
  phase: HERO_SEED(),
}));
const HERO_RIDGES = Array.from({ length: 5 }, (_, i) => {
  const rand = mulberry32(fnv1a(`hero-ridge-${i}`));
  const t = i / 4;
  return {
    baseY: HERO.height * (0.5 + t * 0.36),
    amp: HERO.height * (0.05 + (1 - t) * 0.05),
    drift: 14 + (1 - t) * 34,
    phase: rand(),
    path: ridgePath(rand, HERO.width, 0, HERO.height * (0.05 + (1 - t) * 0.05), 0, 60),
  };
});

/** One frame of the hero film; `p` in [0, 1) so the loop is seamless. */
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
    const tw = 0.08 + 0.22 * Math.abs(Math.sin(a + d.phase * TAU));
    out += `<circle cx="${f(d.x)}" cy="${f(d.y)}" r="${f(d.r)}" fill="${C.cream}" fill-opacity="${f(tw)}"/>`;
  }

  out += `<g transform="translate(0 ${f(Math.sin(a) * 6)})">`;
  HERO_RIDGES.forEach((r, i) => {
    const last = i === 4;
    const drift = Math.sin(a + r.phase * TAU) * r.drift;
    const shift = `transform="translate(${f(drift)} ${f(r.baseY)})"`;
    // fill first, then the edge line on top
    out += `<path d="${r.path}L${HERO.width + 60} ${HERO.height}L-60 ${HERO.height}Z" ${shift} fill="${
      last ? C.void : C.voidSoft
    }"/>`;
    out += `<path d="${r.path}" ${shift} fill="none" stroke="${
      last ? C.mint : C.creamSoft
    }" stroke-opacity="${last ? 0.85 : f(0.07 + (1 - i / 4) * 0.07)}" stroke-width="${
      last ? 2.4 : 1.4
    }"/>`;
  });
  out += `</g>`;

  // a mint reading line sweeping the front ridge
  const sweep = (p * (HERO.width + 700)) - 350;
  out += `<path d="M${f(sweep)} 0V${HERO.height}" stroke="${C.mint}" stroke-opacity="0.16" stroke-width="1.5"/>`;
  out += `<path d="M${f(sweep - 6)} 0V${HERO.height}" stroke="${C.mint}" stroke-opacity="0.06" stroke-width="6"/>`;

  return svgDoc(HERO.width, HERO.height, out);
}

/* --------------------------------------------------------------- cursors -- */

function cursorSvg(size, ringR, dotR) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<circle cx="${size / 2}" cy="${size / 2}" r="${ringR}" fill="none" stroke="${C.mint}" stroke-opacity="0.85" stroke-width="1.5"/>
<circle cx="${size / 2}" cy="${size / 2}" r="${dotR}" fill="${C.mint}" fill-opacity="0.95"/>
</svg>`;
}

/* ----------------------------------------------------------------- main -- */

mkdirSync(OUT_DIR, { recursive: true });
const render = (svg, fitWidth) =>
  new Resvg(svg, {
    font: { loadSystemFonts: false },
    ...(fitWidth ? { fitTo: { mode: "width", value: fitWidth } } : {}),
  })
    .render()
    .asPng();

for (const id of IDS) {
  rmSync(join(OUT_DIR, `${id}.png`), { force: true }); // superseded single poster
  for (const kind of Object.keys(KIND_SIZE)) {
    const png = render(buildSvg(id, kind));
    writeFileSync(join(OUT_DIR, `${id}-${kind}.png`), png);
    console.log(`renders/${id}-${kind}.png  ${png.length} bytes`);
  }
}

// hero poster + film
writeFileSync(join(OUT_DIR, "hero-poster.png"), render(buildHeroFrame(0)));
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

// cursors
writeFileSync(join(PUBLIC_DIR, "cursor.png"), render(cursorSvg(32, 4, 2), 32));
writeFileSync(join(PUBLIC_DIR, "cursor-link.png"), render(cursorSvg(32, 10, 2.5), 32));
console.log("cursor.png + cursor-link.png");

/* ---------------------------------------------------------------- favicon -- */

const iconPng = render(readFileSync(join(PUBLIC_DIR, "icon.svg"), "utf8"), 32);
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); // image type: icon
ico.writeUInt16LE(1, 4); // one entry
ico.writeUInt8(32, 6); // width
ico.writeUInt8(32, 7); // height
ico.writeUInt16LE(1, 10); // planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(iconPng.length, 14); // payload size
ico.writeUInt32LE(22, 18); // payload offset
writeFileSync(join(PUBLIC_DIR, "favicon.ico"), Buffer.concat([ico, iconPng]));
console.log(`favicon.ico  ${22 + iconPng.length} bytes`);
