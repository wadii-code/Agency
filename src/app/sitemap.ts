import type { MetadataRoute } from "next";
import { categoryOrder } from "@/lib/taxonomy";
import { servicePath } from "@/lib/services";
import { PROJECTS, projectPath } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

const url = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: url("/"),
      changeFrequency: "monthly",
      priority: 1,
      // The showcase screenshots, so they can surface in image search.
      images: PROJECTS.map((project) => url(project.cover)),
    },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    ...categoryOrder.map((id) => ({ url: url(servicePath(id)), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: url("/work"), changeFrequency: "monthly", priority: 0.8 },
    ...PROJECTS.map((project) => ({
      url: url(projectPath(project.slug)),
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: [url(project.cover)],
    })),
  ];
}
