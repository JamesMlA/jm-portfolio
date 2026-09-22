"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sampleNoise } from "@/lib/contours";
import { cx } from "@/lib/utils";

/**
 * Mission-control landscape — terrain, radar, dust, drawn behind the hero type.
 *
 * Everything here is decorative and deterministic: the heightfield comes from
 * the same value noise that contours the SVG map (sampleNoise), particles ride
 * a fixed-seed PRNG, and the camera framing is a constant. Colours are the
 * globals.css tokens written as literal sRGB components because custom
 * three.js shaders bypass colour management — what the shader writes is what
 * the display shows.
 *
 * The loop is frugal by construction: one useFrame drives every uniform and
 * the camera, geometry is built once and disposed on unmount, and
 * `prefers-reduced-motion` collapses to a single frame at t=0 — which is also
 * the deterministic composition every load shares.
 */

const MINT = new THREE.Vector3(0.3098, 0.8902, 0.6314); // #4fe3a1
const VOID = new THREE.Vector3(0.0196, 0.0314, 0.0392); // #05080a
const TERRAIN = new THREE.Vector3(0.2392, 0.3608, 0.4); // #3d5c66
const GRID = new THREE.Vector3(0.4824, 0.6941, 0.7686); // rgb(123 177 196)

/** Low oblique 3/4 vantage (~28° elevation) — perspective must read as depth.
 *  Aimed below-left of the dish so the instruments compose into the hero's
 *  visible corridor (upper band and column gap) where the type leaves room. */
const CAM_POS = new THREE.Vector3(5.4, 4.6, 6.6);
const CAM_TARGET = new THREE.Vector3(-1.2, -0.5, 0.3);

const TERRAIN_W = 16;
const TERRAIN_H = 9;
const TERRAIN_SEG_X = 128;
const TERRAIN_SEG_Y = 72;
const HEIGHT_AMP = 1.8;
/** sampleNoise (4-octave fbm) spans [0, 0.9375); centre and normalise by it. */
const NOISE_MID = 0.46875;
const NOISE_SPAN = 0.9375;

const DUST_COUNT = 300;
/** Wrap height of the dust column; must match the mod() in DUST_VERT. */
const DUST_TOP = 6.5;

const RADAR_RADIUS = 2.8;
const RADAR_Y = 2.2;

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smooth01 = (t: number) => t * t * (3 - 2 * t);

function terrainHeight(x: number, y: number): number {
  // The rim sinks to zero so the plate reads as a landmass, not a cut slab.
  const ex = smooth01(clamp01(1 - (x / (TERRAIN_W / 2)) ** 6));
  const ey = smooth01(clamp01(1 - (y / (TERRAIN_H / 2)) ** 6));
  const h =
    ((sampleNoise(x * 0.16 + 3.1, y * 0.16 + 7.7) - NOISE_MID) *
      (2 * HEIGHT_AMP)) /
    NOISE_SPAN;
  return h * ex * ey;
}

function buildTerrain(): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(
    TERRAIN_W,
    TERRAIN_H,
    TERRAIN_SEG_X,
    TERRAIN_SEG_Y,
  );
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    pos.setZ(i, terrainHeight(pos.getX(i), pos.getY(i)));
  }
  pos.needsUpdate = true;
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/** mulberry32 — small, fast, fixed-seed; composition is identical every load. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDust(): THREE.BufferGeometry {
  const rand = mulberry32(0x9e3779b9);
  const pos = new Float32Array(DUST_COUNT * 3);
  const speed = new Float32Array(DUST_COUNT);
  const size = new Float32Array(DUST_COUNT);
  const phase = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i += 1) {
    pos[i * 3] = (rand() - 0.5) * 19;
    pos[i * 3 + 1] = rand() * DUST_TOP;
    pos[i * 3 + 2] = (rand() - 0.5) * 12;
    speed[i] = 0.08 + rand() * 0.14;
    size[i] = 2.8 + rand() * 3.0;
    phase[i] = rand() * 6.2831853;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  return geo;
}

/* ------------------------------------------------------------------ *
 * Shaders — GLSL1, three.js built-in attributes and matrices only.
 * ------------------------------------------------------------------ */

const TERRAIN_VERT = `
varying float vH;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;

void main() {
  vH = position.y;
  vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
  vN = normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const TERRAIN_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float uTime;
uniform float uHeightNorm;
uniform vec3 uMint;
uniform vec3 uVoid;
uniform vec3 uTerrain;
uniform vec3 uGrid;
uniform vec3 uFog;
uniform vec3 uLight;
uniform vec2 uFogRange;

varying float vH;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;

/** Thin luminous line at every integer crossing of v, width w in lattice units. */
float band(float v, float w) {
  float t = abs(fract(v) - 0.5) * 2.0;
  return smoothstep(1.0 - w, 1.0, t);
}

void main() {
  float hn = vH * uHeightNorm + 0.5;
  float lam = clamp(dot(normalize(vN), uLight), 0.0, 1.0);

  // relief-shaded ground: shadow side sinks to void, lit heights lift to teal
  vec3 col = mix(uVoid, uTerrain, smoothstep(0.15, 1.0, hn) * 0.6);
  col *= 0.38 + 1.3 * lam;

  // Contour bands at fixed height intervals — classic isolines. Widths track
  // depth so a core stays ~2px and its halo ~4px at every distance.
  float minor = hn * 11.0 + uTime * 0.02;
  float major = hn * 5.0 + uTime * 0.02;
  float wMinor = clamp(0.0095 * vDepth, 0.04, 0.3);
  float wMajor = clamp(0.003 * vDepth, 0.01, 0.12);
  float haloMinor = clamp(0.019 * vDepth, 0.07, 0.45);
  float haloMajor = clamp(0.0065 * vDepth, 0.02, 0.2);
  col = mix(col, uMint, band(minor, haloMinor) * 0.08 + band(major, haloMajor) * 0.12);
  col = mix(
    col,
    uMint * 1.3,
    band(minor, wMinor) * (0.5 + 0.3 * hn) +
      band(major, wMajor) * (0.8 + 0.35 * hn)
  );

  // engineering wire grid draped over the relief, drifting with the world
  float wWire = clamp(0.007 * vDepth, 0.02, 0.2);
  float wire = max(
    band(vWorld.x * 0.667 + uTime * 0.012, wWire),
    band(vWorld.z * 0.667, wWire)
  );
  col = mix(col, uGrid, wire * 0.34);

  // subtle fog toward the void
  col = mix(col, uFog, smoothstep(uFogRange.x, uFogRange.y, vDepth) * 0.85);

  // dissolve the plate rim into the void — a quad edge must never read as a
  // cut slab, so bands, wire and tint all fade before the boundary
  vec2 rim = abs(vWorld.xz) / vec2(8.0, 4.5);
  float edge = 1.0 - smoothstep(0.82, 1.0, max(rim.x, rim.y));
  col = mix(uVoid, col, edge);

  gl_FragColor = vec4(col, 1.0);
}
`;

const RADAR_VERT = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RADAR_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float uTime;
uniform vec3 uMint;

varying vec2 vUv;

float ring(float v, float w) {
  float t = abs(fract(v) - 0.5) * 2.0;
  return smoothstep(1.0 - w, 1.0, t);
}

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float ang = atan(p.y, p.x) * 0.15915494 + 0.5;
  float sweep = fract(ang - uTime * 0.125);
  float arm = pow(1.0 - sweep, 6.0) * 0.95;
  float lead = 1.0 - smoothstep(0.0, 0.01, min(sweep, 1.0 - sweep));
  float radial = 1.0 - smoothstep(0.2, 1.0, r);

  // range rings at r = 0.25 / 0.5 / 0.75, outer rim as the scope boundary
  float rings = ring(r * 4.0, 0.04);
  float rim = 1.0 - smoothstep(0.0, 0.03, abs(r - 0.97));

  // origin marker: centre pip plus short crosshair arms
  float pip = 1.0 - smoothstep(0.0, 0.045, r);
  float arms = max(
    1.0 - smoothstep(0.0, 0.009, abs(p.y)),
    1.0 - smoothstep(0.0, 0.009, abs(p.x))
  );
  arms *= smoothstep(0.05, 0.06, r) * (1.0 - smoothstep(0.13, 0.17, r));

  float a = arm * radial * 1.0
    + lead * radial * 0.95
    + radial * 0.08
    + rings * 0.85
    + rim * 1.0
    + pip * 1.2
    + arms * 1.1;
  gl_FragColor = vec4(uMint, min(a, 1.0));
}
`;

const DUST_VERT = `
uniform float uTime;
uniform float uDpr;
attribute float aSpeed;
attribute float aSize;
attribute float aPhase;
varying float vA;

void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * aSpeed, 6.5);
  p.x += sin(uTime * 0.05 + aPhase) * 0.2;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uDpr * (9.0 / max(-mv.z, 0.5));
  vA = 0.55 + 0.45 * fract(aPhase * 3.7);
}
`;

const DUST_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 uMint;
varying float vA;

void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  float a = (1.0 - smoothstep(0.25, 1.0, d)) * vA;
  gl_FragColor = vec4(uMint, a);
}
`;

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

type Kit = {
  terrainGeometry: THREE.PlaneGeometry;
  terrainMaterial: THREE.ShaderMaterial;
  radarGeometry: THREE.CircleGeometry;
  radarMaterial: THREE.ShaderMaterial;
  dustGeometry: THREE.BufferGeometry;
  dustMaterial: THREE.ShaderMaterial;
};

function buildKit(): Kit {
  // One uniforms block shared by all three programs — each uploads only the
  // entries it declares, and time advances once per frame for the whole scene.
  const uniforms = {
    uTime: { value: 0 },
    uDpr: { value: 1 },
    uHeightNorm: { value: 1 / (2 * HEIGHT_AMP) },
    uMint: { value: MINT },
    uVoid: { value: VOID },
    uTerrain: { value: TERRAIN },
    uGrid: { value: GRID },
    uFog: { value: VOID },
    uLight: { value: new THREE.Vector3(-0.55, 0.75, 0.35).normalize() },
    uFogRange: { value: new THREE.Vector2(14, 34) },
  };

  return {
    terrainGeometry: buildTerrain(),
    terrainMaterial: new THREE.ShaderMaterial({
      uniforms,
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
    }),
    radarGeometry: new THREE.CircleGeometry(RADAR_RADIUS, 96),
    radarMaterial: new THREE.ShaderMaterial({
      uniforms,
      vertexShader: RADAR_VERT,
      fragmentShader: RADAR_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    }),
    dustGeometry: buildDust(),
    dustMaterial: new THREE.ShaderMaterial({
      uniforms,
      vertexShader: DUST_VERT,
      fragmentShader: DUST_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  };
}

/**
 * The live scene toolbox. Opaque to React on purpose: three.js objects are
 * imperative handles the render loop writes into (uniforms) while the mesh JSX
 * reads them — resource lifetime, not derived state.
 */
function useKit(): Kit {
  const kit = useMemo(() => buildKit(), []);
  useEffect(
    () => () => {
      kit.terrainGeometry.dispose();
      kit.terrainMaterial.dispose();
      kit.radarGeometry.dispose();
      kit.radarMaterial.dispose();
      kit.dustGeometry.dispose();
      kit.dustMaterial.dispose();
    },
    [kit],
  );
  return kit;
}

function Scene({ reduced }: { reduced: boolean }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const dpr = useThree((s) => s.viewport.dpr);
  const kit = useKit();
  // Writable alias for the loop: React treats render-derived values as
  // read-only, so the uniform writes below go through the ref handle.
  const kitRef = useRef(kit);

  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    kitRef.current.terrainMaterial.uniforms.uDpr.value = dpr;
    kitRef.current.dustMaterial.uniforms.uDpr.value = dpr;
  }, [dpr]);

  // Pointer parallax — window-level so overlaid type can keep every event.
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = 1 - (e.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  // Canonical framing; under reduced motion this effect renders the one frame.
  useEffect(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);
    if (reduced) invalidate();
  }, [camera, invalidate, reduced]);

  useFrame((state, delta) => {
    if (reduced) return;
    // Accumulated, clamped time: a hidden tab resumes where it left off.
    timeRef.current += Math.min(delta, 0.05);
    const t = timeRef.current;
    kitRef.current.terrainMaterial.uniforms.uTime.value = t;
    kitRef.current.radarMaterial.uniforms.uTime.value = t;
    kitRef.current.dustMaterial.uniforms.uTime.value = t;

    smooth.current.x += (pointer.current.x - smooth.current.x) * 0.06;
    smooth.current.y += (pointer.current.y - smooth.current.y) * 0.06;

    state.camera.position.set(
      CAM_POS.x + Math.sin(t * 0.05) * 0.7 + smooth.current.x * 0.75,
      CAM_POS.y + Math.sin(t * 0.037) * 0.4 + smooth.current.y * 0.5,
      CAM_POS.z + Math.cos(t * 0.043) * 0.6,
    );
    state.camera.lookAt(CAM_TARGET);
  });

  return (
    <>
      <mesh geometry={kit.terrainGeometry} material={kit.terrainMaterial} />
      <mesh
        geometry={kit.radarGeometry}
        material={kit.radarMaterial}
        position={[0.3, RADAR_Y, -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <points
        geometry={kit.dustGeometry}
        material={kit.dustMaterial}
        position={[0, -0.5, 0]}
      />
    </>
  );
}

export function HeroScene({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hidden, setHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  // Mount values come from the lazy initializers above; this only listens.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReduced(mq.matches);
    mq.addEventListener("change", onMotion);

    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mq.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className={cx("absolute inset-0", className)}>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, depth: true, stencil: false }}
        camera={{
          fov: 50,
          near: 0.5,
          far: 48,
          position: [CAM_POS.x, CAM_POS.y, CAM_POS.z],
        }}
        frameloop={reduced ? "demand" : hidden ? "never" : "always"}
        style={{ pointerEvents: "none" }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
