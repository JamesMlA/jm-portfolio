# 0001. Home is a work spine only

Date: 2026-09-22
Status: Accepted

## Context

Three redesign attempts failed because the page kept a text-forward
"hero + sections" shape. The chosen visual reference (stevenmengin.com) is
media-dominant: the home page is only the work, with sparse text anchors, and
everything else lives on a separate page. There was a real trade-off between
that shape and keeping the familiar single-page portfolio with all sections.

## Decision

The home page (`/`) is a **work spine**: name header, then the five case
studies as full-bleed render blocks with anchors and proof columns. All other
content (about, experience, skills, thinking, GitHub, contact) lives on a
single **Info page** (`/info`), reachable from the bar and footer.

## Consequences

- A visitor's first screen is always the work — visual impact lands first,
  proof strips sit immediately behind it (see CONTEXT.md "Design success").
- Resume-style scanning needs one extra navigation step; the footer and the
  Info page carry those links for anyone who wants them.
- Machine-readable artifacts are unchanged: `/index.md` still mirrors every
  section from the same content modules (AgentReady AR-READ-09).
