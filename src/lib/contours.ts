/**
 * Contour field generator — runs once at build time.
 *
 * A shared value-noise field is sampled over a wide, flat rectangle and
 * "contoured" with marching squares. Each closed ring becomes one particle, so
 * the hero is a single <svg> with a sprite of paths and ~120 text-less
 * circles — no canvas, no per-frame JS, no images to download.
 *
 * Rendered *behind* the content: ink-weight strokes at low opacity, so it
 * reads as the physical memory of an infrastructure map rather than a grid.
 */

const SEED = 0x9e3779b9;

/** Perlin-style integer hash → [0,1). */
function hash2(x: number, y: number): number {
  let h = SEED ^ Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2545f491);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf;
}

function fbm(x: number, y: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 4; o += 1) {
    sum += amp * valueNoise(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

/**
 * Pure sampler over the shared value-noise field. The WebGL terrain in the
 * hero render layer is displaced with this, so the synthetic landscape and the
 * SVG contour map read as the same geography. Four-octave fbm → [0, 0.9375).
 */
export function sampleNoise(x: number, y: number): number {
  return fbm(x, y);
}

export type ContourRing = { d: string; level: number };

/**
 * Marching squares with linear interpolation on cell edges.
 * Emits closed rings only — open contours are dropped, since a line running
 * off the edge of the canvas reads as a mistake rather than a landform.
 */
function contour(
  field: Float32Array,
  cols: number,
  rows: number,
  level: number,
  sx: number,
  sy: number,
): string[] {
  const at = (x: number, y: number) => field[y * cols + x];
  const segments: [number, number, number, number][] = [];

  for (let y = 0; y < rows - 1; y += 1) {
    for (let x = 0; x < cols - 1; x += 1) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      let code = 0;
      if (tl > level) code |= 8;
      if (tr > level) code |= 4;
      if (br > level) code |= 2;
      if (bl > level) code |= 1;
      if (code === 0 || code === 15) continue;

      // interpolated crossings, in cell-local [0,1] units
      const top: [number, number] = [x + (level - tl) / (tr - tl || 1e-6), y];
      const right: [number, number] = [x + 1, y + (level - tr) / (br - tr || 1e-6)];
      const bottom: [number, number] = [x + (level - bl) / (br - bl || 1e-6), y + 1];
      const left: [number, number] = [x, y + (level - tl) / (bl - tl || 1e-6)];

      const push = (a: [number, number], b: [number, number]) =>
        segments.push([a[0], a[1], b[0], b[1]]);

      switch (code) {
        case 1:
        case 14:
          push(left, bottom);
          break;
        case 2:
        case 13:
          push(bottom, right);
          break;
        case 3:
        case 12:
          push(left, right);
          break;
        case 4:
        case 11:
          push(top, right);
          break;
        case 5:
          push(top, left);
          push(bottom, right);
          break;
        case 6:
        case 9:
          push(top, bottom);
          break;
        case 7:
        case 8:
          push(top, left);
          break;
        case 10:
          push(top, right);
          push(left, bottom);
          break;
      }
    }
  }

  // Stitch into rings. Marching squares segments are not consistently oriented,
  // so walk links by endpoint adjacency in either direction.
  const key = (x: number, y: number) => `${Math.round(x * 64)}:${Math.round(y * 64)}`;
  const links = new Map<string, number[]>();
  const endpoints = segments.map(
    (s) => [key(s[0], s[1]), key(s[2], s[3])] as const,
  );
  endpoints.forEach(([a, b], i) => {
    // Only interior junctions are shared; an edge vertex legitimately holds
    // several loose ends, which is what lets corner rings stay open.
    const interior = (k: string) => {
      const [gx, gy] = k.split(":").map(Number);
      return gx > 0 && gy > 0 && gx < (cols - 1) * 64 && gy < (rows - 1) * 64;
    };
    if (interior(a)) (links.get(a) ?? links.set(a, []).get(a)!).push(i);
    if (interior(b)) (links.get(b) ?? links.set(b, []).get(b)!).push(i);
  });

  const rings: string[] = [];
  const used = new Set<number>();

  for (let start = 0; start < segments.length; start += 1) {
    if (used.has(start)) continue;
    used.add(start);
    const seg = segments[start];
    const ring: [number, number][] = [
      [seg[0], seg[1]],
      [seg[2], seg[3]],
    ];

    for (;;) {
      const tail = ring[ring.length - 1];
      const tailKey = key(tail[0], tail[1]);
      const next = (links.get(tailKey) ?? []).find((i) => !used.has(i));
      if (next === undefined) break;

      used.add(next);
      const [a, b, c, d2] = segments[next];
      // append whichever end actually touches the tail we are extending from
      const joinsStart = key(a, b) === tailKey;
      ring.push(joinsStart ? [c, d2] : [a, b]);

      if (ring.length > 8000) break;
      const head = ring[0];
      const last = ring[ring.length - 1];
      if (Math.abs(head[0] - last[0]) < 1e-6 && Math.abs(head[1] - last[1]) < 1e-6) break;
    }

    if (ring.length < 20) continue;
    const head = ring[0];
    const last = ring[ring.length - 1];
    const closed = Math.abs(head[0] - last[0]) < 1e-6 && Math.abs(head[1] - last[1]) < 1e-6;
    if (!closed) continue;

    // smooth the polyline, then emit as a quadratic curve chain
    const pts = ring.slice(0, -1);
    const n = pts.length;
    const smoothPts: [number, number][] = pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n];
      const b = pts[(i + 1) % n];
      return [(a[0] + 2 * p[0] + b[0]) / 4, (a[1] + 2 * p[1] + b[1]) / 4];
    });

    // Emit with smooth shorthands: the chain is continuous, so alternating
    // T (reflected control) with an explicit Q halves the number of coordinates
    // — and the reflected control is exactly what the previous Q implies.
    const f = (n: number) => {
      const r = Math.round(n * 10) / 10;
      return Number.isInteger(r) ? String(r) : r.toFixed(1);
    };
    const mid = (a: [number, number], b: [number, number]) =>
      [((a[0] + b[0]) / 2) * sx, ((a[1] + b[1]) / 2) * sy] as [number, number];

    let d = `M${f(smoothPts[0][0] * sx)} ${f(smoothPts[0][1] * sy)}`;
    for (let i = 0; i < n; i += 1) {
      const cur = smoothPts[i];
      const nxt = smoothPts[(i + 1) % n];
      const m = mid(cur, nxt);
      // even index: explicit control + endpoint; odd index: implied control + endpoint
      d +=
        i % 2 === 0
          ? `Q${f(cur[0] * sx)} ${f(cur[1] * sy)} ${f(m[0])} ${f(m[1])}`
          : `T${f(m[0])} ${f(m[1])}`;
    }
    d += "Z";
    rings.push(d);
  }

  return rings;
}

export type ContourField = {
  viewBox: string;
  rings: ContourRing[];
  /** ring indexes carrying a travelling packet */
  packets: number[];
  width: number;
  height: number;
};

/**
 * Builds the field. `cols`/`rows` deliberately coarse — the smoothing pass does
 * the work, and a coarse lattice is what makes the contours read as geography
 * rather than as noise.
 */
export function buildContours(
  width: number,
  height: number,
  cols: number,
  rows: number,
  levels: { level: number; step: number }[],
): ContourField {
  const field = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      field[y * cols + x] = fbm(x * 0.13, y * 0.13);
    }
  }

  const sx = width / (cols - 1);
  const sy = height / (rows - 1);

  const rings: ContourRing[] = [];
  for (const { level, step } of levels) {
    const found = contour(field, cols, rows, level, sx, sy);
    for (let i = 0; i < found.length; i += step) {
      rings.push({ d: found[i], level });
    }
  }

  // packets ride the largest rings — the ones a change would plausibly cross
  const byLength = rings
    .map((r, i) => ({ i, len: r.d.length }))
    .sort((a, b) => b.len - a.len)
    .slice(0, 6)
    .map((r) => r.i);

  return {
    viewBox: `0 0 ${width} ${height}`,
    rings,
    packets: byLength,
    width,
    height,
  };
}
