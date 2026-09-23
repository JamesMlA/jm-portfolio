# Portfolio — design context

The design language of jamesmaradiaga.dev. This glossary pins down the fuzzy
words used in the redesign so "make it better" has an unambiguous meaning.

## Language

**Design success**:
A visitor leaves believing James has both serious taste and serious engineering
depth — visual impact lands first, proof sits immediately behind it.
_Avoid_: "wow factor" (impact without proof), "clean" (proof without impact)

**Reference** (the look):
stevenmengin.com — its layout, pacing and typography, adapted to James's career
and work, in James's own colors. It is the visual benchmark: when a design call
is ambiguous, the reference wins.
_Avoid_: "Apple-style" (was read as a product-page clone — wrong), "mission
console" (rejected as too techy/cliché)

**James's colors**:
The warm dark stage and cream of the original site with the mint-green
signature (#15120d / #f3eee3 / #4fe3a1). Fixed identity — layout and motion
change, palette does not.
_Avoid_: recolor-only reskins ("same page with another color")

**Apple transitions** (the motion bar):
The quality level of motion: word-by-word text reveals, settle-on-scroll media,
view-transition crossfades, spring presses. Refers to craft, not to Apple's
layout or chrome.
_Avoid_: copying Apple's product-page structure

**Renders**:
Generated visual art on the page — build-time raster posters and rendered
graphics — as content-supporting imagery.
_Avoid_: screenshots, stock photos

**Work spine**:
The home page: name header, then the case studies as the page — huge render
blocks with sparse text anchors between them. No other sections live here.
_Avoid_: "landing page", "hero + sections"

**Info page**:
The single secondary page carrying everything that is not work: about,
experience, skills, thinking, GitHub, contact.
_Avoid_: "about page" (it holds more than about), "resume"

**Case study**:
One of the five work entries — the unit of the work spine. Each has an anchor
(title + label) and a proof column; the story between them is rendered media and
short factual detail.

**Anchor**:
The sparse text marker of a case study on the work spine: tiny domain label
above, huge light title at the far-left margin. Quiet and small — media
dominates, text anchors.
_Avoid_: headers, cards, section titles

**Proof column**:
The narrow right-hand column beside an anchor: stack tags, real links
(repository, writing) where they exist, and one outcome line. Facts only.
_Avoid_: badges, skill meters, invented metrics

**Render panel**:
A full-bleed generated artwork on the work spine — three per case study, each
with its own motif, seeded and build-time, in James's colors. It is the imagery
of the page. The first plate carries a title card (domain, title, index); the
others carry a small stamp with the study's identity — no internal vocabulary
(landscape/macro/field are code names only, never shown).
_Avoid_: screenshots, stock photos, decorative clip art, named "views"

**Detail strip**:
A narrow left-aligned band of small grey text between render panels: tiny
labels (Problem, Approach, Outcome, Scope) with short factual values. The proof
that lands immediately after the impact.
_Avoid_: essays, marketing copy, badges

**Type**:
Instrument Serif for display (name, huge light case-study titles), Instrument
Sans for body, JetBrains Mono for micro-labels (8px, tracked). Titles are light
(~400) — never bold.
_Avoid_: bold display weights, generic system fonts, all-caps titles

## Example dialogue

> **James**: "It looks the same with another color."
> **Dev**: "Right — palette was never the problem. The Reference defines the
> layout and pacing; James's colors only dress it. What you rejected twice was
> *shape*, so the next build changes shape first."
> **James**: "And keep the Apple transitions."
> **Dev**: "Yes — Apple transitions is the motion bar, not the layout. The
> Reference's composition, your colors, that motion quality."
