import { Annotation } from "@/components/ui/Annotation";
import { MetaballText } from "@/components/ui/MetaballText";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { CtaBand, GlowOrbs } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { PROJECTS, projectPath } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";
import { rise } from "@/lib/rise";
import { absoluteUrl, breadcrumbList, graph, webPage, type Crumb } from "@/lib/structured-data";

const PATH = "/work";
const TITLE = "Case Studies";
const DESCRIPTION =
  "Websites and online stores designed and built by SPARK for businesses in Casablanca and across Morocco: e-commerce, SaaS, corporate and lead-generation sites.";
const CRUMBS: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Work", path: PATH },
];

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function WorkPage() {
  const jsonLd = graph(
    webPage(PATH, { type: "CollectionPage", name: TITLE, description: DESCRIPTION, breadcrumb: true }),
    breadcrumbList(PATH, CRUMBS),
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl(PATH)}#list`,
      name: "SPARK case studies",
      itemListElement: PROJECTS.map((project, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(projectPath(project.slug)),
        name: project.title,
      })),
    },
  );

  return (
    <Reveal>
      <JsonLd data={jsonLd} />
      <PageHeader crumbs={CRUMBS}>
        <Annotation className="mt-10" {...rise(0.1)}>
          Selected work, shipped &amp; live
        </Annotation>
        <MetaballText
          as="h1"
          reveal="intro"
          text="Case studies"
          hoverColor="var(--cat-commerce)"
          className="mt-5 max-w-[16ch] font-display text-section font-bold uppercase"
        />
        <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-primary/75" {...rise(0.45)}>
          Online stores, a SaaS landing page and corporate and lead-generation sites, designed and built by SPARK for
          businesses in Casablanca and across Morocco. Each case study walks through the brief and what we delivered.
        </p>
      </PageHeader>

      <section aria-label="All case studies" className="shell relative pb-8">
        <GlowOrbs className="-inset-x-[6%] -inset-y-[4%]" />
        <ul className="relative grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            // The first row is on screen at load: it rises in with the header; the rest wipe in on scroll.
            <li key={project.slug} {...(i < 3 ? rise(0.6 + i * 0.08) : {})}>
              <ProjectCard project={project} level="h2" />
            </li>
          ))}
        </ul>
      </section>

      <CtaBand
        title="Your project could be next"
        text="Tell us about your business and what you need online. We'll come back with how we'd approach it."
      />
    </Reveal>
  );
}
