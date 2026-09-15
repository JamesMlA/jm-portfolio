import { llmsTxt } from "@/lib/agent-docs";

/**
 * /llms.txt — the curated index described in llmstxt.org v2.
 * Text/plain so it renders without a download prompt; the spec only requires
 * the path and the markdown body.
 */
export const revalidate = 43200;

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
