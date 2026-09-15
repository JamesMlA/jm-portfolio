import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * Crawl policy — AgentReady AR-FIND-01/03.
 *
 * One rule for all agents rather than an allowlist of named crawlers: the
 * wildcard covers current *and* future agents, and a named group would override
 * it. Nothing here is an exclusion, because nothing on this site is private.
 *
 * If training opt-out is ever wanted, it belongs in its own `User-agent: GPTBot`
 * / `ClaudeBot` group — that keeps search indexes and user-initiated fetchers
 * (ChatGPT-User, Claude-User) working while opting out of training only.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
