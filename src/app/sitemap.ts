import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
      // The showcase screenshots, so they can surface in image search.
      images: PROJECTS.map((project) => `${SITE_URL}${project.cover}`),
    },
  ];
}
