import type { NextConfig } from "next";

/**
 * Discovery headers (AgentReady AR-READ-06 / AR-READ-09).
 *
 * The studies found 86–100% of discovery-file fetches arrive through links
 * rather than guessed paths, so every machine-readable artifact is advertised
 * twice: as an HTTP `Link` header (works for any resource, including the
 * markdown mirrors themselves) and as an HTML `<link>` in the page head.
 */
const discoveryLink = [
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(", ");

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle for the container image.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "Link", value: discoveryLink }],
      },
      {
        source: "/index.md",
        headers: [
          {
            key: "Link",
            value: '</llms.txt>; rel="describedby"; type="text/plain"',
          },
        ],
      },
      {
        // The mirror is served for both the extension and the suffix form.
        source: "/index.html.md",
        headers: [{ key: "Link", value: discoveryLink }],
      },
    ];
  },
};

export default nextConfig;
