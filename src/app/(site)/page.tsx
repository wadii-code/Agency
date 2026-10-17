import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Showcase from "@/components/Showcase";
import { JsonLd } from "@/components/JsonLd";
import { PROJECTS, projectPath } from "@/lib/projects";
import { ORGANIZATION_ID, absoluteUrl, graph, webPage } from "@/lib/structured-data";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* The home page is about the studio, and lists its case studies. */
const jsonLd = graph(
  webPage("/", { name: SITE_TITLE, description: SITE_DESCRIPTION, about: { "@id": ORGANIZATION_ID } }),
  {
    "@type": "ItemList",
    "@id": `${absoluteUrl("/")}#work`,
    name: "Selected work",
    itemListElement: PROJECTS.map((project, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(projectPath(project.slug)),
      name: project.title,
    })),
  },
);

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <Manifesto />
      <Services />
      <Process />
      <Showcase />
    </>
  );
}
