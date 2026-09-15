# jamesmaradiaga.dev

Personal engineering portfolio — Lead DevOps Engineer, cloud infrastructure, SRE, MLOps.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript**, strict
- **Tailwind CSS v4** — design tokens declared in `@theme` inside `src/app/globals.css`
- **lucide-react** icons; brand glyphs (GitHub, LinkedIn) inlined in `src/components/brand-icons.tsx`
- **Contour-field backgrounds** generated at build time (`src/lib/contours.ts` + `src/components/terrain-field.tsx`) — value noise + marching squares, emitted as static SVG
- No animation library: the motion that exists is CSS + SVG (opt-in via a `.motion-only` guard) so `prefers-reduced-motion` neutralizes it without JS.

## Commands

```bash
npm run dev      # local dev
npm run build    # production build (static)
npm start        # serve the build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Structure

```
src/
  app/
    layout.tsx          # fonts, metadata, JSON-LD, shell
    page.tsx            # section composition (server component)
    opengraph-image.tsx # generated OG card
    robots.ts, sitemap.ts, icon.svg
  components/
    i18n.tsx            # EN/ES store (useSyncExternalStore) + localStorage
    theme.tsx           # dark/light store; boot script prevents flash
    ui.tsx              # Section, SectionHead, Chip, PanelBar, ActionLink…
    topology.tsx        # animated delivery-pipeline diagram
    terrain-field.tsx   # build-time contour map backdrop (shared <use> geometry)
    diagram.tsx         # architecture diagrams for case studies
  content/
    site.ts   # identity, links, section registry (nav + keyboard chords)
    en.ts     # English dictionary (default)
    es.ts     # Spanish dictionary
    data.ts   # experience, skills, projects, principles, GitHub fallbacks
  lib/
    github.ts   # build-time GitHub API fetch with static fallback
    contours.ts # value-noise + marching-squares contour generator
```

## Content rules

Nothing on this site is invented. Experience, technologies and repositories come
from verified public sources; the GitHub section is fetched live from the GitHub
API at build time (revalidated every 12 hours) and degrades to static values if
the API is unavailable. Architectural diagrams are explicitly labelled as
illustrative. If you add a claim, add the source.

## i18n

English loads first and is the SSR language. A stored preference (`jm.lang`) is
applied before paint, and `useI18n()` reads that state back, so switching is
instant with no hydration mismatch. Technology names, acronyms and job titles are
intentionally identical in both languages.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Command menu (also `/`) |
| `g` then `h a e p s g c` | Jump to a section |
| `Esc` | Close any open panel |

Easter eggs: the `200 OK` chip opens a status panel; the terminal's green
traffic-light dot replays a hidden transcript; `↑↑↓↓←→←→BA` sweeps the page.

## Backdrop

The page substrate is a contour map of a synthetic landscape, generated once at
build time and inlined as static SVG — no canvas, no requestAnimationFrame, no
image. Two consequences worth knowing before you touch it:

- Geometry is declared **once** by `<TerrainDefs />` (mounted at the page root)
  and referenced by `<use>` from each `<TerrainField />`. Do not duplicate it.
- The fade is a **CSS** mask, not an SVG `<mask>`. A gradient declared in the
  `<defs>` of a 0x0 SVG has no resolvable user space and silently flattens,
  erasing the field. Keep the fade in `terrainFade` / the `style` prop.
- `--color-terrain` is its own token, separate from the border ramp, so the map
  can be tuned without shifting every hairline in the interface.

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
