# jamesmaradiaga.dev

Personal engineering portfolio — Lead DevOps Engineer, cloud infrastructure, SRE, MLOps.
Designed as an Apple-style product-launch story: huge type, alternating
white/black stages, big case-study shots, restrained motion.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **TypeScript**, strict
- **Tailwind CSS v4** — design tokens and tone system in `src/app/globals.css`
- **System font stack** (`-apple-system`, SF Pro) — true Apple type on Apple
  devices, zero webfont cost and zero layout shift everywhere else
- **motion** — the settle-on-scroll product-shot effect (`useScroll` +
  `useTransform`), static under `prefers-reduced-motion`
- **@resvg/resvg-js** — `scripts/generate-renders.mjs` builds one deterministic,
  text-free poster per case study (`public/renders/<id>.png`, 1600×1000) and
  the favicon; run by `prebuild`
- **lucide-react** icons; brand glyphs in `src/components/brand-icons.tsx`

## Commands

```bash
npm run dev      # local dev
npm run build    # production build (static), regenerates posters first
npm run renders  # regenerate public/renders/*.png + favicon (deterministic)
npm start        # serve the build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Structure

```
src/
  app/
    layout.tsx          # system-font shell, metadata, dark-bar page
    page.tsx            # story-beat composition (server component)
    opengraph-image.tsx # generated OG card
    robots.ts, sitemap.ts, icon.svg
  components/
    i18n.tsx            # EN/ES store (useSyncExternalStore) + localStorage
    ui.tsx              # Section, Kicker, Headline, Lead, TextLink, Pill,
                        # Tag, SpecRow, Stat, Reveal
    nav.tsx             # 44px frosted bar, tone-aware (dark/light glass)
    hero.tsx            # launch stage: name, headline, links, product shot
    about.tsx           # prose + principles feature grid + now list
    experience.tsx      # career as a tech-spec sheet
    projects.tsx        # case studies as alternating story + poster rows
    skills.tsx          # spec groups: skill name + how it is used
    thinking.tsx        # principles as statement cards
    github-section.tsx  # stats, contribution grid, repo cards
    contact.tsx         # closing CTA + interests
    footer.tsx          # fat footer incl. the "For agents" block
    reveal.tsx          # scroll entrance primitive (AR-READ-01 gated)
    providers.tsx, brand-icons.tsx
  content/
    site.ts   # identity, links, section registry
    en.ts     # English dictionary (default)
    es.ts     # Spanish dictionary
    data.ts   # experience, skills, projects, principles, GitHub fallbacks
  lib/
    github.ts   # build-time GitHub API fetch with static fallback
    agent-docs.ts, structured-data.ts, utils.ts
scripts/
  generate-renders.mjs  # seeded poster + favicon generator (prebuild)
  agent-check.py        # AgentReady conformance check
```

## Design system

Every section is a `Section` with one of three tones (`tone-light` white,
`tone-gray` #f5f5f7, `tone-dark` black) — the tone sets `--text`, `--text-soft`,
`--link` and `--hairline`, so beats alternate like apple.com's long pages. The
global bar reads the tone of the section under it and switches between dark and
light frosted glass. Link blue is #0071e3 (light) / #2997ff (dark). Type is
Apple's scale: tiny colored kicker, huge tight headline (`display-hero`), 21px
soft lead, 17px body, 12px footer.

Imagery is the case-study posters (seeded, text-free, generated at build) treated
as product shots — rounded, shadowed, settling from 1.04× to 1× on scroll.

## Content rules

Nothing on this site is invented. Experience, technologies and repositories come
from verified public sources; the GitHub section is fetched live from the GitHub
API at build time (revalidated every 12 hours) and degrades to static values if
the API is unavailable. Decorative art carries no factual claims and is
`aria-hidden`. If you add a claim, add the source.

## i18n

English loads first and is the SSR language. A stored preference (`jm.lang`) is
applied before paint, and `useI18n()` reads that state back, so switching is
instant with no hydration mismatch. Technology names, acronyms and job titles are
intentionally identical in both languages. Dictionary keys are pruned to exactly
what the surface renders — `es.ts` is type-locked to `en.ts` through `Dictionary`,
so the two cannot drift.

## Motion and accessibility

- Scroll entrances use the `Reveal` primitive; hidden start states are gated
  behind `@media (scripting: enabled)` so fetch-only readers (agents, text
  browsers, JS off) always receive the content (AgentReady AR-READ-01). Verify
  no-JS views after changing it.
- `prefers-reduced-motion: reduce` neutralizes every animation and pins the
  product-shot scroll effect to its rest state.
- The frosted bar keeps 12px links with generous hit areas; text links carry an
  `sr-only` "opens in a new tab" note via `d.a11y.external`.

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
