import type { MetadataRoute } from "next";

import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.meta.url, changeFrequency: "monthly", priority: 1 },
    ...site.projects.map((project) => ({
      url: `${site.meta.url}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
