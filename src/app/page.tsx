import { ViewTransition } from "react";
import { Hero } from "@/components/hero";
import { WorkSpine } from "@/components/work-spine";
import { structuredData } from "@/lib/structured-data";

export const revalidate = 43200;

export default function Home() {
  const jsonLd = structuredData();

  return (
    <>
      <script
        type="application/ld+json"
        // Static, self-authored structured data — no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTransition
        enter={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        exit={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        default="none"
      >
        <Hero />
        <WorkSpine />
      </ViewTransition>
    </>
  );
}
