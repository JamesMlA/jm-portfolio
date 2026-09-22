# jamesmaradiaga.dev

Personal engineering portfolio — Lead DevOps Engineer, cloud infrastructure, SRE, MLOps.
Redesigned as **Mission Control**: dark void, phosphor-mint signal, instrument
panels, and real rendered motion.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript**, strict
- **Tailwind CSS v4** — design tokens declared in `@theme` inside `src/app/globals.css`
- **lucide-react** icons; brand glyphs (GitHub, LinkedIn) inlined in `src/components/brand-icons.tsx`
- **Rendered layers** (the three meanings of "render" on this site):
  - **WebGL hero scene** — `src/components/render/hero-scene.tsx` (three.js +
    `@react-three/fiber`): terrain heightfield sampled from the value-noise in
    `src/lib/contours.ts`, luminous contour bands, radar sweep, particle dust,
    drifting camera with pointer parallax
  - **Shader signal field** — `src/components/render/signal-field.tsx`, a
    self-contained raw WebGL1 fullscreen quad (`flow`/`grid` variants) behind
    the skills section
  - **Generated raster posters** — `scripts/generate-renders.mjs` builds one
    deterministic, text-free poster per case study (`public/renders/<id>.png`,
    1600×1000, seeded SVG → PNG via `@resvg/resvg-js`); run by `prebuild`
- **Motion**: CSS + SVG for entrances and instrument animation (`motion` for
  the scroll-drawn experience spine). Everything honors
  `prefers-reduced-motion`; canvases render exactly one static frame.

## Commands

```bash
npm run dev      # local dev
npm run build    # production build (static), regenerates posters first
npm run renders  # regenerate public/renders/*.png (deterministic)
npm start        # serve the build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Structure

```
src/
  app/
    layout.tsx          # fonts, metadata, shell (dark-only)
    page.tsx            # section composition (server component)
    opengraph-image.tsx # generated OG card
    robots.ts, sitemap.ts, icon.svg
  components/
    i18n.tsx            # EN/ES store (useSyncExternalStore) + localStorage
    ui.tsx              # Section, SectionHead, Chip, PanelBar, ActionLink…
    nav.tsx             # fixed console bar + scroll telemetry hairline
    hero.tsx            # identity + statement over the WebGL terrain
    hero-terminal.tsx   # typed "mission log" (labelled visual story)
    topology.tsx        # animated delivery-pipeline schematic
    diagram.tsx         # architecture schematics for case studies
    render/
      hero-scene.tsx    # R3F terrain + radar + dust (client-only, lazy)
      signal-field.tsx  # raw WebGL shader field (client-only)
    experience.tsx      # timeline with scroll-drawn spine
    projects.tsx        # case-study rows + poster plates + dossier modal
    skills.tsx          # subsystem panels over the signal field
    about.tsx, thinking.tsx, github-section.tsx, contact.tsx, footer.tsx
  content/
    site.ts   # identity, links, section registry
    en.ts     # English dictionary (default)
    es.ts     # Spanish dictionary
    data.ts   # experience, skills, projects, principles, GitHub fallbacks
  lib/
    github.ts   # build-time GitHub API fetch with static fallback
    contours.ts # value noise (contour generator + hero heightfield sampler)
    agent-docs.ts, structured-data.ts, utils.ts
scripts/
  generate-renders.mjs  # seeded poster generator (prebuild)
  agent-check.py        # AgentReady conformance check
```

## Content rules

Nothing on this site is invented. Experience, technologies and repositories come
from verified public sources; the GitHub section is fetched live from the GitHub
API at build time (revalidated every 12 hours) and degrades to static values if
the API is unavailable. Decorative renders (hero scene, posters, shader field)
carry no factual claims and are `aria-hidden`; architectural diagrams are
explicitly labelled as illustrative. If you add a claim, add the source.

## i18n

English loads first and is the SSR language. A stored preference (`jm.lang`) is
applied before paint, and `useI18n()` reads that state back, so switching is
instant with no hydration mismatch. Technology names, acronyms and job titles are
intentionally identical in both languages. The interface is dark-only (the light
theme and its toggle were removed in the Mission Control redesign).

## Motion and accessibility

- Scroll entrances use the `Reveal` primitive; hidden start states are gated
  behind `@media (scripting: enabled)` so fetch-only readers (agents, text
  browsers, JS off) always receive the content (AgentReady AR-READ-01). Verify
  no-JS views after changing it.
- `prefers-reduced-motion: reduce` neutralizes every animation and pins both
  canvases to a single static frame — which is also the deterministic
  composition every load shares.
- Canvases mount after first paint (`next/dynamic`, `ssr: false`) and pause when
  the tab is hidden or the layer is off screen.

## Backdrop

The hero's synthetic landscape is rendered, not drawn: `lib/contours.ts` value
noise is sampled into a terrain heightfield with luminous contour bands, a radar
sweep and dust. The flat contour-map SVG (`terrain-field.tsx`) is gone. Two
invariants if you touch the render layer:

- Keep the scene decorative: `aria-hidden`, `pointer-events: none`, no network,
  no layout shift.
- The kit of three.js objects is a mutable resource: JSX reads the `useKit()`
  handle, uniform writes go through the `kitRef` handle (React's compiler rules
  treat render-derived values as read-only). `npm run lint` enforces this.

## Agent readability

The site follows the [AgentReady v1.0](https://agentready.org) requirements
(ora.ai + Vercel, August 2026) and the [llms.txt v2](https://llmstxt.org/)
proposal. Everything below is generated from the same content modules the page
renders from (`src/lib/agent-docs.ts`), so the machine-readable copies cannot
drift from the site.

| Artifact | Path | Purpose |
| --- | --- | --- |
| Content index | `/llms.txt` | Lean, described index of key pages |
| Markdown mirror | `/index.md` | Every section as one markdown document |
| Structured data | homepage `<head>` | schema.org `@graph`: ProfilePage, Person, WebSite, 5 CreativeWork, 7 ItemList |
| Crawl policy | `/robots.txt` | One wildcard rule; sitemap referenced |
| Sitemap | `/sitemap.xml` | Canonical URLs |
| Headers | `/` response | `Link:` — `rel="alternate"` markdown, `rel="describedby"` llms.txt, `rel="sitemap"` |

Design decisions that matter if you touch this:

- **The `@graph` is a graph, not a blob.** Entities carry `@id` and reference each
  other, so the Person is described once instead of duplicated inside every
  project. External references would be superseded by `person`. The markdown and
  `llms.txt` builders guard this too: `factsMarkdown()` is reused rather than
  re-derived.
- **`.reveal` is gated behind `@media (scripting: enabled)`.** Without that, the
  scroll-reveal start state (`opacity: 0`) leaves the entire below-fold page
  invisible to a fetch-only reader — content present in the HTML but
  unrenderable. This was a real defect; verify no-JS views after changing it.
- **Discovery files are linked, not just published.** The studies found 86–100%
  of discovery-file fetches arrive through links rather than guessed paths, so
  every artifact is advertised in the page head, the HTTP `Link` header, and the
  footer's "For agents" block.
- **Accuracy over completeness in structured data.** Claims that could not be
  verified from a public source are omitted rather than asserted.

Verify conformance after any content change:

```bash
python3 scripts/agent-check.py   # 9 applicable AR-* requirements
curl -s http://localhost:3000/index.md | head -40
curl -sIL -A 'Claude-User/1.0' http://localhost:3000/
```

## Environment

Optional `GITHUB_TOKEN` raises the GitHub API rate limit during builds.
