"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/utils";

/**
 * Signal field — a self-contained WebGL1 fragment shader on a transparent
 * canvas, used as a decorative layer over the void. No three.js: one fullscreen
 * triangle, one program, no textures, no network.
 *
 * Two variants share the quad: "flow" is domain-warped fbm filaments in
 * phosphor mint; "grid" is a perspective floor with a slow descending scan
 * band, mint into azure. Both write premultiplied alpha, so the layer composites
 * over the page without a framebuffer clear colour leaking through.
 *
 * The loop runs only while the layer is on screen and the tab visible, and
 * `prefers-reduced-motion: reduce` draws exactly one frame at uTime = 0 — the
 * shaders carry their own phase offsets so that static frame reads mid-motion.
 * DPR is clamped to 1.5; context loss pauses cleanly and restore rebuilds.
 */

/* One oversized triangle — covers the viewport with no diagonal seam. */
const QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;

void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FLOW_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float amp = 0.5;
  for (int o = 0; o < 4; o += 1) {
    s += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return s;
}

float fbm3(vec2 p) {
  float s = 0.0;
  float amp = 0.5;
  for (int o = 0; o < 3; o += 1) {
    s += amp * vnoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return s;
}

void main() {
  vec2 uv = vUv * 0.5 + 0.5;
  vec2 p = vec2(uv.x * (uRes.x / max(uRes.y, 1.0)), uv.y) * 2.8;
  float t = uTime * 0.025;

  // flow-field warp: the second pair of fbms bends the sample path
  vec2 w = vec2(fbm3(p + vec2(0.0, t)), fbm3(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 2.6 * w);

  // filaments: thin ribbons along the f = 0.5 level set
  float rid = 1.0 - abs(f * 2.0 - 1.0);
  float fil = pow(smoothstep(0.6, 0.95, rid), 2.0);
  float haze = smoothstep(0.3, 0.9, f);

  vec3 mint = vec3(0.310, 0.890, 0.631);
  float a = fil * 0.3 + haze * 0.05;
  gl_FragColor = vec4(mint * a, a);
}
`;

const GRID_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;

float gridLine(float v, float w) {
  float t = abs(fract(v) - 0.5) * 2.0;
  return smoothstep(1.0 - w, 1.0, t);
}

void main() {
  vec2 uv = vUv * 0.5 + 0.5;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float horizon = 0.66;
  float below = horizon - uv.y;

  // descending scan band (phase offset so t = 0 reads mid-sweep)
  float sd = (uv.y - (1.05 - fract(uTime * 0.03 + 0.44) * 1.2)) / 0.06;
  float scan = exp(-sd * sd);

  vec3 mint = vec3(0.310, 0.890, 0.631);
  vec3 azure = vec3(0.420, 0.655, 0.961);
  vec3 col = mix(mint, azure, scan * 0.7);

  float a = 0.0;
  if (below > 0.002) {
    float z = 0.5 / below;
    float x = (uv.x - 0.5) * aspect * z;
    // lines thicken with depth instead of aliasing to a shimmer
    float w = 0.06 + 0.03 * z;
    float line = max(
      gridLine(x * 0.8, w),
      gridLine(z * 0.8 - uTime * 0.3, w * 0.8) * 0.8
    );
    float fade = smoothstep(0.0, 0.05, below) * (1.0 - smoothstep(1.5, 11.0, z));
    a = line * fade * (0.3 + scan * 0.7) + fade * 0.02;
  }

  // horizon haze, plus the faintest wash inside the scan band
  float hd = (uv.y - horizon) / 0.07;
  a += exp(-hd * hd) * 0.1;
  a += scan * 0.08;

  gl_FragColor = vec4(col * a, a);
}
`;

export function SignalField({
  className,
  variant = "flow",
}: {
  className?: string;
  variant?: "flow" | "grid";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
    });
    // No WebGL: the layer simply never draws. The void is already correct.
    if (!gl) return;

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let uTimeLoc: WebGLUniformLocation | null = null;
    let uResLoc: WebGLUniformLocation | null = null;
    let attrib = -1;
    let raf = 0;
    let running = false;
    let last = 0;
    let time = 0;
    let inView = true;
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const makeShader = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("signal-field shader:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const build = () => {
      const vs = makeShader(gl.VERTEX_SHADER, QUAD_VERT);
      const fs = makeShader(
        gl.FRAGMENT_SHADER,
        variant === "grid" ? GRID_FRAG : FLOW_FRAG,
      );
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, "aPos");
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn("signal-field link:", gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return false;
      }
      program = prog;
      uTimeLoc = gl.getUniformLocation(prog, "uTime");
      uResLoc = gl.getUniformLocation(prog, "uRes");
      attrib = 0;
      gl.useProgram(prog);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(attrib);
      gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0);
      gl.disable(gl.DEPTH_TEST);
      return true;
    };

    const draw = (t: number) => {
      if (!program) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uTimeLoc, t);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = (now: number) => {
      if (!running) return;
      // Clamped dt: a hidden tab resumes the drift where it paused, no jump.
      time += Math.min((now - last) * 0.001, 0.05);
      last = now;
      draw(time);
      raf = window.requestAnimationFrame(frame);
    };

    const update = () => {
      const should = !reduced && inView && !document.hidden;
      if (should && !running) {
        running = true;
        last = performance.now();
        raf = window.requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        window.cancelAnimationFrame(raf);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      if (reduced) draw(0); // the single static frame, re-struck on resize
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        update();
      },
      { rootMargin: "64px" },
    );
    intersection.observe(canvas);

    const onVisibility = () => update();
    document.addEventListener("visibilitychange", onVisibility);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      reduced = mq.matches;
      if (reduced) draw(0);
      update();
    };
    mq.addEventListener("change", onMotion);

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      window.cancelAnimationFrame(raf);
    };
    const onRestored = () => {
      if (!build()) return;
      resize();
      update();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    if (!build()) return;
    resize();
    update();

    return () => {
      running = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      mq.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (program) gl.deleteProgram(program);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, [variant]);

  return (
    <div
      aria-hidden
      className={cx("pointer-events-none absolute inset-0", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
