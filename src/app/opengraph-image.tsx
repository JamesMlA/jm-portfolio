import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "James Maradiaga — Lead DevOps Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Static OG card — dark, monospaced, one grid, one accent. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#05080a",
          backgroundImage:
            "linear-gradient(to right, rgba(21,34,41,0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(21,34,41,0.65) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          color: "#e3ecef",
          padding: "72px 80px",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#4fe3a1",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 22, color: "#8ea3ad", letterSpacing: 2 }}>
            status: 200 OK · gt-central-1
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div style={{ fontSize: 30, color: "#4fe3a1", letterSpacing: 1 }}>
            james maradiaga
          </div>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.05,
              marginTop: 24,
              letterSpacing: -2,
              maxWidth: 900,
              color: "#e3ecef",
              display: "flex",
            }}
          >
            Building reliable infrastructure for software that matters.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
              fontSize: 24,
              color: "#8ea3ad",
            }}
          >
            Lead DevOps Engineer · Cloud · Kubernetes · SRE · MLOps · Python
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid #152229",
            fontSize: 22,
            color: "#5b6c76",
          }}
        >
          <span>{site.url.replace("https://", "")}</span>
          <span style={{ marginLeft: "auto", color: "#4fe3a1" }}>
            terraform plan → kubectl rollout → 200 OK
          </span>
        </div>
      </div>
    ),
    size,
  );
}
