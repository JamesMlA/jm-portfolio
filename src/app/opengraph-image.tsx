import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Palette mirrored from src/app/globals.css (`@theme`). No webfonts: the card
 * rasterizes with the generic system-sans stack — font-free rendering keeps
 * this file safe under `output: "standalone"`. */
const PAPER = "#f5f5f7";
const INK = "#1d1d1f";
const SOFT = "#6e6e73";

const SANS =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Static OG card — Apple product launch: paper, one name, one soft glow. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: PAPER,
          color: INK,
          fontFamily: SANS,
        }}
      >
        {/* One soft sky-blue glow, behind the name. */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: 100,
            width: 1000,
            height: 760,
            backgroundImage:
              "radial-gradient(circle, rgba(0,113,227,0.16) 0%, rgba(0,113,227,0.05) 45%, rgba(245,245,247,0) 72%)",
          }}
        />

        {/* Identity — values from src/content/site.ts only. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: SOFT,
              letterSpacing: -0.3,
            }}
          >
            {site.role}
          </div>
        </div>

        {/* Origin — small, at the bottom. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 44,
            fontSize: 20,
            color: SOFT,
          }}
        >
          {new URL(site.url).host}
        </div>
      </div>
    ),
    size,
  );
}
