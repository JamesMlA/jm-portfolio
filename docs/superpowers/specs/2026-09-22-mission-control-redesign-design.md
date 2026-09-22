# Mission Control — portfolio redesign

Date: 2026-09-22
Status: direction locked via design Q&A (dark mission control · maximal rendering · rebuild in place)

## Goal

Recreate the jamesmaradiaga.dev portfolio with a stronger visual identity, real
motion choreography, and rendered visuals. "Renders" = all three layers:
WebGL scenes, shader fields, and generated raster art.

## Decisions

- **Aesthetic**: dark mission control — cinematic blue-black void, phosphor-mint
  signal, amber instrumentation. The light "offset print" theme is removed
  (dark-only cutover).
- **Rendering**: maximal — WebGL hero scene, shader signal-field behind mid-page,
  seeded raster posters per project + restyled OG card.
- **Scope**: rebuild in place. Content modules and infra stay; components are
  rewritten against a new design system.
- **Keep-list note**: the feature keep-list came back empty against a scope pick
  that names content modules, i18n, GitHub fetch and agent-docs. Resolution:
  the data/infra layer survives (reversible); interactive extras go.

Kept: `src/content/*` (EN/ES), `lib/github.ts`, `lib/agent-docs.ts`,
`lib/structured-data.ts`, `lib/utils.ts`, `lib/contours.ts`, routes
(`/llms.txt`, `/index.md`, robots, sitemap), `scripts/agent-check.py`.

Dropped: command palette (⌘K, `/`), `g`-chords, Konami, hidden transcript,
status-panel easter egg, shortcut hints, theme toggle + light CSS, SVG
`TerrainField`/`TerrainDefs` (superseded by the 3D terrain and shader field),
Toaster (loses all consumers), dead i18n keys.

## Design language

- **Palette**: existing dark token ramp (WCAG AA-verified) — `void` #05080a,
  `signal` mint #4fe3a1, amber #f0b45f, azure #6ba7f5. Add glow/atmosphere
  tokens; do not shift the text ramp.
- **Type**: existing trio, pushed harder — Bricolage Grotesque display (wide
  `wdth` axis, huge scale), Instrument Sans body, JetBrains Mono instrumentation
  micro-labels (uppercase, tracked).
- **Motifs**: hairline engineering grid, corner ticks, grain, scanline sheen,
  phosphor glow rims, section index numerals (`01 … 07`).
- **Motion**: boot-sequence stagger on load; scroll reveals; scroll-driven draws
  (experience spine, topology packets); hover glow rims and CTA magnetism.
  `prefers-reduced-motion` neutralizes everything; `.reveal` start states stay
  gated behind `@media (scripting: enabled)` (AgentReady AR-READ-01).

## Rendered layers

1. **Hero WebGL scene** — `components/render/hero-scene.tsx`, client-only R3F:
   synthetic terrain heightfield built from the existing `lib/contours.ts`
   value-noise (the flat contour map becomes terrain), radar sweep, particle
   dust, slow camera drift + pointer parallax. Decorative (`aria-hidden`).
2. **Signal field** — `components/render/signal-field.tsx`, client-only raw
   WebGL fullscreen quad (fbm flow shader), section-scoped backdrop variant
   `flow`/`grid`. Decorative.
3. **Raster posters** — `scripts/generate-renders.mjs` (seeded, deterministic,
   text-free SVG → PNG via `@resvg/resvg-js`, run by `prebuild`) writes
   `public/renders/<project.id>.png` (1600×1000) for the five case studies.
   OG card restyled to the same language.

## Contracts

- `HeroScene({ className })` / `SignalField({ className, variant })`: fill the
  positioned parent, own their canvas sizing, static single frame under
  reduced motion, no layout shift, no network.
- Canvases load via `next/dynamic({ ssr: false })` from client components
  (Next 16 rule) after first paint; content renders as plain HTML regardless.
- Posters are decorative: `aria-hidden`, `alt=""`, `loading="lazy"`.
- Content rule (README) holds: no invented claims; decorative art carries no
  factual assertions.

## Verification

`npx tsc --noEmit` · `npm run lint` · `npm run build` ·
`python3 scripts/agent-check.py` · browser pass (hero scene, scroll motion,
EN/ES, reduced-motion) · `curl -s localhost:3000/index.md` unchanged content.

## Out of scope

New content or claims, blog, CMS, light theme return, SEO changes beyond the
visual OG card.
