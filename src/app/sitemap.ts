import type { MetadataRoute } from "next";
import { site, sections } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/info`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...sections
      .filter((s) => s.id !== "home")
      .map((s) => ({
        url: `${site.url}/info#${s.id}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ];
}
