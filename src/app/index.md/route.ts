import { portfolioMarkdown } from "@/lib/agent-docs";

/**
 * /index.md — the markdown mirror of the homepage, advertised from the page
 * head via <link rel="alternate" type="text/markdown">.
 *
 * Agents requested markdown on ~65% of fetches in the AgentReady studies, so
 * this is the highest-value single artifact on the site for them.
 */
export const revalidate = 43200;

export function GET() {
  const body = portfolioMarkdown();
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control": "public, max-age=0, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
