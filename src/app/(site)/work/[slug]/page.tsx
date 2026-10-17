import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MetaballText } from "@/components/ui/MetaballText";
import { Pill } from "@/components/ui/Pill";
import { SparkGlyph } from "@/components/ui/SparkLogo";
import { PageHeader } from "@/components/PageHeader";
import { PageSection } from "@/components/PageSection";
import { ProjectCard } from "@/components/ProjectCard";
import { CaseStudyPreview } from "@/components/CaseStudyPreview";
import { CtaBand, GlowOrbs } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { categories } from "@/lib/taxonomy";
import { SERVICE_DETAILS, servicePath } from "@/lib/services";
import { PROJECTS, projectBySlug, projectPath, type PreviewTile } from "@/lib/projects";
import { pageMetadata } from "@/lib/metadata";
import { rise } from "@/lib/rise";
import { ORGANIZATION_ID, absoluteUrl, breadcrumbList, graph, serviceId, webPage, type Crumb } from "@/lib/structured-data";

// Fully static: an unknown slug waits for the render instead of streaming a shell, so it gets a real 404.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.title}: ${project.type}`,
    description: project.summary,
    path: projectPath(project.slug),
  });
}

/** The top of a full-page capture, framed like a screen; it wipes in like the home page's work cards. */
function Screen({ tile, alt, sizes, frame, screen }: { tile?: PreviewTile; alt: string; sizes: string; frame: string; screen: string }) {
  if (!tile) return null;
  return (
    <div data-wipe className={frame}>
      <div className={`relative overflow-hidden bg-white/[0.04] ${screen}`}>
        <div data-zoom className="absolute inset-0">
          <Image src={tile.src} alt={alt} fill sizes={sizes} className="object-cover object-top" />
        </div>
      </div>
    </div>
  );
}

const label = "font-mono text-[11px] uppercase tracking-[0.16em] text-muted";

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();

  const { slug, title, type, category, summary, highlights, cover, previews } = project;
  const path = projectPath(slug);
  const { name: categoryName, color } = categories[category];
  const service = SERVICE_DETAILS[category];
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: title, path },
  ];
  const index = PROJECTS.indexOf(project);
  const previous = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  // Same discipline first, then the rest.
  const more = [
    ...PROJECTS.filter((p) => p !== project && p.category === category),
    ...PROJECTS.filter((p) => p !== project && p.category !== category),
  ].slice(0, 3);

  const jsonLd = graph(
    {
      "@type": "CreativeWork",
      "@id": `${absoluteUrl(path)}#work`,
      name: title,
      headline: `${title}: ${type}`,
      description: summary,
      genre: type,
      keywords: highlights.join(", "),
      url: absoluteUrl(path),
      image: absoluteUrl(cover),
      inLanguage: "en",
      creator: { "@id": ORGANIZATION_ID },
      about: { "@id": serviceId(servicePath(category)) },
    },
    webPage(path, {
      type: "ItemPage",
      name: `${title}: ${type}`,
      description: summary,
      about: { "@id": `${absoluteUrl(path)}#work` },
      breadcrumb: true,
    }),
    breadcrumbList(path, crumbs),
  );

  return (
    <Reveal>
      <article>
        <JsonLd data={jsonLd} />
        <PageHeader crumbs={crumbs}>
          <a
            href={servicePath(category)}
            className="mt-10 inline-flex items-center gap-2 text-[14px] font-medium uppercase tracking-[0.08em] underline-offset-4 hover:underline"
            {...rise(0.1, { color })}
          >
            <SparkGlyph className="size-2.5" />
            {categoryName}
          </a>
          <MetaballText
            as="h1"
            reveal="intro"
            text={title}
            hoverColor={color}
            className="mt-5 font-display text-section font-bold uppercase"
          />
          <p className="mt-3 text-[18px] text-muted" {...rise(0.35)}>
            {type}
          </p>
          <p className="mt-6 max-w-[60ch] text-[18px] leading-relaxed text-primary/80" {...rise(0.45)}>
            {summary}
          </p>
          <div className="mt-10 flex flex-wrap gap-3" {...rise(0.55)}>
            <Pill href="#contact" variant="gradient" data-contact aria-haspopup="dialog">
              Start a similar project
            </Pill>
            <CaseStudyPreview slug={slug} />
          </div>
        </PageHeader>

        {/* The viewer grows out of (and shrinks back into) this cover. */}
        <figure data-project={slug} className="shell" {...rise(0.65)}>
          <div className="glass rounded-[1.5rem] p-2.5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-white/[0.04]">
              <Image
                src={cover}
                alt={`Homepage of ${title}, designed and built by SPARK`}
                fill
                priority
                sizes="(min-width: 1680px) 1560px, 94vw"
                className="intro-settle object-cover object-left-top"
              />
            </div>
          </div>
        </figure>

        <div className="h-20 md:h-28" />
        <PageSection titleId="about-title" title="About the project" color={color}>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-6 text-[18px] leading-[1.7] text-primary/75 lg:col-span-7">
              <p data-fade>{summary}</p>
              <p data-fade>
                Designed and built by SPARK, and live today. The screens below are captures of the real site, with domains and
                emails blurred.{" "}
                <a href={servicePath(category)} className="text-primary underline underline-offset-4 hover:no-underline">
                  How we approach {service.title}
                </a>
                .
              </p>
            </div>
            <dl className="grid content-start gap-6 border-t border-hairline pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div data-fade>
                <dt className={label}>Sector</dt>
                <dd className="mt-2 text-[17px]">{type}</dd>
              </div>
              <div data-fade>
                <dt className={label}>Discipline</dt>
                <dd className="mt-2 text-[17px]">
                  <a href={servicePath(category)} className="underline-offset-4 hover:underline">
                    {categoryName}
                  </a>
                </dd>
              </div>
              <div data-fade>
                <dt className={label}>Highlights</dt>
                <dd className="mt-3">
                  <ul className="flex flex-wrap gap-2">
                    {highlights.map((highlight) => (
                      <li key={highlight} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[13px]">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div data-fade>
                <dt className={label}>Status</dt>
                <dd className="mt-2 inline-flex items-center gap-2 text-[17px]">
                  <span className="relative size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-infra/70" />
                    <span className="absolute inset-0 rounded-full bg-infra" />
                  </span>
                  Live
                </dd>
              </div>
            </dl>
          </div>
        </PageSection>

        <PageSection titleId="screens-title" title="On desktop and mobile" color={color}>
          <div className="relative">
            <GlowOrbs />
            <div className="relative grid items-start gap-6 lg:grid-cols-12">
              <Screen
                tile={previews.desktop?.tiles[0]}
                alt={`${title} on desktop`}
                sizes="(min-width: 1024px) 66vw, 94vw"
                frame="glass rounded-[1.25rem] p-2.5 lg:col-span-8"
                screen="aspect-[16/11] rounded-[0.8rem]"
              />
              <Screen
                tile={previews.mobile?.tiles[0]}
                alt={`${title} on mobile`}
                sizes="300px"
                frame="mx-auto w-full max-w-[300px] rounded-[40px] border border-white/15 bg-black p-2 lg:col-span-4"
                screen="aspect-[9/19] rounded-[32px]"
              />
            </div>
          </div>
        </PageSection>

        {/* Previous / next */}
        <nav aria-label="More case studies" className="shell">
          <div data-divider className="h-px bg-hairline" />
          <ul className="grid sm:grid-cols-2">
            <li data-fade>
              <a href={projectPath(previous.slug)} className="group flex flex-col gap-2 py-10 sm:pr-8">
                <span className={`inline-flex items-center gap-2 ${label}`}>
                  <ArrowLeft
                    aria-hidden
                    className="size-3.5 transition-transform duration-500 ease-expo group-hover:-translate-x-1"
                    strokeWidth={1.5}
                  />
                  Previous
                </span>
                <span className="font-display text-[22px] font-medium uppercase transition-[translate] duration-500 ease-expo group-hover:-translate-x-1 md:text-[28px]">
                  {previous.title}
                </span>
              </a>
            </li>
            <li data-fade className="border-t border-hairline sm:border-l sm:border-t-0">
              <a href={projectPath(next.slug)} className="group flex flex-col items-end gap-2 py-10 text-right sm:pl-8">
                <span className={`inline-flex items-center gap-2 ${label}`}>
                  Next
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="font-display text-[22px] font-medium uppercase transition-[translate] duration-500 ease-expo group-hover:translate-x-1 md:text-[28px]">
                  {next.title}
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <PageSection titleId="more-title" title="More work" color={color}>
          <div className="relative">
            <GlowOrbs />
            <ul className="relative grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {more.map((other) => (
                <li key={other.slug}>
                  <ProjectCard project={other} />
                </li>
              ))}
            </ul>
          </div>
        </PageSection>

        <CtaBand
          title={`Want something like ${title}?`}
          text="Tell us about your business and what you need online. We'll come back with how we'd approach it."
        />
      </article>
    </Reveal>
  );
}
